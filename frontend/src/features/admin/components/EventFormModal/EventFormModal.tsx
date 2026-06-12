import React, { useEffect } from 'react';
import styles from './EventFormModal.module.css';
import { X } from 'lucide-react';
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

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h3>{editingEvent ? 'Edit Tournament Event' : 'Schedule New Event'}</h3>
                    <button type="button" className={styles.closeButton} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleFormSubmit} className={styles.form}>
                    <div className={styles.modalBody}>
                        <div className={styles.formGrid}>
                            {/* Event Title */}
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label htmlFor="eventName" className={styles.label}>
                                    Event Title <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    id="eventName"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="e.g. Standard League Challenge"
                                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                                    required
                                />
                                {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                            </div>

                            {/* Date */}
                            <div className={styles.formGroup}>
                                <label htmlFor="eventDate" className={styles.label}>
                                    Date <span className={styles.required}>*</span>
                                </label>
                                <input
                                    type="date"
                                    id="eventDate"
                                    value={formDate}
                                    onChange={(e) => setFormDate(e.target.value)}
                                    className={`${styles.input} ${errors.date ? styles.inputError : ''}`}
                                    required
                                />
                                {errors.date && <span className={styles.errorText}>{errors.date}</span>}
                            </div>

                            {/* Start Time */}
                            <div className={styles.formGroup}>
                                <label htmlFor="eventStartTime" className={styles.label}>Start Time</label>
                                <input
                                    type="time"
                                    id="eventStartTime"
                                    value={formStartTime}
                                    onChange={(e) => setFormStartTime(e.target.value)}
                                    className={styles.input}
                                />
                            </div>

                            {/* Event Format */}
                            <div className={styles.formGroup}>
                                <label htmlFor="eventType" className={styles.label}>
                                    Format <span className={styles.required}>*</span>
                                </label>
                                <select
                                    id="eventType"
                                    value={formType}
                                    onChange={(e) => setFormType(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="STANDARD">Standard</option>
                                    <option value="CHALLENGE">League Challenge</option>
                                    <option value="CUP">League Cup</option>
                                    <option value="PRE-RELEASE">Pre-release</option>
                                    <option value="CASUAL">Casual</option>
                                </select>
                            </div>

                            {/* Game Title */}
                            <div className={styles.formGroup}>
                                <label htmlFor="eventGame" className={styles.label}>
                                    Game <span className={styles.required}>*</span>
                                </label>
                                <select
                                    id="eventGame"
                                    value={formGame}
                                    onChange={(e) => setFormGame(e.target.value)}
                                    className={styles.select}
                                >
                                    <option value="TCG">TCG (Trading Card Game)</option>
                                    <option value="VGC">VGC (Video Game Champ)</option>
                                    <option value="GO">GO (Pokémon GO)</option>
                                </select>
                            </div>

                            {/* Entry Fee */}
                            <div className={styles.formGroup}>
                                <label htmlFor="eventEntryFee" className={styles.label}>Entry Fee</label>
                                <input
                                    type="text"
                                    id="eventEntryFee"
                                    value={formEntryFee}
                                    onChange={(e) => setFormEntryFee(e.target.value)}
                                    placeholder="e.g. £10 or Free"
                                    className={styles.input}
                                />
                            </div>

                            {/* Ticket URL */}
                            <div className={styles.formGroup}>
                                <label htmlFor="eventTicketLink" className={styles.label}>Registration Link</label>
                                <input
                                    type="url"
                                    id="eventTicketLink"
                                    value={formTicketLink}
                                    onChange={(e) => setFormTicketLink(e.target.value)}
                                    placeholder="https://example.com/tickets"
                                    className={`${styles.input} ${errors.ticketLink ? styles.inputError : ''}`}
                                />
                                {errors.ticketLink ? (
                                    <span className={styles.errorText}>{errors.ticketLink}</span>
                                ) : (
                                    <span className={styles.helpText}>Link to ticket site or player sign-up</span>
                                )}
                            </div>

                            {/* Description */}
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label htmlFor="eventDescription" className={styles.label}>Description</label>
                                <textarea
                                    id="eventDescription"
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    placeholder="Describe tournament rounds, standard regulations, match rules, etc."
                                    className={styles.textarea}
                                />
                            </div>

                            {/* Prizes */}
                            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
                                <label htmlFor="eventPrizes" className={styles.label}>Prizes Info</label>
                                <textarea
                                    id="eventPrizes"
                                    value={formPrizes}
                                    onChange={(e) => setFormPrizes(e.target.value)}
                                    placeholder="e.g. Championship points, booster packs for participating"
                                    className={styles.textarea}
                                />
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
                            {isSaving ? 'Saving...' : editingEvent ? 'Save Changes' : 'Publish Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventFormModal;
