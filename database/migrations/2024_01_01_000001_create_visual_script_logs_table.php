<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visual_script_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visual_script_id')->constrained('visual_scripts')->cascadeOnDelete();
            $table->json('input')->nullable();
            $table->json('output')->nullable();
            $table->string('status', 20); // success | error
            $table->text('error_message')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visual_script_logs');
    }
};
