<?php

namespace VisualScript\Engine\Contracts;

use VisualScript\Engine\ExecutionContext;

interface NodeInterface
{
    public function execute(array $node, ExecutionContext $context): mixed;
}
