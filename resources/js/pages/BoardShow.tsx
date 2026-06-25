import type {
    DropResult} from '@hello-pangea/dnd';
import {
    DragDropContext,
    Droppable,
    Draggable
} from '@hello-pangea/dnd';
import { Head, Link, router } from '@inertiajs/react';
import axios from 'axios';
import React, { useState } from 'react';
import CardDetailModal from '../components/CardDetailModal';

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

interface KanbanList {
    id: number;
    board_id: number;
    name: string;
    position: number;
    cards: Card[];
}

interface Board {
    id: number;
    name: string;
    description: string | null;
    color: string;
    lists: KanbanList[];
}

interface BoardShowProps {
    board: Board;
    users: User[];
}

const COLOR_MAP: Record<string, { bg: string; text: string; gradient: string }> = {
    blue: {
        bg: 'bg-blue-600',
        text: 'text-blue-400',
        gradient: 'from-blue-600 to-cyan-700',
    },
    indigo: {
        bg: 'bg-indigo-600',
        text: 'text-indigo-400',
        gradient: 'from-indigo-600 to-purple-700',
    },
    purple: {
        bg: 'bg-purple-600',
        text: 'text-purple-400',
        gradient: 'from-purple-600 to-pink-700',
    },
    rose: {
        bg: 'bg-rose-600',
        text: 'text-rose-400',
        gradient: 'from-rose-600 to-pink-700',
    },
    emerald: {
        bg: 'bg-emerald-600',
        text: 'text-emerald-400',
        gradient: 'from-emerald-600 to-teal-700',
    },
    amber: {
        bg: 'bg-amber-500',
        text: 'text-amber-400',
        gradient: 'from-amber-500 to-orange-600',
    },
    slate: {
        bg: 'bg-slate-600',
        text: 'text-slate-400',
        gradient: 'from-slate-600 to-zinc-800',
    },
};

