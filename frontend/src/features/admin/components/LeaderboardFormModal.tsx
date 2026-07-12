import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Clipboard, HelpCircle } from 'lucide-react';

export interface LeaderboardEntry {
    position: number;
    name: string;
    wins: number;
    losses: number;
    draws: number;
    attendance: number;
    points: number;
}

interface LocalLeaderboardEntry extends LeaderboardEntry {
    tempId: string;
}

export interface LeaderboardFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: LeaderboardEntry[]) => Promise<void>;
    leagueId: number;
    initialData?: { data?: LeaderboardEntry[] } | null;
}

export const LeaderboardFormModal: React.FC<LeaderboardFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const [rows, setRows] = useState<LocalLeaderboardEntry[]>(() => {
        if (initialData && Array.isArray(initialData.data)) {
            return initialData.data.map((r, idx) => ({
                ...r,
                tempId: `row-${idx}-${r.name}`
            }));
        }
        return [];
    });
    const [pasteValue, setPasteValue] = useState('');
    const [showPasteArea, setShowPasteArea] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [prevInitialData, setPrevInitialData] = useState(initialData);

    if (initialData !== prevInitialData) {
        setPrevInitialData(initialData);
        setRows(initialData && Array.isArray(initialData.data)
            ? initialData.data.map((r, idx) => ({
                ...r,
                tempId: `row-${idx}-${r.name}`
            }))
            : []
        );
        setPasteValue('');
        setShowPasteArea(false);
        setErrorMsg('');
    }
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);



    if (!isOpen) return null;

    const handleAddRow = () => {
        const nextPos = rows.length + 1;
        const newRow: LocalLeaderboardEntry = {
            tempId: `row-${Date.now()}-${Math.random()}`,
            position: nextPos,
            name: '',
            wins: 0,
            losses: 0,
            draws: 0,
            attendance: 0,
            points: 0
        };
        setRows([...rows, newRow]);
    };

    const handleRemoveRow = (index: number) => {
        const updated = rows.filter((_row, idx) => idx !== index).map((row, idx) => ({
            ...row,
            position: idx + 1
        }));
        setRows(updated);
    };

    const handleFieldChange = (index: number, field: keyof LeaderboardEntry, value: string | number) => {
        const updated = [...rows];
        updated[index] = {
            ...updated[index],
            [field]: value
        };
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
        setRows(updated.map((row, idx) => ({
            ...row,
            position: idx + 1
        })));
        setDraggedIndex(null);
    };

    // Sort entries automatically by points descending, then wins, then attendance, then name
    const handleSortLeaderboard = () => {
        const sorted = [...rows].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.wins !== a.wins) return b.wins - a.wins;
            if (b.attendance !== a.attendance) return b.attendance - a.attendance;
            return a.name.localeCompare(b.name);
        }).map((row, idx) => ({
            ...row,
            position: idx + 1
        }));
        setRows(sorted);
    };

    const handleParsePaste = () => {
        if (!pasteValue.trim()) return;

        const lines = pasteValue.split(/\r?\n/).filter(line => line.trim());
        const newEntries: LeaderboardEntry[] = [];

        lines.forEach((line) => {
            // Split by tabs or commas
            const parts = line.split(/\t|,/).map(p => p.trim());
            if (parts.length === 0 || parts[0] === null || parts[0] === undefined) return;

            // Simple heuristics to parse fields:
            // Expect: Name, Wins, Losses, Draws, Attendance, Points (Comma/Tab separated)
            // Or just Name, Points
            const name = parts[0];
            let wins = 0;
            let losses = 0;
            let draws = 0;
            let attendance = 0;
            let points = 0;

            if (parts.length >= 6) {
                wins = parseInt(parts[1]) || 0;
                losses = parseInt(parts[2]) || 0;
                draws = parseInt(parts[3]) || 0;
                attendance = parseInt(parts[4]) || 0;
                points = parseInt(parts[5]) || 0;
            } else if (parts.length === 2) {
                points = parseInt(parts[1]) || 0;
            } else if (parts.length >= 3) {
                // Name, Wins, Points or similar
                wins = parseInt(parts[1]) || 0;
                points = parseInt(parts[2]) || 0;
            }

            newEntries.push({
                position: 0, // Assigned below after sorting
                name,
                wins,
                losses,
                draws,
                attendance,
                points
            });
        });

        if (newEntries.length > 0) {
            // Merge or replace
            const merged = [...rows, ...newEntries].sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                return b.wins - a.wins;
            }).map((entry, idx) => ({
                ...entry,
                tempId: (entry as any).tempId ?? `row-${Date.now()}-${idx}-${Math.random()}`,
                position: idx + 1
            }));
            setRows(merged);
            setPasteValue('');
            setShowPasteArea(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Validation
        const invalidRow = rows.find(r => !r.name.trim());
        if (invalidRow) {
            setErrorMsg('All players must have a name.');
            return;
        }

        setIsSubmitting(true);
        setErrorMsg('');
        try {
            if (!window.confirm('Save the updated standings for this league?')) {
                setIsSubmitting(false);
                return;
            }

            // Ensure positions are perfectly sequential based on points sorting
            const finalSorted = [...rows].sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.wins !== a.wins) return b.wins - a.wins;
                return b.attendance - a.attendance;
            }).map((r, idx) => {
                const rest = { ...r }; delete (rest as any).tempId;
                return {
                    ...rest,
                    position: idx + 1
                };
            });

            await onSubmit(finalSorted);
            onClose();
        } catch (err: any) {
            setErrorMsg(err.message ?? 'An error occurred updating leaderboards.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-[rgba(17,24,39,0.6)] backdrop-blur-sm z-1000 flex items-center justify-center p-6 animate-[fadeIn_0.25s_ease-out]" onClick={onClose}>
            <div className="bg-bg-card border-2 border-border-color rounded-lg w-full max-w-4xl max-h-[90vh] shadow-main flex flex-col overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={(e) => e.stopPropagation()}>
                <div className="py-5 px-7 border-b-2 border-border-color flex justify-between items-center bg-bg-card shrink-0">
                    <h3 className="text-xl font-extrabold text-text-darker tracking-tight m-0">
                        Manage Standings
                    </h3>
                    <button type="button" className="bg-transparent border-none text-xl text-text-muted cursor-pointer p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-bg-main hover:text-text-darker" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <form className="flex flex-col grow overflow-hidden" onSubmit={handleSubmit}>
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
                                    className="btn btn-secondary text-xs py-1.5 px-3 min-h-[38px] flex items-center gap-1.5 font-bold cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" /> Add Player Row
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowPasteArea(!showPasteArea)}
                                    className="btn btn-secondary text-xs py-1.5 px-3 min-h-[38px] flex items-center gap-1.5 font-bold cursor-pointer"
                                >
                                    <Clipboard className="w-4 h-4" /> {showPasteArea ? 'Hide Paste Area' : 'Import CSV/Paste'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSortLeaderboard}
                                    className="btn btn-secondary text-xs py-1.5 px-3 min-h-[38px] flex items-center gap-1.5 font-bold cursor-pointer"
                                >
                                    Auto-Sort
                                </button>
                            </div>
                            <span className="text-xs text-text-muted">
                                Total Players: <strong>{rows.length}</strong>
                            </span>
                        </div>

                        {showPasteArea && (
                            <div className="flex flex-col gap-2 p-4 bg-bg-main/50 rounded-lg border border-border-color border-dashed shrink-0">
                                <label htmlFor="pasteTextarea" className="text-xs font-bold text-text-main flex items-center gap-1">
                                    Paste Standings Data
                                    <span className="group relative cursor-pointer text-text-muted hover:text-text-main">
                                        <HelpCircle className="w-3.5 h-3.5 inline" />
                                        <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-64 bg-text-darker text-white p-2 rounded text-[11px] font-normal leading-normal shadow-lg z-50">
                                            Supported formats:<br />
                                            1. Name, Wins, Losses, Draws, Attendance, Points (Comma/Tab separated)<br />
                                            2. Name, Points (separated by Comma/Tab)
                                        </span>
                                    </span>
                                </label>
                                <textarea
                                    id="pasteTextarea"
                                    rows={4}
                                    placeholder="e.g. Luke Enness, 10, 0, 0, 5, 30"
                                    value={pasteValue}
                                    onChange={(e) => setPasteValue(e.target.value)}
                                    className="py-2.5 px-3 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] font-mono resize-y"
                                />
                                <div className="flex justify-end gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={handleParsePaste}
                                        className="btn btn-primary text-xs py-1.5 px-3.5 min-h-9 cursor-pointer"
                                    >
                                        Parse & Import
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grow overflow-auto rounded-lg border border-border-color bg-bg-card">
                            <table className="w-full border-collapse text-left">
                                <thead className="sticky top-0 bg-bg-card border-b border-border-color z-10">
                                    <tr className="text-[11px] font-bold text-text-muted uppercase tracking-wider bg-bg-main/50">
                                        <th className="py-2.5 px-3 w-14 text-center">Pos</th>
                                        <th className="py-2.5 px-3 min-w-40">Player Name</th>
                                        <th className="py-2.5 px-3 w-20 text-center">Wins</th>
                                        <th className="py-2.5 px-3 w-20 text-center">Losses</th>
                                        <th className="py-2.5 px-3 w-20 text-center">Draws</th>
                                        <th className="py-2.5 px-3 w-24 text-center">Attendance</th>
                                        <th className="py-2.5 px-3 w-24 text-right pr-6">Points</th>
                                        <th className="py-2.5 px-3 w-16 text-center">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-color/50">
                                    {rows.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-12 text-sm text-text-muted">
                                                No standings entries yet. Click "Add Player Row" or paste CSV data to begin.
                                            </td>
                                        </tr>
                                    ) : (
                                        rows.map((row, index) => (
                                            <tr
                                                key={row.tempId}
                                                className={`hover:bg-bg-main/20 ${draggedIndex === index ? 'opacity-60' : ''}`}
                                                draggable
                                                onDragStart={() => handleDragStart(index)}
                                                onDragOver={handleDragOver}
                                                onDrop={() => handleDrop(index)}
                                            >
                                                <td className="py-2 px-3 text-center text-sm font-semibold text-text-muted">
                                                    {row.position}
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Player name"
                                                        value={row.name}
                                                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                        className="py-1.5 px-2 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                                        required
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.wins}
                                                        onChange={(e) => handleFieldChange(index, 'wins', parseInt(e.target.value) || 0)}
                                                        className="py-1.5 px-2 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full text-center focus:outline-none focus:border-secondary"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.losses}
                                                        onChange={(e) => handleFieldChange(index, 'losses', parseInt(e.target.value) || 0)}
                                                        className="py-1.5 px-2 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full text-center focus:outline-none focus:border-secondary"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.draws}
                                                        onChange={(e) => handleFieldChange(index, 'draws', parseInt(e.target.value) || 0)}
                                                        className="py-1.5 px-2 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full text-center focus:outline-none focus:border-secondary"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={row.attendance}
                                                        onChange={(e) => handleFieldChange(index, 'attendance', parseInt(e.target.value) || 0)}
                                                        className="py-1.5 px-2 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full text-center focus:outline-none focus:border-secondary"
                                                    />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input
                                                        type="number"
                                                        value={row.points}
                                                        onChange={(e) => handleFieldChange(index, 'points', parseInt(e.target.value) || 0)}
                                                        className="py-1.5 px-2 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full text-right pr-3 font-semibold focus:outline-none focus:border-secondary"
                                                    />
                                                </td>
                                                <td className="py-2 px-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRow(index)}
                                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors min-w-11 min-h-11 inline-flex items-center justify-center border-none bg-transparent cursor-pointer"
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

                    <div className="border-t-2 border-border-color py-5 px-7 flex justify-end gap-3 bg-bg-main shrink-0">
                        <button
                            type="button"
                            className="btn btn-secondary min-h-11 flex items-center justify-center cursor-pointer"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary min-h-11 flex items-center justify-center cursor-pointer"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving…' : 'Save Standings'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};
export default LeaderboardFormModal;
