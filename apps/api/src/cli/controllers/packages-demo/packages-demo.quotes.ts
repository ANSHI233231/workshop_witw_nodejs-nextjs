import { QuoteMark, type QuoteMarkCode, QuoteRequestStatus, type QuoteRequestStatusCode } from '../../../modules/quote-request';

import { DEMO_EMAIL_DOMAIN } from './packages-demo.data';

export type DemoQuotePlan = {
    readonly key: string;
    readonly senderEmail: string;
    readonly packageSlug: string;
    readonly versionNumber: number;
    readonly travellerCount: number;
    readonly startDate: string;
    readonly notes: string;
    readonly sentAtIst: string;
    readonly mark: QuoteMarkCode | null;
    readonly status: QuoteRequestStatusCode;
};

export type DemoNotePlan =
    | { readonly kind: 'received'; readonly quoteKey: string; readonly atIst: string; readonly isRead: boolean }
    | {
          readonly kind: 'adminMessage';
          readonly quoteKey: string;
          readonly message: string;
          readonly atIst: string;
          readonly isRead: boolean;
      };

const ANANYA = `ananya.iyer${DEMO_EMAIL_DOMAIN}`;
const RIYA = `riya.sharma${DEMO_EMAIL_DOMAIN}`;
const NEHA = `neha.singh${DEMO_EMAIL_DOMAIN}`;

export const DEMO_QUOTES: readonly DemoQuotePlan[] = [
    {
        key: 'ananya-wild-kanha',
        senderEmail: ANANYA,
        packageSlug: 'wild-kanha-special-kanha',
        versionNumber: 2,
        travellerCount: 2,
        startDate: '2026-12-20',
        notes: 'Two adults, vegetarian meals please. Can we add a night?',
        sentAtIst: '2026-11-08T10:15',
        mark: QuoteMark.HOT,
        status: QuoteRequestStatus.ACTIVE,
    },
    {
        key: 'riya-mangrove',
        senderEmail: RIYA,
        packageSlug: 'mangrove-majesty-bhitarkanika-national-park',
        versionNumber: 1,
        travellerCount: 4,
        startDate: '2027-01-10',
        notes: 'Family of four, two children aged 8 and 11.',
        sentAtIst: '2026-11-07T19:30',
        mark: null,
        status: QuoteRequestStatus.ACTIVE,
    },
    {
        key: 'ananya-corbett',
        senderEmail: ANANYA,
        packageSlug: 'corbett-elephant-trails',
        versionNumber: 1,
        travellerCount: 3,
        startDate: '2027-02-05',
        notes: 'Is the elephant safari open in February?',
        sentAtIst: '2026-11-05T12:00',
        mark: QuoteMark.COLD,
        status: QuoteRequestStatus.ACTIVE,
    },
    {
        key: 'riya-wild-kanha',
        senderEmail: RIYA,
        packageSlug: 'wild-kanha-special-kanha',
        versionNumber: 2,
        travellerCount: 2,
        startDate: '2026-11-20',
        notes: 'Call me after 6 pm.',
        sentAtIst: '2026-10-30T09:00',
        mark: null,
        status: QuoteRequestStatus.INACTIVE,
    },
    {
        key: 'neha-wildlife-marathon',
        senderEmail: NEHA,
        packageSlug: 'wildlife-marathon-kanha',
        versionNumber: 1,
        travellerCount: 6,
        startDate: '2026-12-27',
        notes: 'Group of six photographers. We need two Gypsies.',
        sentAtIst: '2026-11-09T08:40',
        mark: null,
        status: QuoteRequestStatus.ACTIVE,
    },
];

export const DEMO_QUOTE_NOTES: readonly DemoNotePlan[] = [
    { kind: 'received', quoteKey: 'neha-wildlife-marathon', atIst: '2026-11-09T08:40', isRead: false },
    { kind: 'received', quoteKey: 'ananya-wild-kanha', atIst: '2026-11-08T10:15', isRead: false },
    {
        kind: 'adminMessage',
        quoteKey: 'ananya-wild-kanha',
        message: 'Ananya Iyer asked twice about Wild Kanha Special. Please reply today.',
        atIst: '2026-11-08T16:00',
        isRead: true,
    },
    { kind: 'received', quoteKey: 'riya-mangrove', atIst: '2026-11-07T19:30', isRead: false },
];
