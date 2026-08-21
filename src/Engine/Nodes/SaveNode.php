<?php

namespace VisualScript\Engine\Nodes;

use RuntimeException;
use VisualScript\Engine\Contracts\NodeInterface;
use VisualScript\Engine\ExecutionContext;
use VisualScript\Engine\ModelResolver;

class SaveNode implements NodeInterface
{
    public function execute(array $node, ExecutionContext $context): mixed
    {
        $modelName = $node['model'] ?? null;

        if (! $modelName) {
            throw new RuntimeException('مدل برای نود ذخیره مشخص نشده است.');
        }

        $modelClass = ModelResolver::resolve($modelName);

        $operation = $node['operation'] ?? 'create';

        if (! in_array($operation, ['create', 'update'], true)) {
            throw new RuntimeException(
                "عملیات «{$operation}» برای ذخیره اطلاعات مجاز نیست."
            );
        }

        $allowedFields = ModelResolver::allowedWriteFields($modelName);

        $fields = $node['fields'] ?? [];

        if (! is_array($fields)) {
            throw new RuntimeException('فیلدهای ذخیره باید به صورت آرایه باشند.');
        }

        $data = [];

        foreach ($fields as $field => $value) {

            if ($allowedFields && ! in_array($field, $allowedFields, true)) {
                throw new RuntimeException(
                    "فیلد «{$field}» برای مدل «{$modelName}» مجاز نیست."
                );
            }

            /*
             * اگر مقدار با $ شروع شود،
             * مقدار از ExecutionContext خوانده می‌شود.
             *
             * مثال:
             * $name
             * $email
             * $user_id
             */
            if (is_string($value) && str_starts_with($value, '$')) {
                $variableName = substr($value, 1);

                $value = $context->get($variableName);
            }

            $data[$field] = $value;
        }

        /*
         * ایجاد رکورد جدید
         */
        if ($operation === 'create') {

            $record = $modelClass::create($data);
        }

        /*
         * بروزرسانی رکورد
         */
        else {

            $recordId = $node['record_id'] ?? null;

            if (is_string($recordId) && str_starts_with($recordId, '$')) {
                $recordId = $context->get(substr($recordId, 1));
            }

            if ($recordId === null || $recordId === '') {
                throw new RuntimeException(
                    'برای عملیات بروزرسانی باید شناسه رکورد مشخص شود.'
                );
            }

            $record = $modelClass::query()->find($recordId);

            if (! $record) {
                throw new RuntimeException(
                    "رکورد با شناسه «{$recordId}» پیدا نشد."
                );
            }

            $record->fill($data);
            $record->save();
        }

        /*
         * ذخیره نتیجه در متغیر Context
         */
        if (! empty($node['output'])) {
            $context->set($node['output'], $record);
        }

        return $record;
    }
}