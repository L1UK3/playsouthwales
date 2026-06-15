import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import type { League } from '@/types/League';
import { useLeagueForm } from '../../hooks/useLeagueForm';

export interface LeagueFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingLeague: League | null;
    onSave: (leagueData: Omit<League, 'leagueId'>) => Promise<void>;
    isSaving: boolean;
}

/**
 * LeagueFormModal handles modal layouts and encapsulates form controls for store/league details.
 */
export const LeagueFormModal: React.FC<LeagueFormModalProps> = ({
    isOpen,
    onClose,
    editingLeague,
    onSave,
    isSaving,
}) => {
    const formState = useLeagueForm();
    const { prefillForm, resetForm, validateForm } = formState;
    const nameInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (editingLeague) {
                prefillForm(editingLeague);
            } else {
                resetForm();
            }
            // Auto-focus the first field for optimal user flow
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, editingLeague, prefillForm, resetForm]);

    if (!isOpen) return null;

    const {
        formName,
        setFormName,
        formLogo,
        setFormLogo,
        formWebsite,
        setFormWebsite,
        formSocialLink,
        setFormSocialLink,
        formPokemonLink,
        setFormPokemonLink,
        formBrandColor,
        setFormBrandColor,
        formLocation,
        setFormLocation,
        formLatitude,
        setFormLatitude,
        formLongitude,
        setFormLongitude,
        errors,
    } = formState;

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const leagueData = {
            name: formName.trim(),
            logo: formLogo.trim() || undefined,
            website: formWebsite.trim() || undefined,
            socialLink: formSocialLink.trim() || undefined,
            pokemonLink: formPokemonLink.trim() || undefined,
            brandColor: formBrandColor,
            location: formLocation.trim() || undefined,
            latitude: formLatitude.trim() ? parseFloat(formLatitude) : undefined,
            longitude: formLongitude.trim() ? parseFloat(formLongitude) : undefined,
        };

        try {
            await onSave(leagueData);
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-[rgba(17,24,39,0.6)] backdrop-blur-[8px] z-[1000] flex items-center justify-center p-6 animate-[fadeIn_0.25s_ease-out]" onClick={onClose}>
            <div className="bg-bg-card border border-border-color rounded-lg w-full max-w-[650px] max-h-[90vh] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.15),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex flex-col overflow-hidden animate-[slideUp_0.3s_cubic-bezier(0.16,1,0.3,1)]" onClick={(e) => e.stopPropagation()}>
                <div className="py-6 px-7 border-b border-border-color flex justify-between items-center [&_h3]:text-xl [&_h3]:font-extrabold [&_h3]:text-text-darker [&_h3]:tracking-tight">
                    <h3>{editingLeague ? 'Edit League / Store' : 'Add New League / Store'}</h3>
                    <button type="button" className="bg-transparent border-none text-xl text-text-muted cursor-pointer p-1 rounded-full w-8 h-8 flex items-center justify-center hover:bg-bg-main hover:text-text-darker" onClick={onClose}>
                        X
                    </button>
                </div>
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
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
                                    ref={nameInputRef}
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Firestorm Games Cardiff"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.name ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                    required
                                />
                                {errors.name && <span className="text-[11px] text-red-500 font-semibold">{errors.name}</span>}
                            </div>

                            {/* Location */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="leagueLocation" className="text-[13px] font-bold text-text-main flex justify-between items-center">Location / Address</label>
                                <input
                                    type="text"
                                    id="leagueLocation"
                                    value={formLocation}
                                    onChange={(e) => setFormLocation(e.target.value)}
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
                                    value={formLatitude}
                                    onChange={(e) => setFormLatitude(e.target.value)}
                                    placeholder="e.g. 51.4816"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.latitude ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                />
                                {errors.latitude && <span className="text-[11px] text-red-500 font-semibold">{errors.latitude}</span>}
                            </div>

                            {/* Longitude */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueLongitude" className="text-[13px] font-bold text-text-main flex justify-between items-center">Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    id="leagueLongitude"
                                    value={formLongitude}
                                    onChange={(e) => setFormLongitude(e.target.value)}
                                    placeholder="e.g. -3.1791"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.longitude ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                />
                                {errors.longitude && <span className="text-[11px] text-red-500 font-semibold">{errors.longitude}</span>}
                            </div>

                            {/* Brand Color */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueBrandColor" className="text-[13px] font-bold text-text-main flex justify-between items-center">Brand Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        id="leagueBrandColor"
                                        value={formBrandColor}
                                        onChange={(e) => setFormBrandColor(e.target.value)}
                                        className="p-0.5 w-11 h-11 rounded-md border border-border-color cursor-pointer bg-transparent focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)]"
                                    />
                                    <input
                                        type="text"
                                        value={formBrandColor}
                                        onChange={(e) => setFormBrandColor(e.target.value)}
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
                                    value={formLogo}
                                    onChange={(e) => setFormLogo(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.logo ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                />
                                {errors.logo && <span className="text-[11px] text-red-500 font-semibold">{errors.logo}</span>}
                            </div>

                            {/* Website URL */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leagueWebsite" className="text-[13px] font-bold text-text-main flex justify-between items-center">Official Website URL</label>
                                <input
                                    type="url"
                                    id="leagueWebsite"
                                    value={formWebsite}
                                    onChange={(e) => setFormWebsite(e.target.value)}
                                    placeholder="https://example.com"
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.website ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                />
                                {errors.website && <span className="text-[11px] text-red-500 font-semibold">{errors.website}</span>}
                            </div>

                            {/* Pokémon Link */}
                            <div className="flex flex-col gap-1.5 relative">
                                <label htmlFor="leaguePokemonLink" className="text-[13px] font-bold text-text-main flex justify-between items-center">Pokémon Event Page URL</label>
                                <input
                                    type="url"
                                    id="leaguePokemonLink"
                                    value={formPokemonLink}
                                    onChange={(e) => setFormPokemonLink(e.target.value)}
                                    placeholder="https://events.pokemon.com/..."
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.pokemonLink ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                />
                                {errors.pokemonLink && <span className="text-[11px] text-red-500 font-semibold">{errors.pokemonLink}</span>}
                            </div>

                            {/* Social Link */}
                            <div className={"flex flex-col gap-1.5 relative col-span-2 max-[480px]:col-span-1"}>
                                <label htmlFor="leagueSocialLink" className="text-[13px] font-bold text-text-main flex justify-between items-center">Social Media URL (e.g. Facebook)</label>
                                <input
                                    type="url"
                                    id="leagueSocialLink"
                                    value={formSocialLink}
                                    onChange={(e) => setFormSocialLink(e.target.value)}
                                    placeholder="https://facebook.com/..."
                                    className={`py-3 px-3.5 rounded-md border border-border-color text-sm bg-bg-card text-text-main w-full transition-all duration-200 focus:outline-none focus:border-secondary focus:shadow-[0_0_0_3px_rgba(49,104,177,0.15)] ${errors.socialLink ? "!border-red-500 focus:!shadow-[0_0_0_3px_rgba(239,68,68,0.15)]" : ""}`}
                                />
                                {errors.socialLink && <span className="text-[11px] text-red-500 font-semibold">{errors.socialLink}</span>}
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
                            {isSaving ? 'Saving...' : editingLeague ? 'Save Changes' : 'Create League'}
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

export default LeagueFormModal;
