import { z } from 'zod';

export const translationsSchema = z
    .record(
        z.string(),
        z.record(z.string(), z.string({ invalid_type_error: 'Enter text.' }), {
            invalid_type_error: 'Choose a valid field.',
        }),
        { invalid_type_error: 'Choose a valid language.' },
    )
    .optional();

export type TranslationValues = Readonly<Record<string, Readonly<Record<string, string>>>>;
