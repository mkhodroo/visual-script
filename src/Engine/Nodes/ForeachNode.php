<?php

namespace VisualScript\Engine\Nodes;

use RuntimeException;
use VisualScript\Engine\Contracts\NodeInterface;
use VisualScript\Engine\ExecutionContext;
use VisualScript\Engine\NodeRunner;

/**
 * نود «حلقه» (foreach)
 *
 * [
 *   'type' => 'foreach',
 *   'source' => 'posts',   // نام متغیری که باید پیمایش شود
 *   'as' => 'post',        // نام متغیر موقت هر آیتم
 *   'body' => [ ...نودها... ],
 *   'output' => 'results', // اختیاری: جمع‌آوری نتیجه‌ی هر تکرار
 * ]
 */
class ForeachNode implements NodeInterface
{
    public function __construct(protected NodeRunner $runner) {}

    public function execute(array $node, ExecutionContext $context): mixed
    {
        $source = $context->get($node['source'] ?? '');

        if (! is_iterable($source)) {
            throw new RuntimeException("متغیر «{$node['source']}» قابل پیمایش (iterable) نیست.");
        }

        $maxIterations = (int) config('visual-script.max_loop_iterations', 1000);
        $collected = [];
        $i = 0;

        foreach ($source as $item) {
            if (++$i > $maxIterations) {
                throw new RuntimeException('تعداد تکرار حلقه از حد مجاز بیشتر شد.');
            }

            $context->set($node['as'] ?? 'item', $item);
            $itemResult = $this->runner->run($node['body'] ?? [], $context);

            if ($context->shouldReturn) {
                if (! empty($node['output'])) {
                    $context->set($node['output'], $collected);
                }

                return $itemResult;
            }

            if ($itemResult !== null) {
                $collected[] = $itemResult;
            }
        }

        if (! empty($node['output'])) {
            $context->set($node['output'], $collected);
        }

        return $collected;
    }
}
