<?php

namespace VisualScript\Models;

use Illuminate\Database\Eloquent\Model;

class Script extends Model
{
    protected $table = 'visual_scripts';

    protected $fillable = [
        'name', 'slug', 'description', 'definition', 'is_active', 'created_by',
    ];

    protected $casts = [
        'definition' => 'array',
        'is_active' => 'boolean',
    ];

    public function logs()
    {
        return $this->hasMany(ScriptLog::class, 'visual_script_id');
    }
}
