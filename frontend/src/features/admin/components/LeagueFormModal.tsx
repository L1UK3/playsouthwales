import React from 'react';
import { createPortal } from 'react-dom';

export interface LeagueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
}


export const LeagueFormModal: React.FC<LeagueFormModalProps> = ({
    isOpen,
    onClose
}) => {
    const errors: Record<string, string> = {};

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-[rgba(17,24,39,0.6)] backdrop-blur-sm z-1000 flex items-center justify-center p-6 animate-[fadeIn_0.25s_ease-out]" onClick={onClose}>
            <div className="bg-bg-card border border-border-color rounded-lg w-full max-w-162.5 max-h-[90vh] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={(e) => e.stopPropagation()}>
                <div className="py-6 px-7 border-b border-border-color flex justify-between items-center [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-text-darker [&_h3]:tracking-tight">
                    <h3>{'Add New League / Store'}</h3>
                    <button type="button" className="bg-transparent border-none text-xl text-text-muted cursor-pointer p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-bg-main hover:text-text-darker" onClick={onClose}>
                        X
                    </button>
                </div>
                <form className="flex flex-col gap-5">
                    <div className="p-7 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
                            {/* Store Name */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="leagueName" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    Store Name <span className="text-primary text-[11px] font-semibold">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="leagueName"
                                    placeholder="e.g. Firestorm Games Cardiff"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.name ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="leagueLocation" className="text-[13px] font-bold text-text-main flex justify-between items-center">Location / Address</label>
                                <input
                                    type="text"
                                    id="leagueLocation"
                                    placeholder="e.g. Cardiff, UK"
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                />
                            </div>

                            {/* Latitude */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueLatitude" className="text-[13px] font-bold text-text-main flex justify-between items-center">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    id="leagueLatitude"
                                    placeholder="e.g. 51.4816"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.latitude ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* Longitude */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueLongitude" className="text-[13px] font-bold text-text-main flex justify-between items-center">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    id="leagueLongitude"
                                    placeholder="e.g. -3.1791"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.longitude ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* Brand Color */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueBrandColor" className="text-[13px] font-bold text-text-main flex justify-between items-center">Brand Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        id="leagueBrandColor"
                                        className="p-0.5 w-11 h-11 rounded-md border border-border-color cursor-pointer bg-transparent focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                    />
                                    <input
                                        type="text"
                                        placeholder="#FF0000"
                                        maxLength={7}
                                        className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>

                            {/* Logo URL */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueLogo" className="text-[13px] font-bold text-text-main flex justify-between items-center">Logo Image URL</label>
                                <input
                                    type="url"
                                    id="leagueLogo"
                                    placeholder="https://example.com/logo.png"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.logo ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* Website URL */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueWebsite" className="text-[13px] font-bold text-text-main flex justify-between items-center">Official Website URL</label>
                                <input
                                    type="url"
                                    id="leagueWebsite"
                                    placeholder="https://example.com"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.website ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* Pokémon Link */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leaguePokemonLink" className="text-[13px] font-bold text-text-main flex justify-between items-center">Pokémon Event Page URL</label>
                                <input
                                    type="url"
                                    id="leaguePokemonLink"
                                    placeholder="https://events.pokemon.com/..."
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.pokemonLink ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* Social Link */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="leagueSocialLink" className="text-[13px] font-bold text-text-main flex justify-between items-center">Social Media URL (e.g. Facebook)</label>
                                <input
                                    type="url"
                                    id="leagueSocialLink"
                                    placeholder="https://facebook.com/..."
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.socialLink ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
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
                            Create League
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default LeagueFormModal;
