export type ParkImageState = { readonly id: number; readonly name: string; readonly featureImage: string | null };

export type DemoParkImage = { readonly parkId: number; readonly content: Buffer };

export type ParkImageOutcome = { readonly parkId: number; readonly name: string; readonly fileName: string };
