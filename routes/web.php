<?php

use App\Http\Controllers\BoardController;
use App\Http\Controllers\CardController;
use App\Http\Controllers\KanbanListController;
use Illuminate\Support\Facades\Route;

// Web page views (served by Inertia)
Route::get('/', [BoardController::class, 'index'])->name('dashboard');
Route::get('/boards/{board}', [BoardController::class, 'show'])->name('boards.show');

// Board API endpoints
Route::post('/api/boards', [BoardController::class, 'store'])->name('api.boards.store');
Route::put('/api/boards/{board}', [BoardController::class, 'update'])->name('api.boards.update');
Route::delete('/api/boards/{board}', [BoardController::class, 'destroy'])->name('api.boards.destroy');

// Kanban List API endpoints
Route::post('/api/boards/{board}/lists', [KanbanListController::class, 'store'])->name('api.lists.store');
Route::put('/api/lists/{list}', [KanbanListController::class, 'update'])->name('api.lists.update');
Route::delete('/api/lists/{list}', [KanbanListController::class, 'destroy'])->name('api.lists.destroy');
Route::post('/api/boards/{board}/lists/reorder', [KanbanListController::class, 'reorder'])->name('api.lists.reorder');

// Card API endpoints
Route::post('/api/lists/{list}/cards', [CardController::class, 'store'])->name('api.cards.store');
Route::put('/api/cards/{card}', [CardController::class, 'update'])->name('api.cards.update');
Route::delete('/api/cards/{card}', [CardController::class, 'destroy'])->name('api.cards.destroy');
Route::post('/api/cards/reorder', [CardController::class, 'reorder'])->name('api.cards.reorder');
