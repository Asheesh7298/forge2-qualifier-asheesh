<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Board extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'color'];

    /**
     * Get the lists for the board, ordered by their position.
     */
    public function lists(): HasMany
    {
        return $this->hasMany(KanbanList::class)->orderBy('position');
    }
}
