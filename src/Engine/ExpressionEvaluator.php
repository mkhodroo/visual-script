<?php

namespace VisualScript\Engine;

use Symfony\Component\ExpressionLanguage\ExpressionLanguage;

/**
 * ارزیابی امنِ عبارات شرطی/محاسباتی که کاربر در نودهای «شرط» و «تنظیم متغیر» وارد می‌کند.
 * از Symfony ExpressionLanguage استفاده می‌شود که برخلاف eval() اجازه‌ی فراخوانی
 * توابع دلخواه PHP یا دسترسی به سیستم را نمی‌دهد؛ فقط متغیرهای context و توابعی که
 * صراحتا register شده‌اند در دسترس هستند.
 */
class ExpressionEvaluator
{
    protected ExpressionLanguage $language;

    public function __construct()
    {
        $this->language = new ExpressionLanguage();

        $this->language->register('count', fn ($str) => sprintf('count(%s)', $str),
            fn ($arguments, $value) => is_countable($value) ? count($value) : 0);

        $this->language->register('sum', fn ($str) => sprintf('array_sum(%s)', $str),
            fn ($arguments, $value) => is_array($value) ? array_sum($value) : 0);

        $this->language->register('empty', fn ($str) => sprintf('empty(%s)', $str),
            fn ($arguments, $value) => empty($value));
    }

    public function evaluate(string $expression, ExecutionContext $context): mixed
    {
        return $this->language->evaluate($expression, $context->all());
    }
}
