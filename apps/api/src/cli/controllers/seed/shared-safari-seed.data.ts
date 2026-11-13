export const PROTOTYPE_TODAY = '2026-11-03';

export const SEED_EMAIL_DOMAIN = '@example.test';

export const SEED_PEOPLE = {
    ananya: { name: 'Ananya Iyer', email: 'ananya.iyer@example.test' },
    riya: { name: 'Riya Sharma', email: 'riya.sharma@example.test' },
    amit: { name: 'Amit Verma', email: 'amit.verma@example.test' },
    neha: { name: 'Neha Singh', email: 'neha.singh@example.test' },
    raj: { name: 'Raj Patel', email: 'raj.patel@example.test' },
    priya: { name: 'Priya Sharma', email: 'priya.sharma@example.test' },
    rahul: { name: 'Rahul Verma', email: 'rahul.verma@example.test' },
    kavya: { name: 'Kavya Reddy', email: 'kavya.reddy@example.test' },
    arjun: { name: 'Arjun Nair', email: 'arjun.nair@example.test' },
    sneha: { name: 'Sneha Kulkarni', email: 'sneha.kulkarni@example.test' },
    rohan: { name: 'Rohan Mehta', email: 'rohan.mehta@example.test' },
    sanjay: { name: 'Sanjay Gupta', email: 'sanjay.gupta@example.test' },
    meera: { name: 'Meera Joshi', email: 'meera.joshi@example.test' },
    karan: { name: 'Karan Malhotra', email: 'karan.malhotra@example.test' },
} as const;

export type SeedPersonKey = keyof typeof SEED_PEOPLE;

export type ProtoFlag = { readonly reason: string; readonly details: string; readonly who: SeedPersonKey; readonly at: string };

export type ProtoComment = {
    readonly who: SeedPersonKey;
    readonly at: string;
    readonly text: string;
    readonly replies: readonly ProtoComment[];
    readonly flags: readonly ProtoFlag[];
};

export type ProtoStatus = 'active' | 'seatfull' | 'inactive' | 'deladmin' | 'delhost';

export type ProtoSafari = {
    readonly id: number;
    readonly slug: string;
    readonly title: string;
    readonly park: string;
    readonly purpose: 'Photography' | 'Safari Experience';
    readonly start: string;
    readonly end: string;
    readonly safaris: number;
    readonly seats: number;
    readonly share: number;
    readonly from: number;
    readonly to: number;
    readonly stay: string;
    readonly host: SeedPersonKey;
    readonly status: ProtoStatus;
    readonly pinned: boolean;
    readonly created: string;
    readonly updated: string;
    readonly delReason?: string;
    readonly delDetails?: string;
    readonly deletedAt?: string;
    readonly plan: string;
    readonly joined: readonly { readonly who: SeedPersonKey; readonly at: string }[];
    readonly left: readonly { readonly who: SeedPersonKey; readonly at: string }[];
    readonly comments: readonly ProtoComment[];
};

export type ProtoNote = {
    readonly to: SeedPersonKey;
    readonly kind: 'joined' | 'commented';
    readonly who: SeedPersonKey;
    readonly sid: number;
    readonly at: string;
    readonly read: boolean;
};

