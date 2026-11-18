type ClassValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | ClassValue[]
    | { [className: string]: boolean | null | undefined };

function cn(...inputs: ClassValue[]): any {
    return inputs
        .flatMap((input) => {
            if (!input) return [];
            if (typeof input === 'string' || typeof input === 'number') {
                return [String(input)];
            }
            if (Array.isArray(input)) return [cn(...input)];
            return Object.entries(input)
                .filter(([, enabled]) => enabled)
                .map(([className]) => className);
        })
        .filter(Boolean)
        .join(' ');
}

export { cn };
