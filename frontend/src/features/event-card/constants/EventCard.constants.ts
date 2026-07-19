/**
 * Shared Tailwind utility class definitions for Event Card components.
 */

// Common base transitions and layout properties
export const CARD_BASE_CLASSES = 'transition-all duration-200 outline-hidden';

// Focus ring indicator style
export const FOCUS_RING_CLASSES = 'ring-2 ring-focus ring-offset-2';

// Active/press action state scale and offset
export const ACTIVE_STATE_CLASSES = 'scale-[0.99] translate-y-px';
export const INACTIVE_ACTIVE_CLASSES =
    'active:scale-[0.99] active:translate-y-px';

// Hover dynamic state shadows and transitions
export const HOVER_TRANSITION_CLASSES =
    '-translate-y-0.5 shadow-md bg-bg-card-hover border-(--store-color) shadow-[0_0_12px_color-mix(in_oklch,var(--store-color)_30%,transparent)]';
export const INACTIVE_HOVER_CLASSES =
    'hover:-translate-y-0.5 hover:shadow-md hover:bg-bg-card-hover';

// Formats / Event category tag styling
export const TAG_BASE_CLASSES =
    'text-[9px] font-extrabold tracking-wider uppercase border border-(--type-border)/30 text-(--type-border) bg-(--type-bg)';

// Common inline styles for event types
export const TAG_STYLE_PROPERTIES = {
    '--type-bg': 'var(--type-bg, rgba(0, 0, 0, 0.05))',
    '--type-border': 'var(--type-border, var(--color-text-muted))',
};
