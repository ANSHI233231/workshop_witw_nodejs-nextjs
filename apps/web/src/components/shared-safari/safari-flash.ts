const FLASH_KEY = 'sharedSafariFlash';

export const rememberFlash = (message: string): void => {
    try {
        window.sessionStorage.setItem(FLASH_KEY, message);
    } catch {
        return;
    }
};

export const takeFlash = (): string | null => {
    try {
        const message = window.sessionStorage.getItem(FLASH_KEY);
        window.sessionStorage.removeItem(FLASH_KEY);
        return message;
    } catch {
        return null;
    }
};
