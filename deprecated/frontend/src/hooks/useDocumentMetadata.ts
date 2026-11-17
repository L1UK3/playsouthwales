import { useEffect } from 'react';

export interface DocumentMetadata {
    title: string;
    description?: string;
}

export function useDocumentMetadata({ title, description }: DocumentMetadata) {
    useEffect(() => {
        const fullTitle = `${title} | Play! South Wales`;
        document.title = fullTitle;

        let metaDescription = document.querySelector<HTMLMetaElement>(
            'meta[name="description"]'
        );
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.setAttribute('name', 'description');
            document.head.appendChild(metaDescription);
        }

        const defaultDesc =
            'Discover Pokémon TCG, VGC, and GO tournament schedules, local leagues, and championship rankings across South Wales.';
        const resolvedDesc = description ?? defaultDesc;
        metaDescription.setAttribute('content', resolvedDesc);

        const canonicalLink = document.querySelector<HTMLLinkElement>(
            'link[rel="canonical"]'
        );
        if (canonicalLink && typeof window !== 'undefined') {
            canonicalLink.setAttribute(
                'href',
                `${window.location.origin}${window.location.pathname}`
            );
        }
    }, [title, description]);
}
