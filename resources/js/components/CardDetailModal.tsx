import axios from 'axios';
import React, { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface Card {
    id: number;
    list_id: number;
    title: string;
    description: string | null;
    due_date: string | null;
    assigned_to: number | null;
    tags: string[] | null;
    assignee?: User | null;
}

interface CardDetailModalProps {
    card: Card;
    users: User[];
    onClose: () => void;
    onUpdate: (updatedCard: Card) => void;
    onDelete: (cardId: number) => void;
}

export default function CardDetailModal({
    card,
    users,
    onClose,
    onUpdate,
    onDelete,
}: CardDetailModalProps) {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');
    const [dueDate, setDueDate] = useState(() => {
        if (card.due_date) {
            try {
                const date = new Date(card.due_date);

                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            } catch (e) {
                console.error(e);
            }
        }

        return '';
    });
    const [assignedTo, setAssignedTo] = useState<number | ''>(card.assigned_to || '');
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<string[]>(card.tags || []);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = tagInput.trim();

        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleSave = async () => {
        if (!title.trim()) {
            setError('Title is required');

            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const response = await axios.put(`/api/cards/${card.id}`, {
                title,
                description: description || null,
                due_date: dueDate || null,
                assigned_to: assignedTo || null,
                tags: tags,
            });

            onUpdate(response.data.card);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update card.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this card?')) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            await axios.delete(`/api/cards/${card.id}`);
            onDelete(card.id);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to delete card.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
                    <span className="text-sm font-semibold tracking-wider text-indigo-400 uppercase">Card Details</span>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors duration-200"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    {error && (
                        <div className="p-3 bg-red-950 border border-red-800 text-red-200 text-sm rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Card Title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            placeholder="Add a detailed description..."
                        />
                    </div>

                    {/* Grid for Assignee and Due Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Assignee */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Assigned Member
                            </label>
                            <select
                                value={assignedTo}
                                onChange={(e) => setAssignedTo(e.target.value ? Number(e.target.value) : '')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            >
                                <option value="">Unassigned</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Due Date */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Tags
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {tags.length === 0 ? (
                                <span className="text-slate-500 text-sm">No tags added yet.</span>
                            ) : (
                                tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-medium rounded-full border border-slate-700 transition"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="text-slate-400 hover:text-white focus:outline-none"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </span>
                                ))
                            )}
                        </div>
                        <form onSubmit={handleAddTag} className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                placeholder="Add new tag (press Enter)"
                                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition text-sm"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-750 text-white rounded-xl text-sm transition"
                            >
                                Add
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-950">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting || isSaving}
                        className="w-full sm:w-auto px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/40 hover:bg-red-900/40 rounded-xl text-sm font-semibold transition focus:outline-none disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Card'}
                    </button>
                    <div className="w-full sm:w-auto flex gap-3">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving || isDeleting}
                            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
