<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BoardController extends Controller
{
    /**
     * Display a listing of all boards (Dashboard).
     */
    public function index(): Response
    {
        $boards = Board::withCount(['lists'])->get();
        return Inertia::render('Dashboard', [
            'boards' => $boards
        ]);
    }

    /**
     * Display the specified board with its lists, cards, and users.
     */
    public function show(Board $board): Response
    {
        $board->load(['lists' => function ($query) {
            $query->orderBy('position')->with(['cards' => function ($q) {
                $q->orderBy('position')->with('assignee');
            }]);
        }]);

        $users = User::select(['id', 'name', 'email'])->get();

        return Inertia::render('BoardShow', [
            'board' => $board,
            'users' => $users
        ]);
    }

    /**
     * Store a newly created board in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'required|string|in:blue,indigo,purple,rose,emerald,amber,slate',
        ]);

        $board = Board::create($validated);

        return response()->json([
            'message' => 'Board created successfully.',
            'board' => $board
        ], 201);
    }

    /**
     * Update the specified board in storage.
     */
    public function update(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'color' => 'required|string|in:blue,indigo,purple,rose,emerald,amber,slate',
        ]);

        $board->update($validated);

        return response()->json([
            'message' => 'Board updated successfully.',
            'board' => $board
        ]);
    }

    /**
     * Remove the specified board from storage.
     */
    public function destroy(Board $board)
    {
        $board->delete();

        return response()->json([
            'message' => 'Board deleted successfully.'
        ]);
    }
}
