import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';

interface Board {
    id: number;
    name: string;
    description: string | null;
    color: string;
    lists_count?: number;
}

interface DashboardProps {
    boards: Board[];
}

const COLOR_MAP: Record<string, { bg: string; border: string; label: string }> = {
    blue: {
        bg: 'from-blue-600 to-cyan-700',
        border: 'border-blue-500',
        label: 'Blue',
    },
    indigo: {
        bg: 'from-indigo-600 to-purple-700',
        border: 'border-indigo-500',
        label: 'Indigo',
    },
    purple: {
        bg: 'from-purple-600 to-pink-700',
        border: 'border-purple-500',
        label: 'Purple',
    },
    rose: {
        bg: 'from-rose-600 to-pink-700',
        border: 'border-rose-500',
        label: 'Rose',
    },
    emerald: {
        bg: 'from-emerald-600 to-teal-700',
        border: 'border-emerald-500',
        label: 'Emerald',
    },
    amber: {
        bg: 'from-amber-500 to-orange-600',
        border: 'border-amber-500',
        label: 'Amber',
    },
    slate: {
        bg: 'from-slate-600 to-zinc-800',
        border: 'border-slate-500',
        label: 'Slate',
    },
};

export default function Dashboard({ boards }: DashboardProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState('indigo');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreateBoard = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
return;
}

        setIsSaving(true);
        setError(null);

        try {
            await axios.post('/api/boards', {
                name,
                description,
                color,
            });

            setIsCreateOpen(false);
            setName('');
            setDescription('');
            setColor('indigo');

            // Force Inertia reload to fetch fresh page props
            router.reload();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to create board.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteBoard = async (boardId: number, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"? All lists and cards will be permanently lost.`)) {
            return;
        }

        try {
            await axios.delete(`/api/boards/${boardId}`);
            router.reload();
        } catch (err) {
            console.error(err);
            alert('Failed to delete board.');
        }
    };

    return (
        <>
            <Head title="Boards Dashboard" />

            <div className="min-h-screen bg-slate-950 text-white font-sans">
                {/* Header */}
                <header className="sticky top-0 z-10 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                                Forge Kanban
                            </span>
                        </div>
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-102"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Board
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex flex-col gap-2 mb-8">
                        <h1 className="text-3xl font-extrabold tracking-tight">Your Boards</h1>
                        <p className="text-slate-400 text-sm">Select a board workspace to manage your workflows.</p>
                    </div>

                    {/* Board Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {boards.map((board) => {
                            const config = COLOR_MAP[board.color] || COLOR_MAP.slate;

                            return (
                                <div
                                    key={board.id}
                                    className="group relative flex flex-col justify-between h-48 rounded-2xl border border-slate-900 bg-slate-900/40 hover:bg-slate-900/60 overflow-hidden hover:border-slate-800 transition duration-300"
                                >
                                    {/* Color Banner */}
                                    <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${config.bg}`} />

                                    <div className="p-6">
                                        <div className="flex justify-between items-start">
                                            <Link
                                                href={`/boards/${board.id}`}
                                                className="hover:text-indigo-400 transition"
                                            >
                                                <h3 className="text-xl font-bold tracking-tight text-slate-100 group-hover:text-white transition">
                                                    {board.name}
                                                </h3>
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteBoard(board.id, board.name)}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition duration-200"
                                                title="Delete Board"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>

                                        <p className="text-slate-400 text-sm mt-2 line-clamp-2 pr-6">
                                            {board.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    {/* Footer stats */}
                                    <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-900 flex justify-between items-center text-xs text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                            </svg>
                                            {board.lists_count || 0} {board.lists_count === 1 ? 'Column' : 'Columns'}
                                        </span>
                                        <Link
                                            href={`/boards/${board.id}`}
                                            className="text-indigo-400 font-semibold group-hover:translate-x-1 transition duration-200"
                                        >
                                            Open Workspace →
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Create Board Call-to-Action Card */}
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950 hover:bg-indigo-950/10 rounded-2xl group transition duration-300 focus:outline-none"
                        >
                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition duration-350">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <span className="text-slate-400 font-medium group-hover:text-slate-200 mt-4 transition">
                                Create New Board
                            </span>
                        </button>
                    </div>
                </main>

                {/* Create Board Modal */}
                {isCreateOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
                                <span className="text-sm font-semibold tracking-wider text-indigo-400 uppercase">Create Workspace</span>
                                <button
                                    onClick={() => setIsCreateOpen(false)}
                                    className="text-slate-400 hover:text-white transition"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleCreateBoard} className="p-6 space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-950 border border-red-800 text-red-200 text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {/* Board Name */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                        Board Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Sprint Planning, Project Alpha"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    />
                                </div>

                                {/* Board Description */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Outline board purpose, goals, or sprint lifecycle."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                                    />
                                </div>

                                {/* Color Gradient Picker */}
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                        Theme Color
                                    </label>
                                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                                        {Object.entries(COLOR_MAP).map(([key, config]) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setColor(key)}
                                                className={`h-10 rounded-xl bg-gradient-to-br ${config.bg} border-2 transition ${
                                                    color === key ? 'border-white scale-105 shadow-md shadow-white/10' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-102'
                                                }`}
                                                title={config.label}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="border-t border-slate-800 pt-6 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                                    >
                                        {isSaving ? 'Creating...' : 'Create Board'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
