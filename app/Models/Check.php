<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Check extends Model
{
    use HasFactory;

    protected $table = 'check';

    protected $fillable = [
        'user_id',
        'amount',
        'date',
        'description',
        'number',
        'status',
        'validated'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
