import { ValidationException } from '../../../core/exceptions';

const BYTE_ORDER_MARK = '﻿';

const QUOTE = '"';

const unreadable = (): ValidationException =>
    new ValidationException(
        'The file could not be read as CSV (a quote is not closed).',
        [{ field: 'file', message: 'The file could not be read as CSV (a quote is not closed).' }],
        'TRANSLATION_FILE_UNREADABLE',
    );

export const parseCsv = (content: Buffer): string[][] => {
    const text = content.toString('utf8').replace(BYTE_ORDER_MARK, '');
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
        const character = text.charAt(index);
        if (quoted) {
            if (character !== QUOTE) cell += character;
            else if (text.charAt(index + 1) === QUOTE) {
                cell += QUOTE;
                index += 1;
            } else quoted = false;
        } else if (character === QUOTE) quoted = true;
        else if (character === ',') {
            row.push(cell);
            cell = '';
        } else if (character === '\n' || character === '\r') {
            if (character === '\r' && text.charAt(index + 1) === '\n') index += 1;
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
        } else cell += character;
    }
    if (quoted) throw unreadable();
    if (cell !== '' || row.length > 0) {
        row.push(cell);
        rows.push(row);
    }
    return rows;
};
