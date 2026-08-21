<?php

use Illuminate\Support\Facades\Route;
use VisualScript\Http\Controllers\ScriptRunController;

Route::group([
    'prefix' => 'api/'.config('visual-script.route_prefix', 'visual-script'),
    'middleware' => config('visual-script.api_middleware', ['api']),
    'as' => 'visual-script.api.',
], function () {
    Route::post('/run/{slug}', [ScriptRunController::class, 'run'])->name('run');
});
