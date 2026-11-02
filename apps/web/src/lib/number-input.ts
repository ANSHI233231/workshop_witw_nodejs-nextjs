
export const wholeNumberInput = (text: string, maxDigits?: number): string => {
    const digits = text.replace(/\D/g, '');
    return maxDigits === undefined ? digits : digits.slice(0, maxDigits);
};


export const decimalInput = (text: string, maxDecimals?: number): string => {
    const kept = text.replace(/[^\d.]/g, '');
    const point = kept.indexOf('.');
    if (point === -1) return kept;
    const fraction = kept.slice(point + 1).replace(/\./g, '');
    return `${kept.slice(0, point)}.${maxDecimals === undefined ? fraction : fraction.slice(0, maxDecimals)}`;
};

export const signedDecimalInput = (text: string, maxDecimals?: number): string =>
    `${text.trimStart().startsWith('-') ? '-' : ''}${decimalInput(text, maxDecimals)}`;
