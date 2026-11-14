import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2 } from 'lucide-react';
import type { Top20PlayerInput } from '@/services/api';

export interface NationalRankingsEntry extends Top20PlayerInput {
    tempId: string;
    position: number;
}

export interface NationalRankingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (players: Top20PlayerInput[]) => Promise<void>;
    initialPlayers?: { name: string; cp: number; playerId?: number }[];
}

export const NationalRankingsModal: React.FC<NationalRankingsModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialPlayers = [],
}) => {
    const [rows, setRows] = useState<NationalRankingsEntry[]>(() => {
        return (initialPlayers || []).map((p, idx) => ({
            tempId: `player-${idx}-${p.name}`,
            position: idx + 1,
            name: p.name,
            cp: p.cp ?? 0,
            playerId: p.playerId ?? 0,
        }));
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [prevInitial, setPrevInitial] = useState(initialPlayers);

    if (initialPlayers !== prevInitial) {
        setPrevInitial(initialPlayers);
        setRows(
            (initialPlayers || []).map((p, idx) => ({
                tempId: `player-${idx}-${p.name}`,
                position: idx + 1,
                name: p.name,
                cp: p.cp ?? 0,
                playerId: p.playerId ?? 0,
            }))
        );
        setErrorMsg('');
    }

    if (!isOpen) return null;

    const handleAddRow = () => {
        const nextPos = rows.length + 1;
        const newRow: NationalRankingsEntry = {
            tempId: `player-${Date.now()}-${Math.random()}`,
            position: nextPos,
            name: '',
            cp: 0,
            playerId: 0,
        };
        setRows([...rows, newRow]);
    };

    const handleRemoveRow = (index: number) => {
        const updated = rows
            .filter((_, idx) => idx !== index)
            .map((row, idx) => ({
                ...row,
                position: idx + 1,
            }));
        setRows(updated);
    };

    const handleFieldChange = (
        index: number,
        field: 'name' | 'cp' | 'playerId',
        value: string | number
    ) => {
        const updated = [...rows];
        if (field === 'cp') {
            const num = parseInt(String(value), 10);
            updated[index] = {
                ...updated[index],
                cp: isNaN(num) ? 0 : Math.max(0, num),
            };
        } else {
            updated[index] = {
                ...updated[index],
                [field]: String(value),
            };
        }
        setRows(updated);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
        event.preventDefault();
    };

    const handleDrop = (dropIndex: number) => {
        if (draggedIndex === null || draggedIndex === dropIndex) return;

        const updated = [...rows];
        const [movedRow] = updated.splice(draggedIndex, 1);
        updated.splice(dropIndex, 0, movedRow);
        setRows(
            updated.map((row, idx) => ({
                ...row,
                position: idx + 1,
            }))
        );
        setDraggedIndex(null);
    };

    const handleSortLeaderboard = () => {
        const sorted = [...rows]
            .sort((a, b) => {
                if (b.cp !== a.cp) return b.cp - a.cp;
                return a.name.localeCompare(b.name);
            })
            .map((row, idx) => ({
                ...row,
                position: idx + 1,
            }));
        setRows(sorted);
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        const invalidRow = rows.find((r) => !r.name.trim());
        if (invalidRow) {
            setErrorMsg('All players must have a name.');
            return;
        }

        setIsSubmitting(true);

        try {
            await onSubmit(
                rows.map((r) => ({
                    name: r.name.trim(),
                    cp: r.cp,
                    playerId: r.playerId,
                }))
            );
            onClose();
        } catch (error) {
            console.error('Error saving national rankings:', error);
            setErrorMsg('Failed to save rankings. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-[rgba(17,24,39,0.6)] backdrop-blur-sm z-1000 flex items-center justify-center p-6 animate-[fadeIn_0.25s_ease-out]"
            onClick={onClose}
        >
            <div
                className="bg-bg-card border-2 border-border-color rounded-lg w-full max-w-3xl max-h-[90vh] shadow-main flex flex-col overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="py-5 px-7 border-b-2 border-border-color flex justify-between items-center bg-bg-card shrink-0">
                    <div>
                        <h3 className="text-xl font-extrabold text-text-darker tracking-tight m-0">
                            Edit National Rankings
                        </h3>
                        <p className="text-xs text-text-muted mt-0.5">
                            Manage official Championship Points (CP) for Welsh
                            players.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="bg-transparent border-none text-xl text-text-muted cursor-pointer p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-bg-main hover:text-text-darker"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <form
                    className="flex flex-col grow overflow-hidden"
                    onSubmit={handleSubmit}
                >
                    <div className="p-7 overflow-y-auto grow flex flex-col gap-4">
                        {errorMsg && (
                            <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm font-semibold">
                                {errorMsg}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2.5 justify-between items-center bg-bg-main/30 p-3.5 rounded-lg border border-border-color/50">
                            <div className="flex gap-2.5">
                                <button
                                    type="button"
                                    onClick={handleAddRow}
                                    className="btn btn-secondary text-xs py-1.5 px-3 min-h-9.5 flex items-center gap-1.5 font-bold cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Add Player Row
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSortLeaderboard}
                                    className="btn btn-secondary text-xs py-1.5 px-3 min-h-9.5 flex items-center gap-1.5 font-bold cursor-pointer"
                                >
                                    Auto-Sort (by CP)
                                </button>
                            </div>
                            <span className="text-xs text-text-muted">
                                Total Players: <strong>{rows.length}</strong>
                            </span>
                        </div>

                        <div className="grow overflow-auto rounded-lg border border-border-color bg-bg-card">
                            <table className="w-full border-collapse text-left">
                                <thead className="sticky top-0 bg-bg-card border-b border-border-color z-10">
                                    <tr className="text-[11px] font-bold text-text-muted uppercase tracking-wider bg-bg-main/50">
                                        <th className="py-2.5 px-3 w-16 text-center">
                                            Rank
                                        </th>
                                        <th className="py-2.5 px-3 min-w-44">
                                            Player Name
                                        </th>
                                        <th className="py-2.5 px-3 w-32 text-center">
                                            Player ID
                                        </th>
                                        <th className="py-2.5 px-3 w-32 text-right pr-6">
                                            Championship Points (CP)
                                        </th>
                                        <th className="py-2.5 px-3 w-16 text-center">
                                            Delete
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color/50">
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="text-center py-12 text-sm text-text-muted"
                                            >
                                                No players in national rankings
                                                yet. Click "Add Player Row" to begin.
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row, index) => (
                                            <tr
                                                key={row.tempId}
                                                className={`hover:bg-bg-main/20 ${draggedIndex === index ? 'opacity-60' : ''}`}
                                                draggable
                                                onDragStart={() =>
                                                    handleDragStart(index)
                                                }
                                                onDragOver={handleDragOver}
                                                onDrop={() => handleDrop(index)}
                                            >
                                                <td className="py-2 px-3 text-center text-sm font-semibold text-text-muted">
                                                    #{row.position}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Player name"
                                                        value={row.name}
                                                        aria-label={`Player ${row.position} Name`}
                                                        onChange={(e) =>
                                                            handleFieldChange(
                                                                index,
                                                                'name',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="py-1.5 px-2 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full focus:outline-none focus:border-secondary"
                                                    />
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        placeholder="POP ID"
                                                        value={row.playerId ?? ''}
                                                        aria-label={`Player ${row.position} ID`}
                                                        onChange={(e) =>
                                                            handleFieldChange(
                                                                index,
                                                                'playerId',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="py-1.5 px-2 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-28 text-center focus:outline-none focus:border-secondary"
                                                    />
                                                </td>
                                                <td className="py-2 px-3 text-right pr-4">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        value={row.cp}
                                                        aria-label={`Player ${row.position} CP`}
                                                        onChange={(e) =>
                                                            handleFieldChange(
                                                                index,
                                                                'cp',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="py-1.5 px-2 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-24 text-right focus:outline-none focus:border-secondary"
                                                    />
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveRow(
                                                                index
                                                            )
                                                        }
                                                        className="p-1.5 text-text-muted hover:text-accent bg-transparent border-none rounded cursor-pointer transition-colors"
                                                        title="Delete player"
                                                        aria-label={`Delete ${row.name || 'player'}`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="py-4 px-7 border-t-2 border-border-color bg-bg-card flex justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="btn btn-secondary py-2 px-4 text-sm font-semibold cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary py-2 px-5 text-sm font-bold min-w-28 flex items-center justify-center cursor-pointer"
                        >
                            {isSubmitting ? 'Saving…' : 'Save Rankings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default NationalRankingsModal;
