<?php

namespace VisualScript\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Throwable;
use VisualScript\Engine\ScriptEngine;
use VisualScript\Models\Script;
use VisualScript\Models\ScriptLog;

class ScriptRunController extends Controller
{
    public function __construct(protected ScriptEngine $engine) {}

    /**
     * اجرای یک اسکریپت ذخیره‌شده از طریق اسلاگ آن؛ این همان روتِ API عمومی است
     * که می‌توانید از بیرون (مثلا از یک فرانت‌اند دیگر) صدا بزنید.
     */
    public function run(Request $request, string $slug)
    {
        $script = Script::where('slug', $slug)->where('is_active', true)->firstOrFail();

        $input = $request->all();
        $start = microtime(true);

        try {
            $result = $this->engine->run($script->definition, $input);

            ScriptLog::create([
                'visual_script_id' => $script->id,
                'input' => $input,
                'output' => is_scalar($result) || $result === null ? ['value' => $result] : $result,
                'status' => 'success',
                'duration_ms' => (int) ((microtime(true) - $start) * 1000),
            ]);

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Throwable $e) {
            ScriptLog::create([
                'visual_script_id' => $script->id,
                'input' => $input,
                'status' => 'error',
                'error_message' => $e->getMessage(),
                'duration_ms' => (int) ((microtime(true) - $start) * 1000),
            ]);

            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    /**
     * اجرای آزمایشی از داخل ویرایشگر ویژوال، بدون نیاز به ذخیره‌ی قبلی اسکریپت.
     */
    public function preview(Request $request)
    {
        $data = $request->validate([
            'definition' => 'required|array',
            'input' => 'nullable|array',
        ]);

        try {
            $result = $this->engine->run($data['definition'], $data['input'] ?? []);

            return response()->json(['success' => true, 'data' => $result]);
        } catch (Throwable $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
