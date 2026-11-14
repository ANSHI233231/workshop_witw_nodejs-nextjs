export type DemoAccount = {
    readonly name: string;
    readonly email: string;
    readonly mobile: string;
};

export type DemoAccountState = {
    readonly id: number;
    readonly email: string;
    readonly created: boolean;
};
