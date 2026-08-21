<?php

namespace VisualScript\Engine;

use RuntimeException;
use VisualScript\Engine\Contracts\NodeInterface;
use VisualScript\Engine\Nodes\ConditionNode;
use VisualScript\Engine\Nodes\ForeachNode;
use VisualScript\Engine\Nodes\QueryNode;
use VisualScript\Engine\Nodes\ReturnNode;
use VisualScript\Engine\Nodes\SaveNode;
use VisualScript\Engine\Nodes\SetVariableNode;

/**
 * نگهدارنده‌ی نگاشتِ «نوع نود» => «کلاس اجراکننده‌ی آن».
 * توسعه‌دهنده‌ی پروژه می‌تواند از طریق ScriptEngine::extendNode() نود اختصاصی خودش را هم اضافه کند.
 */
class NodeRegistry
{
    /** @var array<string, NodeInterface> */
    protected array $handlers = [];

    public function __construct()
    {
        $evaluator = new ExpressionEvaluator();

        $this->handlers = [
            'query' => new QueryNode(),
            'save' => new SaveNode(),
            'set_variable' => new SetVariableNode($evaluator),
            'return' => new ReturnNode($evaluator),
        ];
    }

    /**
     * ConditionNode و ForeachNode به NodeRunner نیاز دارند تا بتوانند نودهای فرزند خود
     * (then/else/body) را اجرا کنند؛ به همین دلیل بعد از ساخته شدن NodeRunner، اینجا ثبت می‌شوند.
     */
    public function registerRunner(NodeRunner $runner): void
    {
        $evaluator = new ExpressionEvaluator();
        $this->handlers['condition'] = new ConditionNode($evaluator, $runner);
        $this->handlers['foreach'] = new ForeachNode($runner);
    }

    public function register(string $type, NodeInterface $handler): void
    {
        $this->handlers[$type] = $handler;
    }

    public function get(string $type): NodeInterface
    {
        if (! isset($this->handlers[$type])) {
            throw new RuntimeException("نوع نود «{$type}» ناشناخته است.");
        }

        return $this->handlers[$type];
    }
}
