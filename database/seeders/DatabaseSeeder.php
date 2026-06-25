<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Board;
use App\Models\KanbanList;
use App\Models\Card;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create default users
        $alice = User::factory()->create([
            'name' => 'Alice Vance',
            'email' => 'alice@example.com',
        ]);

        $bob = User::factory()->create([
            'name' => 'Bob Miller',
            'email' => 'bob@example.com',
        ]);

        $charlie = User::factory()->create([
            'name' => 'Charlie Smith',
            'email' => 'charlie@example.com',
        ]);

        $diana = User::factory()->create([
            'name' => 'Diana Prince',
            'email' => 'diana@example.com',
        ]);

        // 2. Create Boards
        $board1 = Board::create([
            'name' => '🚀 Product Launch V2.0',
            'description' => 'Kanban board for tracking launch tasks, product releases, and system upgrades.',
            'color' => 'indigo', // indigo/violet gradient
        ]);

        $board2 = Board::create([
            'name' => '🎨 Website Redesign',
            'description' => 'Planning and execution for the brand new corporate home page redesign.',
            'color' => 'rose', // rose/pink gradient
        ]);

        $board3 = Board::create([
            'name' => '🛠️ Bug Squash 2026',
            'description' => 'Active workspace for tracking and squash bugs before deployment.',
            'color' => 'emerald', // emerald/teal gradient
        ]);

        // 3. Create lists for Board 1
        $todo = KanbanList::create([
            'board_id' => $board1->id,
            'name' => 'Backlog',
            'position' => 0,
        ]);

        $inProgress = KanbanList::create([
            'board_id' => $board1->id,
            'name' => 'In Progress',
            'position' => 1,
        ]);

        $review = KanbanList::create([
            'board_id' => $board1->id,
            'name' => 'In Review',
            'position' => 2,
        ]);

        $done = KanbanList::create([
            'board_id' => $board1->id,
            'name' => 'Completed',
            'position' => 3,
        ]);

        // 4. Create cards for Board 1
        // Backlog Cards
        Card::create([
            'list_id' => $todo->id,
            'title' => 'Write API documentation',
            'description' => 'Document all REST endpoints, headers, and parameter definitions for external integration.',
            'position' => 0,
            'due_date' => Carbon::now()->addDays(14),
            'assigned_to' => $alice->id,
            'tags' => ['Docs', 'Backend'],
        ]);

        Card::create([
            'list_id' => $todo->id,
            'title' => 'Optimize SQLite Database indices',
            'description' => 'Add appropriate database indices on foreign keys and position columns to speed up drag and drop sorting.',
            'position' => 1,
            'due_date' => Carbon::now()->addDays(7),
            'assigned_to' => $bob->id,
            'tags' => ['Database', 'Backend', 'Performance'],
        ]);

        // In Progress Cards
        Card::create([
            'list_id' => $inProgress->id,
            'title' => 'Integrate @hello-pangea/dnd',
            'description' => 'Implement drag-and-drop support for board lists and card tiles using hello-pangea/dnd with optimistic UI updates.',
            'position' => 0,
            'due_date' => Carbon::now()->addDays(2),
            'assigned_to' => $charlie->id,
            'tags' => ['Frontend', 'UX', 'Drag-n-Drop'],
        ]);

        Card::create([
            'list_id' => $inProgress->id,
            'title' => 'Design glassmorphic dark mode theme',
            'description' => 'Develop modern aesthetics with sleek semi-transparent cards, dynamic gradients, and custom Tailwind styling.',
            'position' => 1,
            'due_date' => Carbon::now()->addDays(5),
            'assigned_to' => $alice->id,
            'tags' => ['UI/UX', 'Design', 'Tailwind'],
        ]);

        // Review Cards
        Card::create([
            'list_id' => $review->id,
            'title' => 'Auth middleware security audit',
            'description' => 'Double check Inertia requests and REST controllers to ensure card updates and column edits are validated properly.',
            'position' => 0,
            'due_date' => Carbon::now()->subDays(1), // Overdue!
            'assigned_to' => $diana->id,
            'tags' => ['Security', 'QA'],
        ]);

        // Done Cards
        Card::create([
            'list_id' => $done->id,
            'title' => 'Initialize Laravel 13 Project',
            'description' => 'Scaffold empty app using React + Inertia + Tailwind + SQLite.',
            'position' => 0,
            'due_date' => Carbon::now()->subDays(3),
            'assigned_to' => $bob->id,
            'tags' => ['Setup', 'DevOps'],
        ]);

        // 5. Create basic lists and cards for Board 2 (Redesign)
        $design = KanbanList::create([
            'board_id' => $board2->id,
            'name' => 'Design Layouts',
            'position' => 0,
        ]);
        $dev = KanbanList::create([
            'board_id' => $board2->id,
            'name' => 'Development',
            'position' => 1,
        ]);

        Card::create([
            'list_id' => $design->id,
            'title' => 'Hero Section wireframes',
            'description' => 'Create mobile & desktop layouts for the main hero page.',
            'position' => 0,
            'due_date' => Carbon::now()->addDays(4),
            'assigned_to' => $charlie->id,
            'tags' => ['Wireframe', 'Design'],
        ]);
    }
}
