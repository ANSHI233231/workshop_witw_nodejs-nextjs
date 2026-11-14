import { type DemoGalleryPhoto, GalleryStatus, type GalleryStatusCode } from '../../../modules/gallery';
import { type DemoPartner, PartnerStatus } from '../../../modules/partner';

export const DEMO_EMAIL_DOMAIN = '@packages-demo.test';

export const DEMO_PARTNERS: readonly DemoPartner[] = [
    {
        account: { name: 'Vivek Rao', email: `vivek.rao${DEMO_EMAIL_DOMAIN}`, mobile: '9876500101' },
        business: {
            businessName: 'Jungle Trails Safaris',
            ownerName: 'Vivek Rao',
            businessPhone: '9811122233',
            businessEmail: 'hello@jungletrails.example.test',
            about: 'Family-run safari operator in central India since 2009.',
            parkNames: [
                'Kanha Tiger Reserve',
                'Bandhavgarh Tiger Reserve',
                'Corbett Tiger Reserve',
                'Jhalana Leopard Reserve',
            ],
            status: PartnerStatus.ACTIVE,
            rejectReason: null,
            isPhoneShown: true,
            requestedDaysAgo: 62,
            decidedDaysAgo: 60,
        },
    },
    {
        account: { name: 'Tara Nambiar', email: `tara.nambiar${DEMO_EMAIL_DOMAIN}`, mobile: '9876500102' },
        business: {
            businessName: 'Tiger Trail Tours',
            ownerName: 'Tara Nambiar',
            businessPhone: '9822233344',
            businessEmail: 'bookings@tigertrail.example.test',
            about: 'Boat and cheetah safaris in Odisha and Madhya Pradesh.',
            parkNames: ['Bhitarkanika National Park', 'Kuno National Park', 'Satpura Tiger Reserve'],
            status: PartnerStatus.ACTIVE,
            rejectReason: null,
            isPhoneShown: false,
            requestedDaysAgo: 54,
            decidedDaysAgo: 52,
        },
    },
    {
        account: { name: 'Dev Khanna', email: `dev.khanna${DEMO_EMAIL_DOMAIN}`, mobile: '9876500103' },
        business: {
            businessName: 'Wild Routes India',
            ownerName: 'Dev Khanna',
            businessPhone: '9833344455',
            businessEmail: 'dev@wildroutes.example.test',
            about: 'Rajasthan safaris and fort stays.',
            parkNames: ['Ranthambore Tiger Reserve', 'Sariska Tiger Reserve'],
            status: PartnerStatus.PENDING,
            rejectReason: null,
            isPhoneShown: false,
            requestedDaysAgo: 5,
            decidedDaysAgo: null,
        },
    },
    {
        account: { name: 'Isha Kapoor', email: `isha.kapoor${DEMO_EMAIL_DOMAIN}`, mobile: '9876500104' },
        business: {
            businessName: 'Green Canopy Tours',
            ownerName: 'Isha Kapoor',
            businessPhone: '9844455566',
            businessEmail: 'isha@greencanopy.example.test',
            about: null,
            parkNames: ['Periyar Tiger Reserve'],
            status: PartnerStatus.REJECTED,
            rejectReason: 'The business phone number did not answer. Please check it and send the request again.',
            isPhoneShown: false,
            requestedDaysAgo: 12,
            decidedDaysAgo: 10,
        },
    },
    {
        account: { name: 'Nikhil Bose', email: `nikhil.bose${DEMO_EMAIL_DOMAIN}`, mobile: '9876500105' },
        business: {
            businessName: 'Bush Camp Expeditions',
            ownerName: 'Nikhil Bose',
            businessPhone: '9855566677',
            businessEmail: 'nikhil@bushcamp.example.test',
            about: 'Lion safaris in Gir.',
            parkNames: ['Gir National Park'],
            status: PartnerStatus.INACTIVE,
            rejectReason: null,
            isPhoneShown: false,
            requestedDaysAgo: 103,
            decidedDaysAgo: 101,
        },
    },
    {
        account: { name: 'Ananya Iyer', email: `ananya.iyer${DEMO_EMAIL_DOMAIN}`, mobile: '9876500106' },
        business: null,
    },
    {
        account: { name: 'Riya Sharma', email: `riya.sharma${DEMO_EMAIL_DOMAIN}`, mobile: '9876500107' },
        business: null,
    },
    {
        account: { name: 'Neha Singh', email: `neha.singh${DEMO_EMAIL_DOMAIN}`, mobile: '9876500108' },
        business: null,
    },
];

