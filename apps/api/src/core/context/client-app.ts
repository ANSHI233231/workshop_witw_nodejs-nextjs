export const ClientApp = {
    MANAGE: 1,
    WEB: 2,
    CLI: 3,
    SYSTEM: 4,
} as const;

export type ClientAppCode = (typeof ClientApp)[keyof typeof ClientApp];

export const CLIENT_APP_HEADER = 'x-client-app';

const BY_HEADER_VALUE: Readonly<Record<string, ClientAppCode>> = {
    manage: ClientApp.MANAGE,
    web: ClientApp.WEB,
};

export const CLIENT_APP_QUERY = 'app';

const READ_ONLY_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD']);

export const clientAppFromHeader = (value: string | undefined): ClientAppCode =>
    (value && BY_HEADER_VALUE[value.trim().toLowerCase()]) || ClientApp.SYSTEM;

export const clientAppOf = (method: string, header: string | undefined, query: unknown): ClientAppCode => {
    if (header !== undefined || !READ_ONLY_METHODS.has(method)) return clientAppFromHeader(header);
    return clientAppFromHeader(typeof query === 'string' ? query : undefined);
};
