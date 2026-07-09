import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Event } from '@/types/Event';

export interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Event, 'id'>) => void;
    initialData?: Event | null;
    leagueId: number;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    leagueId
}) => {
    const [name, setName] = useState(initialData?.name ?? '');
    const [date, setDate] = useState(initialData?.date ? initialData.date.slice(0, 10) : '');
    const [startTime, setStartTime] = useState(initialData?.startTime ?? '');
    const [eventType, setEventType] = useState(initialData?.eventType ?? 'STANDARD');
    const [game, setGame] = useState(initialData?.game ?? 'TCG');
    const [entryFee, setEntryFee] = useState(initialData?.entryFee ?? '');
    const [ticketLink, setTicketLink] = useState(initialData?.ticketLink ?? '');
    const [description, setDescription] = useState(initialData?.description ?? '');
    const [prizes, setPrizes] = useState(initialData?.prizes ?? '');
    const [isRecurring, setIsRecurring] = useState(initialData?.isRecurring ?? false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                name,
                date,
                startTime: startTime ?? undefined,
                eventType,
                game,
                entryFee: entryFee ?? undefined,
                ticketLink: ticketLink ?? undefined,
                description: description ?? undefined,
                prizes: prizes ?? undefined,
                leagueId: initialData ? initialData.leagueId : leagueId,
                isRecurring
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-[rgba(17,24,39,0.6)] backdrop-blur-sm z-1000 flex items-center justify-center p-6 animate-[fadeIn_0.25s_ease-out]" onClick={onClose}>
            <div className="bg-bg-card border border-border-color rounded-lg w-full max-w-150 max-h-[90vh] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={(e) => e.stopPropagation()}>
                <div className="py-6 px-7 border-b border-border-color flex justify-between items-center [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-text-darker [&_h3]:tracking-tight">
                    <h3>{initialData ? 'Edit Event' : 'Schedule New Event'}</h3>
                    <button type="button" className="bg-transparent border-none text-xl text-text-muted cursor-pointer p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-bg-main hover:text-text-darker" onClick={onClose}>
                        X
                    </button>
                </div>
                <form className="flex flex-col gap-5 overflow-hidden" onSubmit={handleSubmit}>
                    <div className="p-7 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Event Title */}
                            <div className={"flex flex-col gap-1.5 relative sm:col-span-2"}>
                                <label htmlFor="eventName" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    Event Title <span className="text-primary text-[11px] font-semibold">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="eventName"
                                    placeholder="e.g. Standard League Challenge"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]`}
                                    required
                                />
                            </div>

                            {/* Date */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventDate" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    Date <span className="text-primary text-[11px] font-semibold">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="eventDate"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]`}
                                    required
                                />
                            </div>

                            {/* Start Time */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventStartTime" className="text-[13px] font-bold text-text-main flex justify-between items-center">Start Time</label>
                                <input
                                    type="time"
                                    id="eventStartTime"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                />
                            </div>

                            {/* Event Format */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventType" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    Format <span className="text-primary text-[11px] font-semibold">*</span>
                                </label>
                                <select
                                    id="eventType"
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                >
                                    <option value="STANDARD">Standard</option>
                                    <option value="CHALLENGE">League Challenge</option>
                                    <option value="CUP">League Cup</option>
                                    <option value="PRE-RELEASE">Pre-release</option>
                                    <option value="CASUAL">Casual</option>
                                </select>
                            </div>

                            {/* Game Title */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventGame" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    Game <span className="text-primary text-[11px] font-semibold">*</span>
                                </label>
                                <select
                                    id="eventGame"
                                    value={game}
                                    onChange={(e) => setGame(e.target.value)}
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                >
                                    <option value="TCG">TCG (Trading Card Game)</option>
                                    <option value="VGC">VGC (Video Game Championships)</option>
                                    <option value="GO">GO</option>
                                </select>
                            </div>

                            {/* Entry Fee */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventEntryFee" className="text-[13px] font-bold text-text-main flex justify-between items-center">Entry Fee</label>
                                <input
                                    type="text"
                                    id="eventEntryFee"
                                    placeholder="e.g. £10 or Free"
                                    value={entryFee}
                                    onChange={(e) => setEntryFee(e.target.value)}
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                />
                            </div>

                            {/* Ticket URL */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventTicketLink" className="text-[13px] font-bold text-text-main flex justify-between items-center">Registration Link</label>
                                <input
                                    type="url"
                                    id="eventTicketLink"
                                    placeholder="https://example.com/tickets"
                                    value={ticketLink}
                                    onChange={(e) => setTicketLink(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]`}
                                />
                            </div>

                            {/* Recurring Event Options */}
                            <div className="sm:col-span-2 flex flex-col gap-3 p-4 rounded-md border border-border-color bg-bg-main/30 mb-2">
                                <label className="flex items-center gap-3 cursor-pointer min-h-[44px] select-none">
                                    <input
                                        type="checkbox"
                                        id="eventIsRecurring"
                                        checked={isRecurring}
                                        onChange={(e) => setIsRecurring(e.target.checked)}
                                        className="w-5 h-5 rounded border border-border-color text-secondary focus:ring-secondary cursor-pointer transition-all duration-200"
                                    />
                                    <span className="text-sm font-bold text-text-main">
                                        Repeat Weekly
                                    </span>
                                </label>
                            </div>


                            {/* Description */}
                            <div className={"flex flex-col gap-1.5 relative sm:col-span-2"}>
                                <label htmlFor="eventDescription" className="text-[13px] font-bold text-text-main flex justify-between items-center">Description</label>
                                <textarea
                                    id="eventDescription"
                                    placeholder="Describe tournament rounds, standard regulations, match rules, etc."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y min-h-20"
                                />
                            </div>

                            {/* Prizes */}
                            <div className={"flex flex-col gap-1.5 relative sm:col-span-2"}>
                                <label htmlFor="eventPrizes" className="text-[13px] font-bold text-text-main flex justify-between items-center">Prizes Info</label>
                                <textarea
                                    id="eventPrizes"
                                    placeholder="e.g. Championship points, booster packs for participating"
                                    value={prizes}
                                    onChange={(e) => setPrizes(e.target.value)}
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y min-h-20"
                                />
                            </div>

                        </div>
                    </div>

                    <div className="border-t border-border-color py-5 px-7 flex justify-end gap-3 bg-bg-main shrink-0">
                        <button
                            type="button"
                            className="btn btn-secondary min-h-[44px] flex items-center justify-center"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary min-h-[44px] flex items-center justify-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Schedule Event')}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EventFormModal;
