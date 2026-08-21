<?php

namespace VisualScript\Engine;

use RuntimeException;

/**
 * لیستی از نودها را به‌ترتیب اجرا می‌کند و مسئول محدود کردن عمق تودرتو بودن آنهاست.
 */
class NodeRunner
{
    public function __construct(protected NodeRegistry $registry) {}

    public function run(array $nodes, ExecutionContext $context): mixed
    {
        $context->depth++;

        if ($context->depth > (int) config('visual-script.max_nesting_depth', 15)) {
            throw new RuntimeException('عمق تودرتو بودن نودها از حد مجاز بیشتر شد.');
        }

        $last = null;

        foreach ($nodes as $node) {
            if ($context->shouldReturn) {
                break;
            }

            if (empty($node['type'])) {
                continue;
            }

            $handler = $this->registry->get($node['type']);
            $last = $handler->execute($node, $context);
        }

        $context->depth--;

        return $context->shouldReturn ? $context->returnValue : $last;
    }
}
