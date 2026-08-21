<?php

namespace VisualScript\Engine;

/**
 * نگهدارنده‌ی متغیرهای در حال اجرای یک اسکریپت (چیزی شبیه به «حافظه» اسکریپت).
 */
class ExecutionContext
{
    protected array $variables = [];

    public bool $shouldReturn = false;
    public mixed $returnValue = null;
    public int $depth = 0;

    public function set(string $name, mixed $value): void
    {
        $this->variables[$name] = $value;
    }

    public function get(string $name, mixed $default = null): mixed
    {
        return $this->variables[$name] ?? $default;
    }

    public function all(): array
    {
        return $this->variables;
    }

    public function has(string $name): bool
    {
        return array_key_exists($name, $this->variables);
    }
}
