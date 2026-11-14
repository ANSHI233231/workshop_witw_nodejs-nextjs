/** Joins class names, skipping falsy values: cn('p-4', isActive && 'bg-brand'). */
export const cn = (...classes: ReadonlyArray<string | false | null | undefined>): string =>
    classes.filter(Boolean).join(' ');
