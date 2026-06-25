<?php

namespace App\Http\Controllers;

use App\Models\Card;
use App\Models\KanbanList;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class CardController extends Controller
{
    /**
     * Store a newly created card in storage.
     */
    public function store(Request $request, KanbanList $list)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|integer|exists:users,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $position = Card::where('list_id', $list->id)->count();

        $card = Card::create([
            'list_id' => $list->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => isset($validated['due_date']) ? Carbon::parse($validated['due_date']) : null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'tags' => $validated['tags'] ?? [],
            'position' => $position,
        ]);

        $card->load('assignee');

        return response()->json([
            'message' => 'Card created successfully.',
            'card' => $card
        ], 201);
    }

    /**
     * Update the specified card in storage.
     */
    public function update(Request $request, Card $card)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'due_date' => 'nullable|date',
            'assigned_to' => 'nullable|integer|exists:users,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $card->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => isset($validated['due_date']) ? Carbon::parse($validated['due_date']) : null,
            'assigned_to' => $validated['assigned_to'] ?? null,
            'tags' => $validated['tags'] ?? [],
        ]);

        $card->load('assignee');

        return response()->json([
            'message' => 'Card updated successfully.',
            'card' => $card
        ]);
    }

    /**
     * Remove the specified card from storage.
     */
    public function destroy(Card $card)
    {
        $card->delete();

        return response()->json([
            'message' => 'Card deleted successfully.'
        ]);
    }

    /**
     * Reorder cards across list columns.
     */
    public function reorder(Request $request)
    {
        $validated = $request->validate([
            'lists' => 'required|array',
            'lists.*.list_id' => 'required|integer|exists:kanban_lists,id',
            'lists.*.card_ids' => 'present|array',
            'lists.*.card_ids.*' => 'required|integer|exists:cards,id',
        ]);

        foreach ($validated['lists'] as $listData) {
            $listId = $listData['list_id'];
            $cardIds = $listData['card_ids'];

            foreach ($cardIds as $position => $cardId) {
                Card::where('id', $cardId)->update([
                    'list_id' => $listId,
                    'position' => $position,
                ]);
            }
        }

        return response()->json([
            'message' => 'Cards reordered successfully.'
        ]);
    }
}
