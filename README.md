# Forge 2 Kanban Board MVP

A beautiful, high-fidelity Trello-like Kanban board built using **Laravel 13 + React + Inertia.js + SQLite + Tailwind CSS v4**.

It supports full workspace creation, column management, card customization (title, description, tags, due date, assigned member), and smooth drag-and-drop mechanics using `@hello-pangea/dnd`.

---

## Technical Stack

* **Backend**: Laravel 13, SQLite database, Eloquent ORM, controllers & validators.
* **Frontend**: React (v19), TypeScript, Inertia.js (v3), Axios, Tailwind CSS (v4).
* **Drag and Drop**: `@hello-pangea/dnd` with optimistic client-side updates.

---

## Key Features

1. **Dashboard Workspace**:
   * View all boards in a sleek, gradient-themed card list.
   * Create new boards choosing from a set of beautiful curated gradient themes.
   * Delete existing boards safely.
2. **Dynamic Columns (Lists)**:
   * Reorder lists horizontally by dragging them left and right.
   * Inline title editing (renaming list on title click).
   * Column deletion (cascade deletes all containing cards).
   * Add new lists dynamically on the fly.
3. **Card Management**:
   * Add new cards instantly in any list with inline triggers.
   * Drag & Drop cards vertically within the list, or migrate them horizontally between different lists.
   * Cards show title, description snippet, colored tags, due date badges (red if overdue), and assignee initials.
4. **Card Detail Modal**:
   * Inspect and edit a card by clicking on it.
   * Update title and description.
   * Select an assignee (drop-down list loaded with active team members).
   * Pick due dates using native browser date pickers.
   * Add and remove tags with dynamic tag chips.
   * Delete cards directly from the modal.

---

## Setup & Running Locally

Follow these quick steps to get the application up and running:

### 1. Install Dependencies

Ensure PHP (Composer) and Node (npm) dependencies are installed:

```bash
composer install
npm install
```

### 2. Configure Database & Environment

The `.env` file is already preconfigured to use SQLite:

```env
DB_CONNECTION=sqlite
```

The database resides in `database/database.sqlite`.

### 3. Run Migrations & Seed Data

Run the database migrations and seed default mock data (including Alice, Bob, Charlie, and pre-configured product boards/lists/cards):

```bash
php artisan migrate:fresh --seed
```

### 4. Run Development Servers

Run the Laravel development server (runs by default on `http://127.0.0.1:8000`):

```bash
php artisan serve
```

Run the Vite development asset compiler (for real-time React compilation and HMR):

```bash
npm run dev
```

### 5. Build for Production

To create the production asset bundle:

```bash
npm run build
```

---

## Architecture & Code Map

* **Database Migrations**:
  * [Boards Migration](database/migrations/2026_06_25_180000_create_boards_table.php)
  * [Lists Migration](database/migrations/2026_06_25_180001_create_kanban_lists_table.php)
  * [Cards Migration](database/migrations/2026_06_25_180002_create_cards_table.php)
* **Eloquent Models**:
  * [Board.php](app/Models/Board.php) (hasMany Lists)
  * [KanbanList.php](app/Models/KanbanList.php) (belongsTo Board, hasMany Cards)
  * [Card.php](app/Models/Card.php) (belongsTo List, belongsTo User as Assignee, casts tags as array)
* **Controllers**:
  * [BoardController.php](app/Http/Controllers/BoardController.php) (renders Dashboard/BoardShow via Inertia, handles Board API)
  * [KanbanListController.php](app/Http/Controllers/KanbanListController.php) (handles List additions, renaming, deletion, and reordering API)
  * [CardController.php](app/Http/Controllers/CardController.php) (handles Card CRUD, and advanced multi-list card reordering API)
* **React Views**:
  * [Dashboard.tsx](resources/js/pages/Dashboard.tsx) (sleek dashboard containing board workspaces grid and create modal)
  * [BoardShow.tsx](resources/js/pages/BoardShow.tsx) (Kanban board layout containing drag-and-drop logic and list managers)
  * [CardDetailModal.tsx](resources/js/components/CardDetailModal.tsx) (glassmorphic editor modal for card updates)