export const PROTOTYPE_SAFARIS: readonly ProtoSafari[] = [
    {
        id: 1,
        slug: 'tigers-of-bandhavgarh',
        title: 'Tigers of Bandhavgarh',
        park: 'Bandhavgarh Tiger Reserve',
        purpose: 'Photography',
        start: '2026-12-12',
        end: '2026-12-15',
        safaris: 4,
        seats: 5,
        share: 3,
        from: 8000,
        to: 12000,
        stay: 'Standard',
        host: 'riya',
        status: 'active',
        pinned: true,
        created: '2026-11-02 10:15',
        updated: '2026-11-03 09:40',
        plan: 'Day 1: arrive at Tala by noon, evening safari in Tala zone.\nDay 2: morning safari in Magadhi zone, afternoon at the fort viewpoint.\nDay 3: morning and evening safaris in Tala zone.\nDay 4: breakfast and drive back to Umaria station.\nCall me on 98101 23456 or write to riya.sharma@example.test before you book your train.',
        joined: [
            { who: 'amit', at: '02 Nov 2026 10:42' },
            { who: 'neha', at: '02 Nov 2026 11:05' },
            { who: 'raj', at: '02 Nov 2026 12:30' },
            { who: 'priya', at: '02 Nov 2026 15:12' },
            { who: 'rahul', at: '02 Nov 2026 19:48' },
            { who: 'kavya', at: '03 Nov 2026 07:30' },
            { who: 'arjun', at: '03 Nov 2026 08:55' },
        ],
        left: [
            { who: 'sneha', at: '02 Nov 2026 17:20' },
            { who: 'rohan', at: '03 Nov 2026 09:10' },
        ],
        comments: [
            {
                who: 'amit',
                at: '01 Nov 2026 10:50',
                text: 'Is the Tala zone booked already?',
                replies: [
                    {
                        who: 'riya',
                        at: '02 Nov 2026 09:15',
                        text: 'Yes, for the first two safaris.',
                        replies: [],
                        flags: [],
                    },
                ],
                flags: [],
            },
            {
                who: 'neha',
                at: '02 Nov 2026 11:40',
                text: 'Which lens works best here? I have a 100–400 mm and a 200–600 mm.',
                replies: [
                    {
                        who: 'riya',
                        at: '02 Nov 2026 13:05',
                        text: 'The 200–600 mm is better for the Magadhi zone.',
                        replies: [],
                        flags: [],
                    },
                ],
                flags: [],
            },
            {
                who: 'sneha',
                at: '02 Nov 2026 16:40',
                text: 'Is there a pickup from Umaria station?',
                replies: [
                    {
                        who: 'riya',
                        at: '02 Nov 2026 17:00',
                        text: 'Yes, at 10 am on day 1.',
                        replies: [],
                        flags: [],
                    },
                ],
                flags: [],
            },
            {
                who: 'raj',
                at: '02 Nov 2026 18:05',
                text: 'Call me on 98201 45678, I can get you cheaper gypsy bookings for every zone.',
                replies: [],
                flags: [
                    { reason: 'Commercial or Spam', details: 'He is selling bookings in the comments.', who: 'neha', at: '02 Nov 2026 18:30' },
                    { reason: 'Commercial or Spam', details: 'Advertising his own service.', who: 'amit', at: '02 Nov 2026 19:02' },
                    { reason: 'Other', details: 'Shares a phone number to take the talk off the page.', who: 'priya', at: '03 Nov 2026 08:10' },
                ],
            },
        ],
    },
    {
        id: 2,
        slug: 'leopards-of-jhalana',
        title: 'Leopards of Jhalana',
        park: 'Jhalana Leopard Reserve',
        purpose: 'Safari Experience',
        start: '2027-01-09',
        end: '2027-01-11',
        safaris: 3,
        seats: 6,
        share: 4,
        from: 5500,
        to: 7000,
        stay: 'Home Stay',
        host: 'ananya',
        status: 'active',
        pinned: false,
        created: '2026-11-01 18:30',
        updated: '2026-11-01 18:30',
        plan: 'Day 1: reach Jaipur by afternoon, evening safari in Jhalana.\nDay 2: morning safari, old city walk after lunch.\nDay 3: last morning safari, then home.',
        joined: [
            { who: 'karan', at: '01 Nov 2026 20:10' },
            { who: 'rohan', at: '02 Nov 2026 09:45' },
            { who: 'meera', at: '02 Nov 2026 16:20' },
        ],
        left: [],
        comments: [
            {
                who: 'karan',
                at: '01 Nov 2026 20:15',
                text: 'Can we add a sunset at Nahargarh on day 2?',
                replies: [
                    {
                        who: 'ananya',
                        at: '01 Nov 2026 21:02',
                        text: 'Good idea, I will add it to the plan.',
                        replies: [],
                        flags: [],
                    },
                ],
                flags: [],
            },
        ],
    },
    {
        id: 3,
        slug: 'corbett-birding-trail',
        title: 'Corbett birding trail',
        park: 'Corbett Tiger Reserve',
        purpose: 'Photography',
        start: '2026-12-26',
        end: '2026-12-29',
        safaris: 5,
        seats: 6,
        share: 5,
        from: 9000,
        to: 14000,
        stay: 'Premium',
        host: 'ananya',
        status: 'seatfull',
        pinned: false,
        created: '2026-10-28 12:05',
        updated: '2026-11-02 08:15',
        plan: 'Four days in Dhikala and Bijrani for birds and tigers.\nDay 1: drive from Delhi, evening safari in Bijrani.\nDays 2–3: Dhikala, morning and evening drives.\nDay 4: morning drive, back to Delhi.',
        joined: [
            { who: 'amit', at: '28 Oct 2026 14:00' },
            { who: 'priya', at: '29 Oct 2026 09:30' },
            { who: 'arjun', at: '29 Oct 2026 18:15' },
            { who: 'kavya', at: '30 Oct 2026 10:05' },
            { who: 'sanjay', at: '31 Oct 2026 12:40' },
            { who: 'meera', at: '01 Nov 2026 07:55' },
        ],
        left: [],
        comments: [],
    },
    {
        id: 4,
        slug: 'tadoba-weekend',
        title: 'Tadoba weekend',
        park: 'Tadoba-Andhari Tiger Reserve',
        purpose: 'Safari Experience',
        start: '2027-02-13',
        end: '2027-02-15',
        safaris: 3,
        seats: 4,
        share: 2,
        from: 6000,
        to: 8000,
        stay: 'Economical',
        host: 'ananya',
        status: 'inactive',
        pinned: false,
        created: '2026-10-20 09:00',
        updated: '2026-10-30 17:45',
        plan: 'A short weekend in the Moharli zone: Friday night train from Nagpur, three safaris, back on Sunday night.',
        joined: [
            { who: 'rohan', at: '21 Oct 2026 11:20' },
        ],
        left: [],
        comments: [],
    },
    {
        id: 5,
        slug: 'kanha-in-the-rains',
        title: 'Kanha in the rains',
        park: 'Kanha Tiger Reserve',
        purpose: 'Photography',
        start: '2026-08-02',
        end: '2026-08-04',
        safaris: 2,
        seats: 4,
        share: 2,
        from: 7000,
        to: 9500,
        stay: 'Forest Rest House',
        host: 'ananya',
        status: 'active',
        pinned: false,
        created: '2026-07-05 16:40',
        updated: '2026-07-20 10:10',
        plan: 'Two monsoon drives in the buffer zone, a night at the forest rest house in Mukki.',
        joined: [
            { who: 'neha', at: '06 Jul 2026 10:00' },
            { who: 'raj', at: '08 Jul 2026 13:25' },
            { who: 'kavya', at: '12 Jul 2026 19:40' },
        ],
        left: [],
        comments: [
            {
                who: 'neha',
                at: '07 Jul 2026 09:30',
                text: 'Are the buffer zones open in August?',
                replies: [
                    {
                        who: 'ananya',
                        at: '07 Jul 2026 12:00',
                        text: 'Yes, Khapa and Sijhora stay open in the rains.',
                        replies: [],
                        flags: [],
                    },
                ],
                flags: [],
            },
        ],
    },
    {
        id: 6,
        slug: 'gir-lions-in-winter',
        title: 'Gir lions in winter',
        park: 'Gir National Park',
        purpose: 'Safari Experience',
        start: '2026-11-01',
        end: '2026-11-04',
        safaris: 3,
        seats: 6,
        share: 4,
        from: 4500,
        to: 6000,
        stay: 'Standard',
        host: 'amit',
        status: 'active',
        pinned: false,
        created: '2026-10-30 11:20',
        updated: '2026-10-30 11:20',
        plan: 'Three jungle trails in Gir for the Asiatic lions, with a stay at Sasan Gir.\nDay 1: reach Sasan by afternoon.\nDay 2: morning and afternoon trails.\nDay 3: morning trail, then Junagadh.',
        joined: [
            { who: 'ananya', at: '31 Oct 2026 09:10' },
            { who: 'rahul', at: '31 Oct 2026 12:00' },
        ],
        left: [],
        comments: [
            {
                who: 'ananya',
                at: '01 Nov 2026 09:00',
                text: 'Which zone is best for lions in the morning?',
                replies: [
                    {
                        who: 'amit',
                        at: '01 Nov 2026 10:15',
                        text: 'Zone 1 near Sasan, start at 6:30.',
                        replies: [],
                        flags: [],
                    },
                ],
                flags: [],
            },
        ],
    },
    {
        id: 7,
        slug: 'pench-by-jeep',
        title: 'Pench by jeep',
        park: 'Pench Tiger Reserve - Madhya Pradesh',
        purpose: 'Photography',
        start: '2027-01-23',
        end: '2027-01-26',
        safaris: 4,
        seats: 5,
        share: 3,
        from: 7500,
        to: 10000,
        stay: 'Premium',
        host: 'neha',
        status: 'active',
        pinned: false,
        created: '2026-10-29 15:35',
        updated: '2026-10-31 10:00',
        plan: 'Four drives in Turia and Karmajhiri gates, looking for the Pench wild dogs.',
        joined: [
            { who: 'ananya', at: '30 Oct 2026 08:20' },
            { who: 'sanjay', at: '30 Oct 2026 13:00' },
            { who: 'karan', at: '01 Nov 2026 18:45' },
            { who: 'meera', at: '02 Nov 2026 10:30' },
        ],
        left: [
            { who: 'arjun', at: '31 Oct 2026 22:05' },
        ],
        comments: [],
    },
    {
        id: 8,
        slug: 'ranthambore-tiger-trail',
        title: 'Ranthambore tiger trail',
        park: 'Ranthambore Tiger Reserve',
        purpose: 'Photography',
        start: '2026-11-02',
        end: '2026-11-05',
        safaris: 4,
        seats: 6,
        share: 4,
        from: 10000,
        to: 15000,
        stay: 'Premium',
        host: 'rahul',
        status: 'seatfull',
        pinned: false,
        created: '2026-10-15 10:05',
        updated: '2026-10-27 18:30',
        plan: 'Canter-free trip: four gypsy safaris in zones 2, 3 and 4, with a stay near the Ranthambore Road.',
        joined: [
            { who: 'priya', at: '15 Oct 2026 12:00' },
            { who: 'amit', at: '16 Oct 2026 09:00' },
            { who: 'kavya', at: '18 Oct 2026 21:10' },
            { who: 'raj', at: '20 Oct 2026 11:45' },
            { who: 'neha', at: '22 Oct 2026 14:30' },
        ],
        left: [],
        comments: [],
    },
    {
        id: 9,
        slug: 'kaziranga-rhinos-and-birds',
        title: 'Kaziranga rhinos and birds',
        park: 'Kaziranga Tiger Reserve',
        purpose: 'Safari Experience',
        start: '2027-03-06',
        end: '2027-03-09',
        safaris: 4,
        seats: 6,
        share: 5,
        from: 6500,
        to: 9000,
        stay: 'Home Stay',
        host: 'kavya',
        status: 'active',
        pinned: false,
        created: '2026-11-02 20:10',
        updated: '2026-11-02 20:10',
        plan: 'Jeep safaris in the Central and Western ranges, an elephant-back morning in Bagori, and birds at Panbari.',
        joined: [
            { who: 'rahul', at: '03 Nov 2026 07:05' },
        ],
        left: [],
        comments: [],
    },
    {
        id: 10,
        slug: 'periyar-in-june',
        title: 'Periyar in June',
        park: 'Periyar Tiger Reserve',
        purpose: 'Safari Experience',
        start: '2027-06-12',
        end: '2027-06-14',
        safaris: 2,
        seats: 4,
        share: 3,
        from: 3000,
        to: 4500,
        stay: 'Not Included',
        host: 'arjun',
        status: 'active',
        pinned: false,
        created: '2026-10-25 08:30',
        updated: '2026-10-25 08:30',
        plan: 'A boat safari on Periyar Lake and a bamboo rafting day, with time for the spice gardens of Thekkady.',
        joined: [],
        left: [],
        comments: [],
    },
    {
        id: 11,
        slug: 'sundarbans-by-boat',
        title: 'Sundarbans by boat',
        park: 'Sundarbans Tiger Reserve',
        purpose: 'Photography',
        start: '2027-02-20',
        end: '2027-02-23',
        safaris: 3,
        seats: 6,
        share: 4,
        from: 5000,
        to: 7500,
        stay: 'Economical',
        host: 'priya',
        status: 'active',
        pinned: false,
        created: '2026-10-31 13:50',
        updated: '2026-11-01 09:15',
        plan: 'Three days on a boat through the creeks from Godkhali, with nights at a village home stay.',
        joined: [
            { who: 'neha', at: '31 Oct 2026 16:00' },
            { who: 'arjun', at: '01 Nov 2026 11:30' },
        ],
        left: [],
        comments: [],
    },
    {
        id: 12,
        slug: 'satpura-on-foot',
        title: 'Satpura on foot',
        park: 'Satpura Tiger Reserve',
        purpose: 'Safari Experience',
        start: '2026-11-28',
        end: '2026-11-30',
        safaris: 3,
        seats: 4,
        share: 2,
        from: 4000,
        to: 5000,
        stay: 'Forest Rest House',
        host: 'raj',
        status: 'deladmin',
        pinned: false,
        created: '2026-10-26 17:00',
        updated: '2026-10-28 10:20',
        delReason: 'Commercial or Spam',
        delDetails: 'The plan sells tour packages with a booking link.',
        plan: 'Walking safaris and a canoe ride at Madhai. Book the full package at my travel agency for the best price.',
        joined: [
            { who: 'karan', at: '27 Oct 2026 09:00' },
        ],
        left: [],
        comments: [],
    },
    {
        id: 13,
        slug: 'nagarhole-elephant-days',
        title: 'Nagarhole elephant days',
        park: 'Nagarhole Tiger Reserve',
        purpose: 'Safari Experience',
        start: '2026-12-05',
        end: '2026-12-07',
        safaris: 2,
        seats: 3,
        share: 2,
        from: 2000,
        to: 3500,
        stay: 'Standard',
        host: 'sanjay',
        status: 'active',
        pinned: false,
        created: '2026-10-22 19:25',
        updated: '2026-10-22 19:25',
        plan: 'Two drives from Kabini for elephants by the backwaters, and a coracle ride.',
        joined: [
            { who: 'priya', at: '23 Oct 2026 08:40' },
        ],
        left: [],
        comments: [],
    },
    {
        id: 14,
        slug: 'dudhwa-swamp-deer',
        title: 'Dudhwa swamp deer',
        park: 'Dudhwa Tiger Reserve',
        purpose: 'Photography',
        start: '2027-01-16',
        end: '2027-01-18',
        safaris: 3,
        seats: 5,
        share: 3,
        from: 5000,
        to: 6500,
        stay: 'Forest Rest House',
        host: 'karan',
        status: 'delhost',
        pinned: true,
        created: '2026-10-20 09:30',
        updated: '2026-11-01 19:20',
        deletedAt: '01 Nov 2026 19:20',
        plan: 'Three drives in the Sonaripur grasslands for swamp deer and the Dudhwa tigers.',
        joined: [
            { who: 'meera', at: '22 Oct 2026 10:00' },
        ],
        left: [
            { who: 'rohan', at: '25 Oct 2026 18:30' },
        ],
        comments: [
            {
                who: 'meera',
                at: '22 Oct 2026 10:05',
                text: 'Is the Sonaripur range open in January?',
                replies: [],
                flags: [],
            },
        ],
    },
];

export const PROTOTYPE_NOTES: readonly ProtoNote[] = [
    { to: 'riya', kind: 'joined', who: 'arjun', sid: 1, at: '03 Nov 2026 08:55', read: false },
    { to: 'riya', kind: 'commented', who: 'raj', sid: 1, at: '02 Nov 2026 18:05', read: false },
    { to: 'riya', kind: 'commented', who: 'amit', sid: 1, at: '02 Nov 2026 11:40', read: true },
    { to: 'ananya', kind: 'joined', who: 'meera', sid: 2, at: '02 Nov 2026 16:20', read: false },
];
