<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Card extends Model
{
    use HasFactory;

    protected $fillable = [
        'list_id',
        'title',
        'description',
        'position',
        'due_date',
        'assigned_to',
        'tags',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'tags' => 'array',
        'due_date' => 'datetime',
    ];

    /**
     * Get the list that contains the card.
     */
    public function list(): BelongsTo
    {
        return $this->belongsTo(KanbanList::class, 'list_id');
    }

    /**
     * Get the user assigned to this card.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
