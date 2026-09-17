<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Project extends Model
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'system_prompt',
        'chat_integration_type',
        'chat_integration_webhook',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function tokenUsages()
    {
        return $this->hasMany(TokenUsage::class);
    }
}
