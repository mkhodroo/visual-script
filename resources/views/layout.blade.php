<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'ویژوال اسکریپت')</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: Tahoma, "Segoe UI", sans-serif; background:#f3f4f6; margin:0; color:#111827; }
        .vs-header { background:#1f2937; color:#fff; padding:14px 24px; display:flex; justify-content:space-between; align-items:center; }
        .vs-header a { color:#93c5fd; text-decoration:none; }
        .vs-container { padding:24px; max-width:1300px; margin:0 auto; }
        .vs-btn { display:inline-block; padding:8px 16px; background:#2563eb; color:#fff; border:none; border-radius:6px; cursor:pointer; text-decoration:none; font-size:14px; }
        .vs-btn.secondary { background:#6b7280; }
        .vs-btn.danger { background:#dc2626; }
        .vs-btn.small { padding:4px 10px; font-size:12px; }
        .vs-card { background:#fff; border-radius:8px; padding:16px; margin-bottom:14px; box-shadow:0 1px 3px rgba(0,0,0,.08); }
        table { width:100%; border-collapse:collapse; }
        th, td { text-align:right; padding:10px; border-bottom:1px solid #e5e7eb; font-size:14px; }
        input[type=text], input[type=number], select, textarea { padding:6px 8px; border:1px solid #d1d5db; border-radius:6px; font-family:inherit; font-size:13px; }
    </style>
    @stack('styles')
</head>
<body>
    <div class="vs-header">
        <strong>⚡ ویژوال اسکریپت</strong>
        <a href="{{ route('visual-script.index') }}">لیست اسکریپت‌ها</a>
    </div>
    <div class="vs-container">
        @if (session('status'))
            <div class="vs-card" style="background:#dcfce7; color:#166534;">{{ session('status') }}</div>
        @endif
        @yield('content')
    </div>
    @stack('scripts')
</body>
</html>
