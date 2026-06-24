import { useEffect } from 'react';

export interface DocumentMetadata {
    title: string;
    description?: string;
}

export function useDocumentMetadata({ title, description }: DocumentMetadata) {
    useEffect(() => {
        document.title = `${title} | Play! South Wales`;

        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }

        const defaultDesc = 'Play! South Wales - Event schedules, league map, and championships rankings for Welsh players.';
        metaDescription.setAttribute('content', description ?? defaultDesc);
    }, [title, description]);
}
