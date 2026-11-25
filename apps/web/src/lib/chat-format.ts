const INDIA = 'Asia/Kolkata';

const DATE = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: INDIA });

const TIME = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: INDIA });

export const messageStamp = (iso: string): string => {
    const at = new Date(iso);
    return `${DATE.format(at)} ${TIME.format(at)}`;
};
