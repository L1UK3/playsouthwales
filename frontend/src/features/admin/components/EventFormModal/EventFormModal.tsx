import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

import type { Event } from '@/types/Event';
import { useEventForm } from '../../hooks/useEventForm';

export interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingEvent: Event | null;
    onSave: (eventData: Omit<Event, 'id' | 'leagueId'>) => Promise<void>;
    isSaving: boolean;
}

/**
 * EventFormModal handles modal layouts and encapsulates form controls for event details.
 */
export const EventFormModal: React.FC<EventFormModalProps> = ({
    isOpen,
    onClose,
    editingEvent,
    onSave,
    isSaving,
}) => {
    const formState = useEventForm();
    const { prefillForm, resetForm, validateForm } = formState;

    useEffect(() => {
        if (isOpen) {
            if (editingEvent) {
                prefillForm(editingEvent);
            } else {
                resetForm();
            }
        }
    }, [isOpen, editingEvent, prefillForm, resetForm]);

    if (!isOpen) return null;

    const {
        formName,
        setFormName,
        formDate,
        setFormDate,
        formStartTime,
        setFormStartTime,
        formType,
        setFormType,
        formGame,
        setFormGame,
        formTicketLink,
        setFormTicketLink,
        formDescription,
        setFormDescription,
        formPrizes,
        setFormPrizes,
        formEntryFee,
        setFormEntryFee,
        errors,
    } = formState;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const eventData = {
            name: formName.trim(),
            date: formDate,
            startTime: formStartTime.trim() || undefined,
            type: formType,
            game: formGame,
            ticketLink: formTicketLink.trim() || undefined,
            description: formDescription.trim() || undefined,
            prizes: formPrizes.trim() || undefined,
            entryFee: formEntryFee.trim() || undefined,
        };

        try {
            await onSave(eventData);
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-[rgba(17,24,39,0.6)] backdrop-blur-[8px] z-[1000] flex items-center justify-center p-6 animate-[fadeIn_0.25s_ease-out]" onClick={onClose}>
            <div className="bg-bg-card border border-border-color rounded-lg w-full max-w-[600px] max-h-[90vh] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={(e) => e.stopPropagation()}>
                <div className="py-6 px-7 border-b border-border-color flex justify-between items-center [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-text-darker [&_h3]:tracking-tight">
                    <h3>{editingEvent ? 'Edit Tournament Event' : 'Schedule New Event'}</h3>
                    <button type="button" className="bg-transparent border-none text-xl text-text-muted cursor-pointer p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-bg-main hover:text-text-darker" onClick={onClose}>
                        X
                    </button>
                </div>
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                    <div className="p-7 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                            {/* Event Title */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="eventName" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    Event Title <span className="text-primary text-[11px] font-semibold">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="eventName"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Standard League Challenge"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.name ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                    required
                                />
                                {errors.name && <span className="text-[11px] text-red-500 font-semibold">{errors.name}</span>}
                            </div>

                            {/* Date */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventDate" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    Date <span className="text-primary text-[11px] font-semibold">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="eventDate"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.date ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                    required
                                />
                                {errors.date && <span className="text-[11px] text-red-500 font-semibold">{errors.date}</span>}
                            </div>

                            {/* Start Time */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventStartTime" className="text-[13px] font-bold text-text-main flex justify-between items-center">Start Time</label>
                                <input
                                    type="time"
                                    id="eventStartTime"
                                    value={formStartTime}
                                    onChange={(e) => setFormStartTime(e.target.value)}
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
                                    value={formType}
                                    onChange={(e) => setFormType(e.target.value)}
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
                                    value={formGame}
                                    onChange={(e) => setFormGame(e.target.value)}
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                >
                                    <option value="TCG">TCG (Trading Card Game)</option>
                                    <option value="VGC">VGC (Video Game Champ)</option>
                                    <option value="GO">GO (Pokémon GO)</option>
                                </select>
                            </div>

                            {/* Entry Fee */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventEntryFee" className="text-[13px] font-bold text-text-main flex justify-between items-center">Entry Fee</label>
                                <input
                                    type="text"
                                    id="eventEntryFee"
                                    value={formEntryFee}
                                    onChange={(e) => setFormEntryFee(e.target.value)}
                                    placeholder="e.g. £10 or Free"
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                />
                            </div>

                            {/* Ticket URL */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="eventTicketLink" className="text-[13px] font-bold text-text-main flex justify-between items-center">Registration Link</label>
                                <input
                                    type="url"
                                    id="eventTicketLink"
                                    value={formTicketLink}
                                    onChange={(e) => setFormTicketLink(e.target.value)}
                                    placeholder="https://example.com/tickets"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.ticketLink ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                />
                                {errors.ticketLink ? (
                                    <span className="text-[11px] text-red-500 font-semibold">{errors.ticketLink}</span>
                                ) : (
                                    <span className="text-[11px] text-text-muted">Link to ticket site or player sign-up</span>
                                )}
                            </div>

                            {/* Description */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="eventDescription" className="text-[13px] font-bold text-text-main flex justify-between items-center">Description</label>
                                <textarea
                                    id="eventDescription"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Describe tournament rounds, standard regulations, match rules, etc."
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y min-h-[80px]"
                                />
                            </div>

                            {/* Prizes */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="eventPrizes" className="text-[13px] font-bold text-text-main flex justify-between items-center">Prizes Info</label>
                                <textarea
                                    id="eventPrizes"
                                    value={formPrizes}
                                    onChange={(e) => setFormPrizes(e.target.value)}
                                    placeholder="e.g. Championship points, booster packs for participating"
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y min-h-[80px]"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-border-color py-5 px-7 flex justify-end gap-3 bg-bg-main">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                            disabled={isSaving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : editingEvent ? 'Save Changes' : 'Publish Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EventFormModal;
