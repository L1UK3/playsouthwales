import React, { useEffect, useRef } from 'react';
import styles from './LeagueFormModal.module.css';
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

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{editingLeague ? 'Edit League / Store' : 'Add New League / Store'}</h3>
                    <button type="button" className={styles.closeButton} onClick={onClose}>
                        X
                    </button>
                </div>
                <form onSubmit={handleFormSubmit} className={styles.form}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGrid}>
                            {/* Store Name */}
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label htmlFor="leagueName" className={styles.label}>
                                    Store Name <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="leagueName"
                                    ref={nameInputRef}
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Firestorm Games Cardiff"
                                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                                    required
                                />
                                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                            </div>

                            {/* Location */}
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label htmlFor="leagueLocation" className={styles.label}>Location / Address</label>
                                <input
                                    type="text"
                                    id="leagueLocation"
                                    value={formLocation}
                                    onChange={(e) => setFormLocation(e.target.value)}
                                    placeholder="e.g. Cardiff, UK"
                                    className={styles.input}
                                />
                            </div>

                            {/* Latitude */}
                            <div className={styles.formGroup}>
                                <label htmlFor="leagueLatitude" className={styles.label}>Latitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    id="leagueLatitude"
                                    value={formLatitude}
                                    onChange={(e) => setFormLatitude(e.target.value)}
                                    placeholder="e.g. 51.4816"
                                    className={`${styles.input} ${errors.latitude ? styles.inputError : ''}`}
                                />
                                {errors.latitude && <span className={styles.errorText}>{errors.latitude}</span>}
                            </div>

                            {/* Longitude */}
                            <div className={styles.formGroup}>
                                <label htmlFor="leagueLongitude" className={styles.label}>Longitude</label>
                                <input
                                    type="number"
                                    step="any"
                                    id="leagueLongitude"
                                    value={formLongitude}
                                    onChange={(e) => setFormLongitude(e.target.value)}
                                    placeholder="e.g. -3.1791"
                                    className={`${styles.input} ${errors.longitude ? styles.inputError : ''}`}
                                />
                                {errors.longitude && <span className={styles.errorText}>{errors.longitude}</span>}
                            </div>

                            {/* Brand Color */}
                            <div className={styles.formGroup}>
                                <label htmlFor="leagueBrandColor" className={styles.label}>Brand Color</label>
                                <div className={styles.colorPickerGroup}>
                                    <input
                                        type="color"
                                        id="leagueBrandColor"
                                        value={formBrandColor}
                                        onChange={(e) => setFormBrandColor(e.target.value)}
                                        className={styles.colorInput}
                                    />
                                    <input
                                        type="text"
                                        value={formBrandColor}
                                        onChange={(e) => setFormBrandColor(e.target.value)}
                                        placeholder="#FF0000"
                                        maxLength={7}
                                        className={styles.input}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>

                            {/* Logo URL */}
                            <div className={styles.formGroup}>
                                <label htmlFor="leagueLogo" className={styles.label}>Logo Image URL</label>
                                <input
                                    type="url"
                                    id="leagueLogo"
                                    value={formLogo}
                                    onChange={(e) => setFormLogo(e.target.value)}
                                    placeholder="https://example.com/logo.png"
                                    className={`${styles.input} ${errors.logo ? styles.inputError : ''}`}
                                />
                                {errors.logo && <span className={styles.errorText}>{errors.logo}</span>}
                            </div>

                            {/* Website URL */}
                            <div className={styles.formGroup}>
                                <label htmlFor="leagueWebsite" className={styles.label}>Official Website URL</label>
                                <input
                                    type="url"
                                    id="leagueWebsite"
                                    value={formWebsite}
                                    onChange={(e) => setFormWebsite(e.target.value)}
                                    placeholder="https://example.com"
                                    className={`${styles.input} ${errors.website ? styles.inputError : ''}`}
                                />
                                {errors.website && <span className={styles.errorText}>{errors.website}</span>}
                            </div>

                            {/* Pokémon Link */}
                            <div className={styles.formGroup}>
                                <label htmlFor="leaguePokemonLink" className={styles.label}>Pokémon Event Page URL</label>
                                <input
                                    type="url"
                                    id="leaguePokemonLink"
                                    value={formPokemonLink}
                                    onChange={(e) => setFormPokemonLink(e.target.value)}
                                    placeholder="https://events.pokemon.com/..."
                                    className={`${styles.input} ${errors.pokemonLink ? styles.inputError : ''}`}
                                />
                                {errors.pokemonLink && <span className={styles.errorText}>{errors.pokemonLink}</span>}
                            </div>

                            {/* Social Link */}
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label htmlFor="leagueSocialLink" className={styles.label}>Social Media URL (e.g. Facebook)</label>
                                <input
                                    type="url"
                                    id="leagueSocialLink"
                                    value={formSocialLink}
                                    onChange={(e) => setFormSocialLink(e.target.value)}
                                    placeholder="https://facebook.com/..."
                                    className={`${styles.input} ${errors.socialLink ? styles.inputError : ''}`}
                                />
                                {errors.socialLink && <span className={styles.errorText}>{errors.socialLink}</span>}
                            </div>
                        </div>
                    </div>
                    <div className={styles.formActions}>
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
        </div>
    );
};

export default LeagueFormModal;
