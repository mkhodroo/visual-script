<?php

namespace VisualScript\Models;

use Illuminate\Database\Eloquent\Model;

class ScriptLog extends Model
{
    protected $table = 'visual_script_logs';

    protected $fillable = [
        'visual_script_id', 'input', 'output', 'status', 'error_message', 'duration_ms',
    ];

    protected $casts = [
        'input' => 'array',
        'output' => 'array',
    ];

    public function script()
    {
        return $this->belongsTo(Script::class, 'visual_script_id');
    }
}
