import { useState, useCallback } from 'react';
import type { Event } from '@/types/Event';

/**
 * Custom hook to manage event form states, prefilling, resetting, and client-side CRO validation.
 */
export function useEventForm() {
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formDate, setFormDate] = useState('');
    const [formStartTime, setFormStartTime] = useState('');
    const [formType, setFormType] = useState('STANDARD');
    const [formGame, setFormGame] = useState('TCG');
    const [formTicketLink, setFormTicketLink] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formPrizes, setFormPrizes] = useState('');
    const [formEntryFee, setFormEntryFee] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = useCallback(() => {
        setFormName('');
        setFormDate('');
        setFormStartTime('');
        setFormType('STANDARD');
        setFormGame('TCG');
        setFormTicketLink('');
        setFormDescription('');
        setFormPrizes('');
        setFormEntryFee('');
        setEditingEventId(null);
        setErrors({});
    }, []);

    const prefillForm = useCallback((event: Event) => {
        setEditingEventId(event.id);
        setFormName(event.name);
        setFormDate(event.date);
        setFormStartTime(event.startTime ?? '');
        setFormType(event.type);
        setFormGame(event.game);
        setFormTicketLink(event.ticketLink ?? '');
        setFormDescription(event.description ?? '');
        setFormPrizes(event.prizes ?? '');
        setFormEntryFee(event.entryFee ?? '');
        setErrors({});
    }, []);

    const validateForm = useCallback(() => {
        const tempErrors: Record<string, string> = {};
        if (!formName.trim()) {
            tempErrors.name = 'Event title is required';
        }
        if (!formDate) {
            tempErrors.date = 'Date is required';
        }
        if (formTicketLink.trim() && !/^https?:\/\/.+/.test(formTicketLink.trim())) {
            tempErrors.ticketLink = 'URL must start with http:// or https://';
        }
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    }, [formName, formDate, formTicketLink]);

    return {
        editingEventId,
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
        resetForm,
        prefillForm,
        validateForm,
    };
}
