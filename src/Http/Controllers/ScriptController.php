<?php

namespace VisualScript\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;
use VisualScript\Models\Script;

class ScriptController extends Controller
{
    public function index()
    {
        $scripts = Script::latest()->paginate(20);

        return view('visual-script::index', compact('scripts'));
    }

    public function create()
    {
        return view('visual-script::builder', [
            'script' => new Script(['definition' => ['variables' => [], 'nodes' => []]]),
            'models' => array_keys(config('visual-script.models', [])),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'definition' => 'required|array',
        ]);

        $data['slug'] = Str::slug($data['name']).'-'.Str::random(6);
        $data['is_active'] = $request->boolean('is_active', true);

        $script = Script::create($data);

        return redirect()
            ->route('visual-script.edit', $script)
            ->with('status', 'اسکریپت با موفقیت ذخیره شد.');
    }

    public function edit(Script $script)
    {
        return view('visual-script::builder', [
            'script' => $script,
            'models' => array_keys(config('visual-script.models', [])),
        ]);
    }

    public function update(Request $request, Script $script)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'definition' => 'required|array',
        ]);

        $data['is_active'] = $request->boolean('is_active', true);

        $script->update($data);

        return redirect()
            ->route('visual-script.edit', $script)
            ->with('status', 'اسکریپت بروزرسانی شد.');
    }

    public function destroy(Script $script)
    {
        $script->delete();

        return redirect()->route('visual-script.index')->with('status', 'اسکریپت حذف شد.');
    }
}
