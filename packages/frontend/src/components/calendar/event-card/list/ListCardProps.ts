/**
 * @interface ListCardProps
 * @description Additional props for the ListCard component.
 * @property {boolean} [isExpanded] - Whether the card is expanded (used in 'list' variant).
 * @property {() => void} [onToggle] - Callback triggered when toggling the card expansion.
 */

export interface ListCardProps {
    isExpanded?: boolean;
    onToggle?: () => void;
}
