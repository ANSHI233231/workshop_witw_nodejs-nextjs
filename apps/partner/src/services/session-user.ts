const LOGIN_PATH = '/login';

let sessionUserId: number | null = null;

const inBrowser = (): boolean => typeof window !== 'undefined';

export const sessionUser = (): number | null => (inBrowser() ? sessionUserId : null);

export const leaveForLogin = (): void => {
    sessionUserId = null;
    window.location.replace(new URL(LOGIN_PATH, window.location.origin));
};

export const watchSessionUser = (userId: number): void => {
    if (!inBrowser()) return;
    if (sessionUserId !== null && sessionUserId !== userId) {
        leaveForLogin();
        return;
    }
    sessionUserId = userId;
};

export const forgetSessionUser = (): void => {
    sessionUserId = null;
};