export default function BoardShow({ board, users }: BoardShowProps) {
    const [lists, setLists] = useState<KanbanList[]>(board.lists);
    const [prevBoardLists, setPrevBoardLists] = useState<KanbanList[]>(board.lists);

    if (board.lists !== prevBoardLists) {
        setLists(board.lists);
        setPrevBoardLists(board.lists);
    }

    const [newListOpen, setNewListOpen] = useState(false);
    const [newListName, setNewListName] = useState('');
    const [activeAddCardListId, setActiveAddCardListId] = useState<number | null>(null);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);
    
    // Header Edit Mode State
    const [isEditingBoard, setIsEditingBoard] = useState(false);
    const [boardName, setBoardName] = useState(board.name);
    const [boardDescription, setBoardDescription] = useState(board.description || '');
    const [boardColor, setBoardColor] = useState(board.color);

    // List Edit Mode (renaming)
    const [editingListId, setEditingListId] = useState<number | null>(null);
    const [editingListName, setEditingListName] = useState('');



    const getInitials = (name: string) => {
        const parts = name.split(' ');

        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }

        return name.slice(0, 2).toUpperCase();
    };

    const isOverdue = (dueDateStr: string | null) => {
        if (!dueDateStr) {
return false;
}

        const due = new Date(dueDateStr);
        const now = new Date();
        // Zero out times for date comparison
        due.setHours(0,0,0,0);
        now.setHours(0,0,0,0);

        return due < now;
    };

    const handleSaveBoardDetails = async () => {
        if (!boardName.trim()) {
return;
}

        try {
            await axios.put(`/api/boards/${board.id}`, {
                name: boardName,
                description: boardDescription || null,
                color: boardColor,
            });
            setIsEditingBoard(false);
            router.reload();
        } catch (err) {
            console.error(err);
            alert('Failed to update board details.');
        }
    };

    const handleAddList = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = newListName.trim();

        if (!trimmed) {
return;
}

        try {
            const response = await axios.post(`/api/boards/${board.id}/lists`, {
                name: trimmed,
            });

            const newList: KanbanList = {
                ...response.data.list,
                cards: [],
            };

            setLists([...lists, newList]);
            setNewListName('');
            setNewListOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to add list.');
        }
    };

    const handleRenameList = async (listId: number) => {
        const trimmed = editingListName.trim();

        if (!trimmed) {
            setEditingListId(null);

            return;
        }

        try {
            await axios.put(`/api/lists/${listId}`, {
                name: trimmed,
            });

            setLists(lists.map(list => list.id === listId ? { ...list, name: trimmed } : list));
            setEditingListId(null);
        } catch (err) {
            console.error(err);
            alert('Failed to rename list.');
        }
    };

    const handleDeleteList = async (listId: number, name: string) => {
        if (!window.confirm(`Are you sure you want to delete column "${name}"? All cards inside will be deleted.`)) {
            return;
        }

        try {
            await axios.delete(`/api/lists/${listId}`);
            setLists(lists.filter(list => list.id !== listId));
        } catch (err) {
            console.error(err);
            alert('Failed to delete list.');
        }
    };

    const handleAddCard = async (e: React.FormEvent, listId: number) => {
        e.preventDefault();
        const trimmed = newCardTitle.trim();

        if (!trimmed) {
return;
}

        try {
            const response = await axios.post(`/api/lists/${listId}/cards`, {
                title: trimmed,
            });

            setLists(
                lists.map((list) => {
                    if (list.id === listId) {
                        return {
                            ...list,
                            cards: [...list.cards, response.data.card],
                        };
                    }

                    return list;
                })
            );

            setNewCardTitle('');
            setActiveAddCardListId(null);
        } catch (err) {
            console.error(err);
            alert('Failed to create card.');
        }
    };

    // Card Modal Update callbacks
    const handleCardUpdated = (updatedCard: Card) => {
        setLists(
            lists.map((list) => {
                if (list.id === updatedCard.list_id) {
                    return {
                        ...list,
                        cards: list.cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
                    };
                }

                return list;
            })
        );
    };

    const handleCardDeleted = (cardId: number) => {
        setLists(
            lists.map((list) => ({
                ...list,
                cards: list.cards.filter((c) => c.id !== cardId),
            }))
        );
    };

    // DRAG AND DROP HANDLER
    const onDragEnd = async (result: DropResult) => {
        const { destination, source, type } = result;

        // Dropped outside or no change
        if (
            !destination ||
            (destination.droppableId === source.droppableId &&
                destination.index === source.index)
        ) {
            return;
        }

        // Backup current state for revert if API fails
        const backupLists = [...lists];

        // 1. COLUMN DRAG AND DROP
        if (type === 'column') {
            const reorderedLists = [...lists];
            const [removed] = reorderedLists.splice(source.index, 1);
            reorderedLists.splice(destination.index, 0, removed);

            // Update local state instantly
            setLists(reorderedLists);

            // Persist order in backend
            try {
                const listIds = reorderedLists.map(l => l.id);
                await axios.post(`/api/boards/${board.id}/lists/reorder`, {
                    list_ids: listIds,
                });
            } catch (err) {
                console.error(err);
                // Revert if error
                setLists(backupLists);
                alert('Failed to save list order.');
            }

            return;
        }

        // 2. CARD DRAG AND DROP
        const sourceListId = Number(source.droppableId);
        const destListId = Number(destination.droppableId);

        const sourceListIndex = lists.findIndex((l) => l.id === sourceListId);
        const destListIndex = lists.findIndex((l) => l.id === destListId);

        if (sourceListIndex === -1 || destListIndex === -1) {
return;
}

        const sourceList = lists[sourceListIndex];
        const destList = lists[destListIndex];

        const sourceCards = [...sourceList.cards];
        const destCards = sourceListId === destListId ? sourceCards : [...destList.cards];

        // Move card
        const [movedCard] = sourceCards.splice(source.index, 1);
        
        // Update list_id on moved card if changing columns
        if (sourceListId !== destListId) {
            movedCard.list_id = destListId;
        }
        
        destCards.splice(destination.index, 0, movedCard);

        // Update local React state optimistically
        const updatedLists = lists.map((l) => {
            if (l.id === sourceListId) {
                return { ...l, cards: sourceCards };
            }

            if (l.id === destListId) {
                return { ...l, cards: destCards };
            }

            return l;
        });
        setLists(updatedLists);

        // Persist Card positions in backend
        try {
            const payloadLists = [
                {
                    list_id: sourceListId,
                    card_ids: sourceCards.map((c) => c.id),
                },
            ];

            if (sourceListId !== destListId) {
                payloadLists.push({
                    list_id: destListId,
                    card_ids: destCards.map((c) => c.id),
                });
            }

            await axios.post('/api/cards/reorder', {
                lists: payloadLists,
            });
        } catch (err) {
            console.error(err);
            // Revert state on error
            setLists(backupLists);
            alert('Failed to save card movements.');
        }
    };

    const activeColor = COLOR_MAP[boardColor] || COLOR_MAP.slate;

    return (
        <>
            <Head title={boardName} />

            <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans overflow-x-hidden">
                {/* Board Top Navigation Bar */}
                <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition duration-200"
                                title="Back to Dashboard"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                            </Link>

                            <div>
                                {isEditingBoard ? (
                                    <div className="flex flex-col gap-2">
                                        <input
                                            type="text"
                                            value={boardName}
                                            onChange={(e) => setBoardName(e.target.value)}
                                            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 font-bold text-white text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                ) : (
                                    <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
                                        {boardName}
                                        <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${activeColor.gradient}`} />
                                    </h1>
                                )}
                            </div>
                        </div>

                        {/* Top Actions / Config */}
                        <div className="flex items-center gap-3">
                            {isEditingBoard ? (
                                <div className="flex items-center gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                                    {/* Color select inside editing */}
                                    <div className="flex gap-1.5 mr-2">
                                        {Object.keys(COLOR_MAP).map((cKey) => (
                                            <button
                                                key={cKey}
                                                type="button"
                                                onClick={() => setBoardColor(cKey)}
                                                className={`w-5 h-5 rounded-full bg-gradient-to-r ${COLOR_MAP[cKey].gradient} border transition ${
                                                    boardColor === cKey ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => setIsEditingBoard(false)}
                                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSaveBoardDetails}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                                    >
                                        Save
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditingBoard(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-400 rounded-xl text-sm font-semibold transition"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Settings
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Board Description Banner */}
                    {!isEditingBoard && board.description && (
                        <div className="max-w-7xl mx-auto px-6 pb-4">
                            <p className="text-slate-400 text-xs line-clamp-1 max-w-4xl">{boardDescription}</p>
                        </div>
                    )}
                    {isEditingBoard && (
                        <div className="max-w-7xl mx-auto px-6 pb-4">
                            <input
                                type="text"
                                value={boardDescription}
                                onChange={(e) => setBoardDescription(e.target.value)}
                                placeholder="Describe board objectives..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    )}
                </header>

                {/* Kanban Drag and Drop Workspace */}
                <main className="flex-1 overflow-x-auto overflow-y-hidden bg-slate-950 p-6 flex flex-col">
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable
                            droppableId="board"
                            type="column"
                            direction="horizontal"
                        >
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex items-start gap-6 select-none h-full"
                                >
                                    {lists.map((list, index) => (
                                        <Draggable
                                            key={list.id}
                                            draggableId={String(list.id)}
                                            index={index}
                                        >
                                            {(providedDrag, snapshotDrag) => (
                                                <div
                                                    ref={providedDrag.innerRef}
                                                    {...providedDrag.draggableProps}
                                                    className={`w-80 flex-shrink-0 bg-slate-900/50 border border-slate-900 rounded-2xl flex flex-col max-h-[80vh] shadow-lg transition duration-200 ${
                                                        snapshotDrag.isDragging ? 'rotate-1 border-indigo-500 bg-slate-900' : ''
                                                    }`}
                                                >
                                                    {/* List Header */}
                                                    <div
                                                        {...providedDrag.dragHandleProps}
                                                        className="p-4 border-b border-slate-950/40 flex justify-between items-center bg-slate-900/30 rounded-t-2xl flex-shrink-0"
                                                    >
                                                        {editingListId === list.id ? (
                                                            <input
                                                                type="text"
                                                                autoFocus
                                                                value={editingListName}
                                                                onChange={(e) => setEditingListName(e.target.value)}
                                                                onBlur={() => handleRenameList(list.id)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
handleRenameList(list.id);
}

                                                                    if (e.key === 'Escape') {
setEditingListId(null);
}
                                                                }}
                                                                className="bg-slate-950 border border-slate-800 text-white text-sm font-semibold rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                            />
                                                        ) : (
                                                            <h3
                                                                onClick={() => {
                                                                    setEditingListId(list.id);
                                                                    setEditingListName(list.name);
                                                                }}
                                                                className="text-sm font-semibold text-slate-100 hover:text-white cursor-pointer hover:bg-slate-800/40 px-2 py-0.5 rounded transition"
                                                            >
                                                                {list.name}
                                                            </h3>
                                                        )}

                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                                                                {list.cards.length}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteList(list.id, list.name)}
                                                                className="p-1 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition"
                                                                title="Delete List"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Cards Droppable Wrapper */}
                                                    <Droppable
                                                        droppableId={String(list.id)}
                                                        type="card"
                                                    >
                                                        {(providedDrop, snapshotDrop) => (
                                                            <div
                                                                ref={providedDrop.innerRef}
                                                                {...providedDrop.droppableProps}
                                                                className={`flex-1 p-3 overflow-y-auto space-y-3 min-h-[50px] transition-colors duration-250 ${
                                                                    snapshotDrop.isDraggingOver ? 'bg-indigo-950/10' : ''
                                                                }`}
                                                            >
                                                                {list.cards.map((card, cardIndex) => (
                                                                    <Draggable
                                                                        key={card.id}
                                                                        draggableId={String(card.id)}
                                                                        index={cardIndex}
                                                                    >
                                                                        {(providedCard, snapshotCard) => (
                                                                            <div
                                                                                ref={providedCard.innerRef}
                                                                                {...providedCard.draggableProps}
                                                                                {...providedCard.dragHandleProps}
                                                                                onClick={() => setSelectedCard(card)}
                                                                                className={`p-4 bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl shadow-sm hover:shadow-md cursor-pointer select-none transition group ${
                                                                                    snapshotCard.isDragging ? 'rotate-1 scale-102 border-indigo-500 shadow-xl bg-slate-850' : ''
                                                                                }`}
                                                                            >
                                                                                {/* Tags */}
                                                                                {card.tags && card.tags.length > 0 && (
                                                                                    <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                                                        {card.tags.slice(0, 3).map((tag) => (
                                                                                            <span
                                                                                                key={tag}
                                                                                                className="px-2 py-0.5 bg-slate-950 text-indigo-400 text-[10px] font-bold tracking-wide uppercase rounded border border-slate-800"
                                                                                            >
                                                                                                {tag}
                                                                                            </span>
                                                                                        ))}
                                                                                        {card.tags.length > 3 && (
                                                                                            <span className="text-[10px] font-bold text-slate-500 self-center">
                                                                                                +{card.tags.length - 3}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                )}

                                                                                {/* Card Title */}
                                                                                <h4 className="text-sm font-semibold text-slate-200 group-hover:text-white transition">
                                                                                    {card.title}
                                                                                </h4>

                                                                                {/* Card Description Snippet */}
                                                                                {card.description && (
                                                                                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                                                                                        {card.description}
                                                                                    </p>
                                                                                )}

                                                                                {/* Footer (Due Date & Member) */}
                                                                                {(card.due_date || card.assignee) && (
                                                                                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-950/40">
                                                                                        {/* Due Date Badge */}
                                                                                        {card.due_date ? (
                                                                                            <div
                                                                                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                                                                                    isOverdue(card.due_date)
                                                                                                        ? 'bg-red-950/20 text-red-400 border-red-900/30'
                                                                                                        : 'bg-slate-950 text-slate-400 border-slate-800'
                                                                                                }`}
                                                                                            >
                                                                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                                                </svg>
                                                                                                {new Date(card.due_date).toLocaleDateString(undefined, {
                                                                                                    month: 'short',
                                                                                                    day: 'numeric',
                                                                                                })}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <div />
                                                                                        )}

                                                                                        {/* Assignee Avatar */}
                                                                                        {card.assignee && (
                                                                                            <div
                                                                                                className="w-6 h-6 rounded-full bg-indigo-600 border border-slate-800 flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                                                                                                title={card.assignee.name}
                                                                                            >
                                                                                                {getInitials(card.assignee.name)}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                ))}
                                                                {providedDrop.placeholder}
                                                            </div>
                                                        )}
                                                    </Droppable>

                                                    {/* Card Adder / Trigger */}
                                                    <div className="p-3 border-t border-slate-950/20 flex-shrink-0">
                                                        {activeAddCardListId === list.id ? (
                                                            <form
                                                                onSubmit={(e) => handleAddCard(e, list.id)}
                                                                className="space-y-2"
                                                            >
                                                                <input
                                                                    type="text"
                                                                    autoFocus
                                                                    required
                                                                    value={newCardTitle}
                                                                    onChange={(e) => setNewCardTitle(e.target.value)}
                                                                    placeholder="Enter a title for this card..."
                                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="submit"
                                                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                                                                    >
                                                                        Add Card
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setActiveAddCardListId(null)}
                                                                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs transition"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <button
                                                                onClick={() => {
                                                                    setActiveAddCardListId(list.id);
                                                                    setNewCardTitle('');
                                                                }}
                                                                className="w-full py-2 border border-dashed border-slate-800/80 hover:border-indigo-500/30 hover:bg-indigo-950/5 text-slate-400 hover:text-indigo-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition duration-200"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                </svg>
                                                                Add Card
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}

                                    {/* List Column Adder */}
                                    <div className="w-80 flex-shrink-0">
                                        {newListOpen ? (
                                            <form
                                                onSubmit={handleAddList}
                                                className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
                                            >
                                                <input
                                                    type="text"
                                                    required
                                                    autoFocus
                                                    value={newListName}
                                                    onChange={(e) => setNewListName(e.target.value)}
                                                    placeholder="Enter column header..."
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md transition"
                                                    >
                                                        Create List
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewListOpen(false)}
                                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white rounded-xl text-xs transition"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    setNewListOpen(true);
                                                    setNewListName('');
                                                }}
                                                className="w-full py-4 border border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900/20 text-slate-400 hover:text-indigo-400 hover:border-indigo-500/20 rounded-2xl text-sm font-semibold flex items-center justify-center gap-1.5 transition duration-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add New List
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </main>

                {/* Card Inspector (Detail Modal) */}
                {selectedCard && (
                    <CardDetailModal
                        card={selectedCard}
                        users={users}
                        onClose={() => setSelectedCard(null)}
                        onUpdate={handleCardUpdated}
                        onDelete={handleCardDeleted}
                    />
                )}
            </div>
        </>
    );
}
