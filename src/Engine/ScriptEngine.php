<?php

namespace VisualScript\Engine;

use VisualScript\Engine\Contracts\NodeInterface;

/**
 * نقطه‌ی ورودی اصلی برای اجرای یک تعریف اسکریپت ویژوال.
 *
 * مثال استفاده:
 *   $engine = app(ScriptEngine::class);
 *   $result = $engine->run($script->definition, ['user_id' => 5]);
 */
class ScriptEngine
{
    protected NodeRegistry $registry;
    protected NodeRunner $runner;

    public function __construct()
    {
        $this->registry = new NodeRegistry();
        $this->runner = new NodeRunner($this->registry);
        $this->registry->registerRunner($this->runner);
    }

    /**
     * @param array $definition ['variables' => [...], 'nodes' => [...]]
     * @param array $input متغیرهای ورودی که از بیرون به اسکریپت پاس داده می‌شوند (روی variables اولویت دارند)
     */
    public function run(array $definition, array $input = []): mixed
    {
        $context = new ExecutionContext();

        foreach (array_merge($definition['variables'] ?? [], $input) as $key => $value) {
            $context->set($key, $value);
        }

        return $this->runner->run($definition['nodes'] ?? [], $context);
    }

    /**
     * افزودن نود اختصاصی از بیرون پکیج، مثلا:
     *   $engine->extendNode('send_notification', new SendNotificationNode());
     */
    public function extendNode(string $type, NodeInterface $handler): void
    {
        $this->registry->register($type, $handler);
    }
}