export const DEMO_EMAILS: readonly string[] = DEMO_PARTNERS.map((partner) => partner.account.email);

export type DemoGalleryPlan = {
    readonly ownerEmail: string;
    readonly title: string;
    readonly parkName: string;
    readonly status: GalleryStatusCode;
    readonly approvedPhotos: readonly DemoGalleryPhoto[] | null;
    readonly draftPhotos: readonly DemoGalleryPhoto[] | null;
    readonly rejectReason: string | null;
    readonly sentAtIst: string | null;
    readonly decidedAtIst: string | null;
};

const photo = (picture: string, title: string | null, caption: string | null): DemoGalleryPhoto => ({
    picture: `${picture}.jpg`,
    title,
    caption,
});

const VIVEK = `vivek.rao${DEMO_EMAIL_DOMAIN}`;

const TARA = `tara.nambiar${DEMO_EMAIL_DOMAIN}`;

export const DEMO_GALLERIES: readonly DemoGalleryPlan[] = [
    {
        ownerEmail: TARA,
        title: 'Antara Cruises Catamaran',
        parkName: 'Bhitarkanika National Park',
        status: GalleryStatus.APPROVED,
        approvedPhotos: [
            photo('room', 'Suite', 'A suite aboard the Antara catamaran'),
            photo('boat', 'The catamaran', 'Cruising the Brahmani estuary'),
            photo('boat2', 'Creeks', null),
        ],
        draftPhotos: null,
        rejectReason: null,
        sentAtIst: '2026-09-24T10:00',
        decidedAtIst: '2026-09-24T16:00',
    },
    {
        ownerEmail: VIVEK,
        title: 'Saccharum Safari Lodge',
        parkName: 'Kanha Tiger Reserve',
        status: GalleryStatus.APPROVED,
        approvedPhotos: [
            photo('deer', 'Barasingha', 'Hard-ground swamp deer in the Kanha meadows'),
            photo('room', 'Cottage', 'A premium cottage'),
            photo('jeeps', 'Morning safari', null),
        ],
        draftPhotos: null,
        rejectReason: null,
        sentAtIst: '2026-09-14T12:00',
        decidedAtIst: '2026-09-15T09:00',
    },
    {
        ownerEmail: VIVEK,
        title: 'Corbett Elephant Camp',
        parkName: 'Corbett Tiger Reserve',
        status: GalleryStatus.WAITING,
        approvedPhotos: [photo('elephant', 'Bijrani', null)],
        draftPhotos: [photo('elephant', 'Bijrani', null), photo('jeeps', 'Jeep line-up', 'Before the morning drive')],
        rejectReason: null,
        sentAtIst: '2026-11-10T11:20',
        decidedAtIst: '2026-10-09T18:00',
    },
    {
        ownerEmail: VIVEK,
        title: 'Jhalana Hills',
        parkName: 'Jhalana Leopard Reserve',
        status: GalleryStatus.WAITING,
        approvedPhotos: null,
        draftPhotos: [photo('leopard', 'Leopard', 'On the hill road')],
        rejectReason: null,
        sentAtIst: '2026-11-07T12:10',
        decidedAtIst: null,
    },
    {
        ownerEmail: VIVEK,
        title: 'Bandhavgarh Zones',
        parkName: 'Bandhavgarh Tiger Reserve',
        status: GalleryStatus.DRAFT,
        approvedPhotos: null,
        draftPhotos: [photo('jeeps', null, null)],
        rejectReason: "The photos have another operator's watermark. Please use your own photos.",
        sentAtIst: '2026-11-03T09:00',
        decidedAtIst: '2026-11-03T17:30',
    },
    {
        ownerEmail: TARA,
        title: 'Kuno Grasslands',
        parkName: 'Kuno National Park',
        status: GalleryStatus.WAITING,
        approvedPhotos: null,
        draftPhotos: [photo('cheetah', 'Cheetah', null), photo('jeeps', null, null)],
        rejectReason: null,
        sentAtIst: '2026-11-08T09:40',
        decidedAtIst: null,
    },
];

export const DEMO_GALLERY_PICTURES: readonly string[] = [
    ...new Set(
        DEMO_GALLERIES.flatMap((gallery) => [...(gallery.approvedPhotos ?? []), ...(gallery.draftPhotos ?? [])]).map(
            (item) => item.picture,
        ),
    ),
];
