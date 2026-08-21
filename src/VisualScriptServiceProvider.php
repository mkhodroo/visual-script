<?php

namespace VisualScript;

use Illuminate\Support\ServiceProvider;
use VisualScript\Engine\ScriptEngine;

class VisualScriptServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__.'/../config/visual-script.php', 'visual-script');

        $this->app->singleton(ScriptEngine::class, function ($app) {
            return new ScriptEngine();
        });
    }

    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../database/migrations');
        $this->loadRoutesFrom(__DIR__.'/../routes/web.php');
        $this->loadRoutesFrom(__DIR__.'/../routes/api.php');
        $this->loadViewsFrom(__DIR__.'/../resources/views', 'visual-script');

        if ($this->app->runningInConsole()) {
            $this->publishes([
                __DIR__.'/../config/visual-script.php' => config_path('visual-script.php'),
            ], 'visual-script-config');

            $this->publishes([
                __DIR__.'/../resources/views' => resource_path('views/vendor/visual-script'),
            ], 'visual-script-views');

            $this->publishes([
                __DIR__.'/../database/migrations' => database_path('migrations'),
            ], 'visual-script-migrations');

            $this->publishes([
                __DIR__.'/../resources/js' => public_path('vendor/visual-script/js'),
            ], 'visual-script-assets');
        }
    }
}
