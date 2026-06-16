import React from 'react';
import { createPortal } from 'react-dom';

export interface EventFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-[rgba(17,24,39,0.6)] backdrop-blur-sm z-1000 flex items-center justify-center p-6 animate-[fadeIn_0.25s_ease-out]" onClick={onClose}>
            <div className="bg-bg-card border border-border-color rounded-lg w-full max-w-150 max-h-[90vh] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={(e) => e.stopPropagation()}>
                <div className="py-6 px-7 border-b border-border-color flex justify-between items-center [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-text-darker [&_h3]:tracking-tight">
                    <h3>Schedule New Event</h3>
                    <button type="button" className="bg-transparent border-none text-xl text-text-muted cursor-pointer p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-bg-main hover:text-text-darker" onClick={onClose}>
                        X
                    </button>
                </div>
                <form className="flex flex-col gap-5">
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
                                    placeholder="e.g. Standard League Challenge"
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
                                    placeholder="https://example.com/tickets"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]`}
                                />
                            </div>

                            {/* Description */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="eventDescription" className="text-[13px] font-bold text-text-main flex justify-between items-center">Description</label>
                                <textarea
                                    id="eventDescription"
                                    placeholder="Describe tournament rounds, standard regulations, match rules, etc."
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y min-h-20"
                                />
                            </div>

                            {/* Prizes */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="eventPrizes" className="text-[13px] font-bold text-text-main flex justify-between items-center">Prizes Info</label>
                                <textarea
                                    id="eventPrizes"
                                    placeholder="e.g. Championship points, booster packs for participating"
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y min-h-20"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border-color py-5 px-7 flex justify-end gap-3 bg-bg-main">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default EventFormModal;
