<?php

namespace VisualScript\Engine\Nodes;

use VisualScript\Engine\Contracts\NodeInterface;
use VisualScript\Engine\ExecutionContext;
use VisualScript\Engine\ExpressionEvaluator;
use VisualScript\Engine\NodeRunner;

/**
 * نود «شرط»
 *
 * [
 *   'type' => 'condition',
 *   'expression' => 'count(posts) > 0 and posts != null',
 *   'then' => [ ...نودها... ],
 *   'else' => [ ...نودها... ],
 * ]
 */
class ConditionNode implements NodeInterface
{
    public function __construct(protected ExpressionEvaluator $evaluator, protected NodeRunner $runner) {}

    public function execute(array $node, ExecutionContext $context): mixed
    {
        $result = $this->evaluator->evaluate($node['expression'] ?? 'false', $context);

        $branch = $result ? ($node['then'] ?? []) : ($node['else'] ?? []);

        return $this->runner->run($branch, $context);
    }
}
