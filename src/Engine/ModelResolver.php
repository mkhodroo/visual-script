<?php

namespace VisualScript\Engine;

use RuntimeException;

/**
 * مدل‌های Eloquent فقط از طریق لیست سفید config('visual-script.models') قابل دسترس هستند
 * تا کاربرِ ویرایشگر ویژوال نتواند به مدل‌های حساس دلخواه (مثل جدول کاربران بدون اجازه) برسد.
 */
class ModelResolver
{
    public static function resolve(string $name): string
    {
        $models = config('visual-script.models', []);

        if (! isset($models[$name])) {
            throw new RuntimeException("مدل «{$name}» در تنظیمات (config/visual-script.php) مجاز نشده است.");
        }

        return $models[$name];
    }

    public static function allowedFields(string $name): ?array
    {
        return config("visual-script.allowed_fields.{$name}");
    }

    public static function allowedWriteFields(string $name): ?array
    {
        return config("visual-script.allowed_write_fields.{$name}");
    }
}
