# Laravel Visual Script

پکیجی برای ساخت منطق برنامه به‌صورت **ویژوال / بلوکی** داخل لاراول — بدون نوشتن یا اجرای PHP خام از سمت کاربر.

## چرا PHP خام اجرا نمی‌شود؟
اجرای کد PHP دلخواهی که کاربر (حتی ادمین پنل) وارد می‌کند، یک ریسک امنیتی جدی است (RCE).
به‌جای آن، اسکریپت‌ها به‌صورت یک ساختار **JSON مبتنی بر نود (Node)** ذخیره می‌شوند و توسط
`ScriptEngine` داخل پکیج تفسیر و اجرا می‌شوند. کاربر در پنل وب فقط با کلیک،
نودها را می‌چیند؛ خروجی نهایی JSON است، نه کد.

## نودهای موجود
| نود | معادل با |
|---|---|
| `query` | فراخوانی از دیتابیس (Eloquent) + شرط‌های where |
| `condition` | if / else |
| `foreach` | حلقه روی نتیجه‌ی کوئری یا هر متغیر iterable |
| `set_variable` | تعریف/محاسبه‌ی متغیر با یک expression |
| `return` | بازگشت خروجی نهایی |

می‌توانید نودهای اختصاصی خودتان (مثلا `send_notification`) را هم اضافه کنید:
```php
app(\VisualScript\Engine\ScriptEngine::class)->extendNode('send_notification', new MyNode());
```

## نصب

1. کد پکیج را در `packages/yourvendor/laravel-visual-script` پروژه‌ی لاراول قرار دهید.
2. در `composer.json` پروژه، ریپازیتوری path اضافه کنید:
```json
"repositories": [
    { "type": "path", "url": "packages/yourvendor/laravel-visual-script" }
],
"require": {
    "yourvendor/laravel-visual-script": "*"
}
```
3. نصب:
```bash
composer update yourvendor/laravel-visual-script
```
4. اجرای مایگریشن‌ها (دو جدول: `visual_scripts` و `visual_script_logs`):
```bash
php artisan migrate
```
5. انتشار کانفیگ:
```bash
php artisan vendor:publish --tag=visual-script-config
php artisan vendor:publish --tag=visual-script-assets
```
6. در `config/visual-script.php` مدل‌هایی که می‌خواهید در نود «فراخوانی از دیتابیس» در دسترس باشند را
   با یک لیست سفید معرفی کنید (این بخش برای امنیت اجباری است):
```php
'models' => [
    'Post' => \App\Models\Post::class,
    'User' => \App\Models\User::class,
],
'allowed_fields' => [
    'Post' => ['id', 'title', 'status', 'created_at'],
],
```

## استفاده

- پنل مدیریت اسکریپت‌ها: `/visual-script`
- ساخت اسکریپت جدید، چیدن نودها (فراخوانی از دیتابیس → شرط → حلقه → خروجی) و «اجرای آزمایشی» با ورودی تستی.
- بعد از ذخیره، هر اسکریپت یک اسلاگ می‌گیرد و از طریق API قابل اجراست:
```
POST /api/visual-script/run/{slug}
Body (JSON): { "user_id": 5 }
```

## اجرای برنامه‌نویسی (بدون پنل)
```php
use VisualScript\Engine\ScriptEngine;
use VisualScript\Models\Script;

$script = Script::where('slug', 'my-script-ab12cd')->firstOrFail();

$result = app(ScriptEngine::class)->run($script->definition, [
    'user_id' => auth()->id(),
]);
```

## نمونه‌ی ساختار یک اسکریپت (همانی که ویرایشگر تولید می‌کند)
```json
{
  "variables": {},
  "nodes": [
    {
      "type": "query",
      "model": "Post",
      "conditions": [
        { "field": "status", "operator": "=", "value": "published" }
      ],
      "order_by": { "field": "created_at", "direction": "desc" },
      "limit": 20,
      "first": false,
      "output": "posts"
    },
    {
      "type": "condition",
      "expression": "count(posts) > 0",
      "then": [
        {
          "type": "foreach",
          "source": "posts",
          "as": "post",
          "body": [
            { "type": "set_variable", "name": "title_upper", "expression": "post.title" }
          ],
          "output": "titles"
        },
        { "type": "return", "expression": "titles" }
      ],
      "else": [
        { "type": "return", "expression": "[]" }
      ]
    }
  ]
}
```

## نکات امنیتی مهم
- فقط مدل‌های داخل لیست سفید `config('visual-script.models')` قابل کوئری هستند.
- `allowed_fields` برای هر مدل، فیلدهای قابل شرط‌گذاری را محدود می‌کند (توصیه می‌شود همیشه پر شود).
- عبارت‌های شرط/متغیر با Symfony ExpressionLanguage ارزیابی می‌شوند، نه `eval()`؛ فراخوانی توابع دلخواه PHP یا کلاس‌ها ممکن نیست.
- `max_query_limit`، `max_loop_iterations` و `max_nesting_depth` در کانفیگ از کوئری‌های سنگین و حلقه‌های بی‌نهایت جلوگیری می‌کنند.
- روت پنل مدیریت (`/visual-script`) فقط میدلور `web` دارد؛ در محیط پروداکشن حتما یک میدلور احراز هویت/نقش
  (مثل `auth`, `can:manage-scripts`) به `middleware` در `config/visual-script.php` اضافه کنید، چون این پنل
  دسترسی به دیتابیس می‌دهد.

## ساختار پکیج
```
src/
  VisualScriptServiceProvider.php
  Engine/
    ScriptEngine.php          نقطه‌ی ورود اجرای اسکریپت
    NodeRegistry.php          نگاشت نوع نود -> کلاس اجراکننده
    NodeRunner.php            اجرای متوالی یک لیست نود
    ExecutionContext.php      متغیرهای در حال اجرا
    ExpressionEvaluator.php   ارزیابی امن عبارات
    ModelResolver.php         لیست سفید مدل‌ها
    Nodes/
      QueryNode.php
      ConditionNode.php
      ForeachNode.php
      SetVariableNode.php
      ReturnNode.php
  Models/
    Script.php
    ScriptLog.php
  Http/Controllers/
    ScriptController.php      CRUD پنل وب
    ScriptRunController.php   اجرای API + preview
database/migrations/
  ..._create_visual_scripts_table.php
  ..._create_visual_script_logs_table.php
routes/
  web.php
  api.php
config/
  visual-script.php
resources/
  views/ (layout, index, builder)
  js/builder.js               ویرایشگر ویژوال (Vanilla JS)
```
