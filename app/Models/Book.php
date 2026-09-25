<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Book extends Model
{
    use HasFactory;

    protected $primaryKey = 'olid';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'olid',
        'title',
        'author',
        'cover_url',
        'excerpt',
    ];

    public function users()
    {
        return $this->belongsToMany(User::class, 'user_books', 'olid', 'user_id')
                    ->withPivot('status')
                    ->withTimestamps();
    }
}