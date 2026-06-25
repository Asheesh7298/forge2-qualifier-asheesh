<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\KanbanList;
use Illuminate\Http\Request;

class KanbanListController extends Controller
{
    /**
     * Store a newly created list in storage.
     */
    public function store(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $position = KanbanList::where('board_id', $board->id)->count();

        $list = KanbanList::create([
            'board_id' => $board->id,
            'name' => $validated['name'],
            'position' => $position,
        ]);

        return response()->json([
            'message' => 'List created successfully.',
            'list' => $list
        ], 201);
    }

    /**
     * Update the specified list in storage.
     */
    public function update(Request $request, KanbanList $list)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $list->update($validated);

        return response()->json([
            'message' => 'List updated successfully.',
            'list' => $list
        ]);
    }

    /**
     * Remove the specified list from storage.
     */
    public function destroy(KanbanList $list)
    {
        $list->delete();

        return response()->json([
            'message' => 'List deleted successfully.'
        ]);
    }

    /**
     * Reorder lists on a board.
     */
    public function reorder(Request $request, Board $board)
    {
        $validated = $request->validate([
            'list_ids' => 'required|array',
            'list_ids.*' => 'required|integer|exists:kanban_lists,id',
        ]);

        $listIds = $validated['list_ids'];

        foreach ($listIds as $index => $id) {
            KanbanList::where('id', $id)
                ->where('board_id', $board->id)
                ->update(['position' => $index]);
        }

        return response()->json([
            'message' => 'Lists reordered successfully.'
        ]);
    }
}
