<?php

namespace VisualScript\Engine\Nodes;

use VisualScript\Engine\Contracts\NodeInterface;
use VisualScript\Engine\ExecutionContext;
use VisualScript\Engine\ExpressionEvaluator;

/**
 * نود «خروجی»: [ 'type' => 'return', 'expression' => 'posts' ]
 */
class ReturnNode implements NodeInterface
{
    public function __construct(protected ExpressionEvaluator $evaluator) {}

    public function execute(array $node, ExecutionContext $context): mixed
    {
        $value = $this->evaluator->evaluate($node['expression'] ?? 'null', $context);
        $context->shouldReturn = true;
        $context->returnValue = $value;

        return $value;
    }
}
