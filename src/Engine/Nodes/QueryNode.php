<?php

namespace VisualScript\Engine\Nodes;

use RuntimeException;
use VisualScript\Engine\Contracts\NodeInterface;
use VisualScript\Engine\ExecutionContext;
use VisualScript\Engine\ModelResolver;

/**
 * نود «فراخوانی از دیتابیس»
 *
 * ساختار نود:
 * [
 *   'type' => 'query',
 *   'model' => 'Post',
 *   'conditions' => [ ['field' => 'status', 'operator' => '=', 'value' => 'published'] ],
 *   'order_by' => ['field' => 'created_at', 'direction' => 'desc'],
 *   'limit' => 10,
 *   'first' => false,      // اگر true فقط اولین رکورد برگردانده می‌شود
 *   'output' => 'posts',   // نام متغیری که نتیجه در آن ذخیره می‌شود
 * ]
 */
class QueryNode implements NodeInterface
{
    public function execute(array $node, ExecutionContext $context): mixed
    {
        $modelClass = ModelResolver::resolve($node['model']);
        $allowedFields = ModelResolver::allowedFields($node['model']);
        $allowedOperators = config('visual-script.allowed_operators', ['=']);

        $query = $modelClass::query();

        foreach ($node['conditions'] ?? [] as $condition) {
            $field = $condition['field'] ?? null;
            $operator = $condition['operator'] ?? '=';
            $value = $condition['value'] ?? null;

            if (! $field) {
                continue;
            }

            if ($allowedFields && ! in_array($field, $allowedFields, true)) {
                throw new RuntimeException("فیلد «{$field}» برای مدل «{$node['model']}» مجاز نیست.");
            }

            if (! in_array($operator, $allowedOperators, true)) {
                throw new RuntimeException("عملگر «{$operator}» مجاز نیست.");
            }

            // اگر مقدار به شکل "$name" باشد، از متغیرهای موجود در context خوانده می‌شود
            if (is_string($value) && str_starts_with($value, '$')) {
                $value = $context->get(substr($value, 1));
            }

            match ($operator) {
                'in' => $query->whereIn($field, (array) $value),
                'not in' => $query->whereNotIn($field, (array) $value),
                'null' => $query->whereNull($field),
                'not null' => $query->whereNotNull($field),
                'like' => $query->where($field, 'like', $value),
                default => $query->where($field, $operator, $value),
            };
        }

        if (! empty($node['order_by']['field'])) {
            $query->orderBy($node['order_by']['field'], $node['order_by']['direction'] ?? 'asc');
        }

        $limit = min((int) ($node['limit'] ?? 50), (int) config('visual-script.max_query_limit', 500));

        $result = ($node['first'] ?? false)
            ? $query->first()
            : $query->limit($limit)->get();

        if (! empty($node['output'])) {
            $context->set($node['output'], $result);
        }

        return $result;
    }
}
