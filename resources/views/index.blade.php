@extends('visual-script::layout')

@section('title', 'لیست اسکریپت‌ها')

@section('content')
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h2 style="margin:0;">اسکریپت‌ها</h2>
        <a href="{{ route('visual-script.create') }}" class="vs-btn">+ اسکریپت جدید</a>
    </div>

    <div class="vs-card">
        <table>
            <thead>
                <tr><th>نام</th><th>اسلاگ (برای API)</th><th>وضعیت</th><th>آخرین بروزرسانی</th><th></th></tr>
            </thead>
            <tbody>
                @forelse ($scripts as $script)
                    <tr>
                        <td>{{ $script->name }}</td>
                        <td><code>{{ $script->slug }}</code></td>
                        <td>{{ $script->is_active ? '✅ فعال' : '⛔️ غیرفعال' }}</td>
                        <td>{{ $script->updated_at->diffForHumans() }}</td>
                        <td style="white-space:nowrap;">
                            <a href="{{ route('visual-script.edit', $script) }}" class="vs-btn small">ویرایش</a>
                            <form action="{{ route('visual-script.destroy', $script) }}" method="POST" style="display:inline" onsubmit="return confirm('این اسکریپت حذف شود؟')">
                                @csrf @method('DELETE')
                                <button type="submit" class="vs-btn small danger" style="border:none;">حذف</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="5">هنوز اسکریپتی ثبت نشده است.</td></tr>
                @endforelse
            </tbody>
        </table>
    </div>
    {{ $scripts->links() }}
@endsection
