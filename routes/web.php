<?php

use Illuminate\Support\Facades\Route;
use VisualScript\Http\Controllers\ScriptController;
use VisualScript\Http\Controllers\ScriptRunController;

Route::group([
    'prefix' => config('visual-script.route_prefix', 'visual-script'),
    'middleware' => config('visual-script.middleware', ['web']),
    'as' => 'visual-script.',
], function () {
    Route::get('/', [ScriptController::class, 'index'])->name('index');
    Route::get('/create', [ScriptController::class, 'create'])->name('create');
    Route::post('/', [ScriptController::class, 'store'])->name('store');
    Route::get('/{script}/edit', [ScriptController::class, 'edit'])->name('edit');
    Route::put('/{script}', [ScriptController::class, 'update'])->name('update');
    Route::delete('/{script}', [ScriptController::class, 'destroy'])->name('destroy');

    Route::post('/preview', [ScriptRunController::class, 'preview'])->name('preview');
});
