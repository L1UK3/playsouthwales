import { useState, useCallback } from 'react';
import type { League } from '@/types/League';

/**
 * Custom hook to manage league form states, prefilling, resetting, and client-side CRO validation.
 */
export function useLeagueForm() {
    const [editingLeagueId, setEditingLeagueId] = useState<number | null>(null);
    const [formName, setFormName] = useState('');
    const [formLogo, setFormLogo] = useState('');
    const [formWebsite, setFormWebsite] = useState('');
    const [formSocialLink, setFormSocialLink] = useState('');
    const [formPokemonLink, setFormPokemonLink] = useState('');
    const [formBrandColor, setFormBrandColor] = useState('#FF0000');
    const [formLocation, setFormLocation] = useState('');
    const [formLatitude, setFormLatitude] = useState('');
    const [formLongitude, setFormLongitude] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = useCallback(() => {
        setFormName('');
        setFormLogo('');
        setFormWebsite('');
        setFormSocialLink('');
        setFormPokemonLink('');
        setFormBrandColor('#FF0000');
        setFormLocation('');
        setFormLatitude('');
        setFormLongitude('');
        setEditingLeagueId(null);
        setErrors({});
    }, []);

    const prefillForm = useCallback((league: League) => {
        setEditingLeagueId(league.leagueId);
        setFormName(league.name);
        setFormLogo(league.logo ?? '');
        setFormWebsite(league.website ?? '');
        setFormSocialLink(league.socialLink ?? '');
        setFormPokemonLink(league.pokemonLink ?? '');
        setFormBrandColor(league.brandColor ?? '#FF0000');
        setFormLocation(league.location ?? '');
        setFormLatitude(league.latitude !== undefined && league.latitude !== null ? String(league.latitude) : '');
        setFormLongitude(league.longitude !== undefined && league.longitude !== null ? String(league.longitude) : '');
        setErrors({});
    }, []);

    const validateForm = useCallback(() => {
        const tempErrors: Record<string, string> = {};
        if (!formName.trim()) {
            tempErrors.name = 'Store name is required';
        }

        const urlPattern = /^https?:\/\/.+/;
        if (formLogo.trim() && !urlPattern.test(formLogo.trim())) {
            tempErrors.logo = 'Logo URL must start with http:// or https://';
        }
        if (formWebsite.trim() && !urlPattern.test(formWebsite.trim())) {
            tempErrors.website = 'Website URL must start with http:// or https://';
        }
        if (formSocialLink.trim() && !urlPattern.test(formSocialLink.trim())) {
            tempErrors.socialLink = 'Social URL must start with http:// or https://';
        }
        if (formPokemonLink.trim() && !urlPattern.test(formPokemonLink.trim())) {
            tempErrors.pokemonLink = 'Pokémon URL must start with http:// or https://';
        }

        if (formLatitude.trim()) {
            const lat = parseFloat(formLatitude);
            if (isNaN(lat) || lat < -90 || lat > 90) {
                tempErrors.latitude = 'Latitude must be between -90 and 90';
            }
        }
        if (formLongitude.trim()) {
            const lng = parseFloat(formLongitude);
            if (isNaN(lng) || lng < -180 || lng > 180) {
                tempErrors.longitude = 'Longitude must be between -180 and 180';
            }
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    }, [formName, formLogo, formWebsite, formSocialLink, formPokemonLink, formLatitude, formLongitude]);

    return {
        editingLeagueId,
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
        resetForm,
        prefillForm,
        validateForm,
    };
}
