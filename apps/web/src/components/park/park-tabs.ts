export const PARK_TABS = ['overview', 'packages', 'safaris'] as const;

export type ParkTab = (typeof PARK_TABS)[number];
