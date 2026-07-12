import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { League } from '@/types/League';

export interface LeagueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<League, 'leagueId'> & { leagueId?: number; id?: number }) => void;
    initialData?: League | null;
}

export const LeagueFormModal: React.FC<LeagueFormModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData
}) => {
    const [leagueId, setLeagueId] = useState(initialData?.leagueId ? String(initialData.leagueId) : '');
    const [name, setName] = useState(initialData?.name ?? '');
    const [location, setLocation] = useState(initialData?.location ?? '');
    const [latitude, setLatitude] = useState(initialData?.latitude ? String(initialData.latitude) : '');
    const [longitude, setLongitude] = useState(initialData?.longitude ? String(initialData.longitude) : '');
    const [brandColor, setBrandColor] = useState(initialData?.brandColor ?? '#ff0000');
    const [logo, setLogo] = useState(initialData?.logo ?? '');
    const [website, setWebsite] = useState(initialData?.website ?? '');
    const [eventLink, setEventLink] = useState(initialData?.eventLink ?? '');
    const [socialLink, setSocialLink] = useState(initialData?.socialLink ?? '');
    const [directions, setDirections] = useState(initialData?.directions ?? '');
    const [accessibility, setAccessibility] = useState(initialData?.accessibility ?? '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Preserve the isChampionshipSeries flag from initialData — this is not editable via the form
    const isChampionshipSeries = initialData?.isChampionshipSeries ?? false;

    const isChampionshipLeague = isChampionshipSeries;

    const errors: Record<string, string> = {};

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await onSubmit({
                leagueId: leagueId ? parseInt(leagueId) : undefined,
                id: leagueId ? parseInt(leagueId) : undefined,
                name,
                location,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                brandColor,
                logo,
                website,
                eventLink,
                socialLink,
                directions: directions || undefined,
                accessibility: accessibility || undefined,
                isChampionshipSeries
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-[rgba(17,24,39,0.6)] backdrop-blur-sm z-1000 flex items-center justify-center p-6 animate-[fadeIn_0.25s_ease-out]" onClick={onClose}>
            <div className="bg-bg-card border border-border-color rounded-lg w-full max-w-162.5 max-h-[90vh] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={(e) => e.stopPropagation()}>
                <div className="py-6 px-7 border-b border-border-color flex justify-between items-center [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-text-darker [&_h3]:tracking-tight">
                    <div className="flex flex-col gap-0.5">
                        <h3>
                            {isChampionshipLeague
                                ? (initialData ? 'Edit Championship Series' : 'Add Championship Series')
                                : (initialData ? 'Edit League / Store' : 'Add New League / Store')}
                        </h3>
                        {isChampionshipLeague && (
                            <span className="text-[12px] font-semibold text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-0.5 w-fit">
                                Championship Series — Worlds, Regionals &amp; Special Events
                            </span>
                        )}
                    </div>
                    <button type="button" className="bg-transparent border-none text-xl text-text-muted cursor-pointer p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-bg-main hover:text-text-darker" onClick={onClose}>
                        X
                    </button>
                </div>
                <form className="flex flex-col gap-5 overflow-hidden" onSubmit={handleSubmit}>
                    <div className="p-7 overflow-y-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* League ID Field */}
                            <div className={"flex flex-col gap-1.5 relative sm:col-span-2"}>
                                <label htmlFor="leagueIdField" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    {isChampionshipLeague ? 'Series ID (Official ID - can be skipped)' : 'League ID (Official League ID - can be skipped if not known/not applicable)'}
                                </label>
                                <input
                                    type="number"
                                    id="leagueIdField"
                                    placeholder=""
                                    value={leagueId}
                                    onChange={(e) => setLeagueId(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]`}
                                />
                            </div>

                            {/* League Name */}
                            <div className={"flex flex-col gap-1.5 relative sm:col-span-2"}>
                                <label htmlFor="leagueName" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    {isChampionshipLeague ? 'Series Name' : 'League Name'} <span className="text-primary text-[11px] font-semibold">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="leagueName"
                                    placeholder=""
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.name ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                    required
                                />
                            </div>

                            {/* Location */}
                            <div className={"flex flex-col gap-1.5 relative sm:col-span-2"}>
                                <label htmlFor="leagueLocation" className="text-[13px] font-bold text-text-main flex justify-between items-center">
                                    {isChampionshipLeague ? 'Venue / Region' : 'Address'}
                                </label>
                                <input
                                    type="text"
                                    id="leagueLocation"
                                    placeholder={isChampionshipLeague ? 'e.g. Cardiff, Wales' : ''}
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                />
                            </div>


                            { /* TODO: Implement automatic location detection, when an address is entered in the above field */}
                            {/* Latitude */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueLatitude" className="text-[13px] font-bold text-text-main flex justify-between items-center">Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    id="leagueLatitude"
                                    placeholder="e.g. 51.4816"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.latitude ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
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
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.longitude ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* Brand Color */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueBrandColor" className="text-[13px] font-bold text-text-main flex justify-between items-center">Brand Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        id="leagueBrandColor"
                                        value={brandColor}
                                        onChange={(e) => setBrandColor(e.target.value)}
                                        className="p-0.5 w-11 h-11 rounded-md border border-border-color cursor-pointer bg-transparent focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                    />
                                    <input
                                        type="text"
                                        placeholder="#FF0000"
                                        maxLength={7}
                                        value={brandColor}
                                        onChange={(e) => setBrandColor(e.target.value)}
                                        className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
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
                                    value={logo}
                                    onChange={(e) => setLogo(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.logo ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* Website URL */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueWebsite" className="text-[13px] font-bold text-text-main flex justify-between items-center">Official Website URL</label>
                                <input
                                    type="url"
                                    id="leagueWebsite"
                                    placeholder="https://example.com"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.website ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* TCG Link */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueEventLink" className="text-[13px] font-bold text-text-main flex justify-between items-center">TCG Event Page URL</label>
                                <input
                                    type="url"
                                    id="leagueEventLink"
                                    placeholder="https://events.example.com/…"
                                    value={eventLink}
                                    onChange={(e) => setEventLink(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.eventLink ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* Social Link */}
                            <div className={"flex flex-col gap-1.5 relative sm:col-span-2"}>
                                <label htmlFor="leagueSocialLink" className="text-[13px] font-bold text-text-main flex justify-between items-center">Social Media URL (e.g. Facebook)</label>
                                <input
                                    type="url"
                                    id="leagueSocialLink"
                                    placeholder="https://facebook.com/…"
                                    value={socialLink}
                                    onChange={(e) => setSocialLink(e.target.value)}
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.socialLink ? "border-red-500! focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]!" : ""}`}
                                />
                            </div>

                            {/* Directions — hidden for championship series */}
                            {!isChampionshipLeague && (
                                <div className="flex flex-col gap-1.5 relative sm:col-span-2">
                                    <label htmlFor="leagueDirections" className="text-[13px] font-bold text-text-main flex justify-between items-center">Directions</label>
                                    <textarea
                                        id="leagueDirections"
                                        placeholder="Describe how to get to the store, parking information, public transport details, etc."
                                        value={directions}
                                        onChange={(e) => setDirections(e.target.value)}
                                        className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y min-h-20"
                                    />
                                </div>
                            )}

                            {/* Accessibility — hidden for championship series */}
                            {!isChampionshipLeague && (
                                <div className="flex flex-col gap-1.5 relative sm:col-span-2">
                                    <label htmlFor="leagueAccessibility" className="text-[13px] font-bold text-text-main flex justify-between items-center">Accessibility Info</label>
                                    <textarea
                                        id="leagueAccessibility"
                                        placeholder="Describe wheelchair access, steps, lighting, sound, or other accessibility accommodations."
                                        value={accessibility}
                                        onChange={(e) => setAccessibility(e.target.value)}
                                        className="py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-[background-color,border-color] duration-150 ease-out focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] resize-y min-h-20"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-border-color py-5 px-7 flex justify-end gap-3 bg-bg-main shrink-0">
                        <button
                            type="button"
                            className="btn btn-secondary min-h-11 flex items-center justify-center"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary min-h-11 flex items-center justify-center"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Saving…' : (initialData ? 'Save Changes' : (isChampionshipLeague ? 'Create Series' : 'Create League'))}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default LeagueFormModal;