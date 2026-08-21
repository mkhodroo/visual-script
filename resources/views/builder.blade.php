@extends('visual-script::layout')

@section('title', $script->exists ? 'ویرایش اسکریپت: '.$script->name : 'اسکریپت جدید')

@push('styles')
<style>
    .vs-node { border:1px solid #d1d5db; border-radius:8px; padding:10px; margin-bottom:8px; background:#f9fafb; }
    .vs-node-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .vs-node-badge { font-size:11px; padding:2px 8px; border-radius:999px; color:#fff; }
    .badge-query { background:#2563eb; }
    .badge-condition { background:#d97706; }
    .badge-foreach { background:#7c3aed; }
    .badge-set_variable { background:#059669; }
    .badge-return { background:#dc2626; }
    .vs-field-row { display:flex; gap:8px; margin-bottom:6px; flex-wrap:wrap; align-items:center; }
    .vs-field-row label { font-size:12px; color:#374151; min-width:70px; }
    .vs-children { border-right:3px solid #e5e7eb; padding-right:12px; margin-top:8px; margin-right:4px; }
    .vs-add-row { display:flex; gap:6px; margin-top:6px; flex-wrap:wrap; }
    .vs-palette button { font-size:12px; padding:5px 10px; border:1px solid #d1d5db; background:#fff; border-radius:6px; cursor:pointer; }
    .vs-cond-row { display:flex; gap:6px; margin-bottom:4px; align-items:center; }
    #vs-preview-output { white-space:pre-wrap; background:#111827; color:#a7f3d0; padding:12px; border-radius:8px; font-size:12px; max-height:300px; overflow:auto; }
</style>
@endpush

@section('content')
<div style="display:grid; grid-template-columns: 1fr 380px; gap:16px; align-items:start;">
    <div>
        <div class="vs-card">
            <div class="vs-field-row">
                <label>نام اسکریپت</label>
                <input type="text" id="vs-name" value="{{ old('name', $script->name) }}" style="flex:1;">
            </div>
            <div class="vs-field-row">
                <label>توضیحات</label>
                <input type="text" id="vs-description" value="{{ old('description', $script->description) }}" style="flex:1;">
            </div>
            <div class="vs-field-row">
                <label>فعال باشد؟</label>
                <input type="checkbox" id="vs-is-active" {{ $script->is_active ?? true ? 'checked' : '' }}>
            </div>
        </div>

        <div class="vs-card">
            <h3 style="margin-top:0;">بدنه‌ی اسکریپت (نودها)</h3>
            <div id="vs-root-nodes"></div>
            <div class="vs-palette vs-add-row" data-path="nodes"></div>
        </div>

        <div class="vs-card">
            <button type="button" class="vs-btn" onclick="vsSave()">💾 ذخیره اسکریپت</button>
            <button type="button" class="vs-btn secondary" onclick="vsRunPreview()">▶️ اجرای آزمایشی</button>
            <a href="{{ route('visual-script.index') }}" class="vs-btn secondary" style="text-decoration:none;">بازگشت</a>
        </div>
    </div>

    <div>
        <div class="vs-card">
            <h3 style="margin-top:0;">ورودی تست (JSON)</h3>
            <textarea id="vs-preview-input" rows="5" style="width:100%;">{}</textarea>
        </div>
        <div class="vs-card">
            <h3 style="margin-top:0;">خروجی اجرای آزمایشی</h3>
            <div id="vs-preview-output">هنوز اجرا نشده است.</div>
        </div>
        @if ($script->exists)
        <div class="vs-card">
            <h3 style="margin-top:0;">آدرس API این اسکریپت</h3>
            <code style="font-size:12px;">POST /api/{{ config('visual-script.route_prefix', 'visual-script') }}/run/{{ $script->slug }}</code>
        </div>
        @endif
    </div>
</div>

@if ($script->exists)
    <form id="vs-form" method="POST" action="{{ route('visual-script.update', $script) }}" style="display:none;">
        @csrf @method('PUT')
        <input type="hidden" name="name" id="vs-form-name">
        <input type="hidden" name="description" id="vs-form-description">
        <input type="hidden" name="is_active" id="vs-form-is-active">
        <input type="hidden" name="definition" id="vs-form-definition">
    </form>
@else
    <form id="vs-form" method="POST" action="{{ route('visual-script.store') }}" style="display:none;">
        @csrf
        <input type="hidden" name="name" id="vs-form-name">
        <input type="hidden" name="description" id="vs-form-description">
        <input type="hidden" name="is_active" id="vs-form-is-active">
        <input type="hidden" name="definition" id="vs-form-definition">
    </form>
@endif
@endsection

@push('scripts')
<script>
    window.VS_MODELS = @json($models);
    window.VS_INITIAL_DEFINITION = @json($script->definition ?? ['variables' => [], 'nodes' => []]);
    window.VS_PREVIEW_URL = "{{ route('visual-script.preview') }}";
    window.VS_CSRF = "{{ csrf_token() }}";
</script>
<script src="{{ asset('vendor/visual-script/js/builder.js') }}"></script>
@endpush
