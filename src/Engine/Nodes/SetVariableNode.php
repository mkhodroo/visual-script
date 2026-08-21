<?php

namespace VisualScript\Engine\Nodes;

use VisualScript\Engine\Contracts\NodeInterface;
use VisualScript\Engine\ExecutionContext;
use VisualScript\Engine\ExpressionEvaluator;

/**
 * نود «تنظیم متغیر»: [ 'type' => 'set_variable', 'name' => 'total', 'expression' => 'count(posts)' ]
 */
class SetVariableNode implements NodeInterface
{
    public function __construct(protected ExpressionEvaluator $evaluator) {}

    public function execute(array $node, ExecutionContext $context): mixed
    {
        $value = $this->evaluator->evaluate($node['expression'] ?? 'null', $context);
        $context->set($node['name'], $value);

        return $value;
    }
}
