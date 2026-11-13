export type SeedAccount = { readonly name: string; readonly email: string };

export type SeededAccount = { readonly id: number; readonly email: string; readonly created: boolean };

export type FoundSeedAccount = { readonly id: number; readonly email: string; readonly hasRole: boolean };
