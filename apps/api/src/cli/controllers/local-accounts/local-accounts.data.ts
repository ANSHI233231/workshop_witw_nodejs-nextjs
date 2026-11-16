import { GalleryStatus } from '../../../modules/gallery';
import {
    Inclusion,
    Meal,
    PackageFeature,
    PackageTheme,
    PackageVersionStatus,
    PackageWebsiteStatus,
    SafariType,
    Stay,
    Vehicle,
} from '../../../modules/package';
import { type DemoPartner, PartnerStatus } from '../../../modules/partner';
import { QuoteRequestStatus } from '../../../modules/quote-request';
import type { DemoAccount } from '../../../modules/users';
import type { DemoGalleryPlan } from '../packages-demo/packages-demo.data';
import type { DemoDayPlan, DemoPackagePlan, DemoVersionPlan } from '../packages-demo/packages-demo.packages';
import type { DemoQuotePlan } from '../packages-demo/packages-demo.quotes';

export const LOCAL_SUPER_ADMIN: DemoAccount = { name: 'Anshika', email: 'anshika@example.in', mobile: '9876500201' };

const PARTNER_EMAIL = 'partner@example.in';

const USER_EMAIL = 'user@example.in';

export const LOCAL_PARTNER_LOGO = 'partner-logo.png';

export const LOCAL_PARTNERS: readonly DemoPartner[] = [
    {
        account: { name: 'Kabir Sethi', email: PARTNER_EMAIL, mobile: '9876500202' },
        business: {
            businessName: 'Tiger Song Safaris',
            ownerName: 'Kabir Sethi',
            businessPhone: '9811100202',
            businessEmail: 'hello@tigersong.example.in',
            about: 'Small-group tiger safaris in central India.',
            parkNames: ['Kanha Tiger Reserve', 'Bandhavgarh Tiger Reserve', 'Tadoba-Andhari Tiger Reserve'],
            status: PartnerStatus.ACTIVE,
            rejectReason: null,
            isPhoneShown: true,
            requestedDaysAgo: 20,
            decidedDaysAgo: 18,
        },
    },
    {
        account: { name: 'Meher Kapoor', email: USER_EMAIL, mobile: '9876500203' },
        business: null,
    },
];

export const LOCAL_EMAILS: readonly string[] = [LOCAL_SUPER_ADMIN.email, ...LOCAL_PARTNERS.map((partner) => partner.account.email)];

const GALLERY_TITLE = 'Tiger Song Kanha Camp';

export const LOCAL_GALLERIES: readonly DemoGalleryPlan[] = [
    {
        ownerEmail: PARTNER_EMAIL,
        title: GALLERY_TITLE,
        parkName: 'Kanha Tiger Reserve',
        status: GalleryStatus.APPROVED,
        approvedPhotos: [
            { picture: 'room.jpg', title: 'Cottage', caption: 'A cottage at the camp' },
            { picture: 'jeeps.jpg', title: 'Safari jeeps', caption: 'Ready for the morning drive' },
            { picture: 'deer.jpg', title: 'Meadows', caption: null },
        ],
        draftPhotos: null,
        rejectReason: null,
        sentAtIst: '2026-11-01T10:00',
        decidedAtIst: '2026-11-02T11:30',
    },
];

export const LOCAL_GALLERY_PICTURES: readonly string[] = ['room.jpg', 'jeeps.jpg', 'deer.jpg', 'leopard.jpg', 'elephant.jpg'];

const day = (title: string, description: string, meals: DemoDayPlan['meals'], galleryTitle: string | null = null): DemoDayPlan => ({
    title,
    description,
    startLocation: null,
    endLocation: null,
    hotelName: null,
    meals,
    activity: null,
    accommodation: null,
    note: null,
    picture: null,
    galleryTitle,
});

const liveVersion = (
    plan: Pick<
        DemoVersionPlan,
        'name' | 'parkNames' | 'dayCount' | 'pricePerPerson' | 'totalPrice' | 'packagePicture' | 'galleryTitle' | 'overview' | 'days'
    >,
): DemoVersionPlan => ({
    ...plan,
    status: PackageVersionStatus.LIVE,
    createdAtIst: '2026-11-03T10:00',
    sentAtIst: '2026-11-03T12:00',
    decidedAtIst: '2026-11-04T09:30',
    rejectReason: null,
    safariType: SafariType.PRIVATE,
    vehicle: Vehicle.GYPSY_JEEP,
    theme: PackageTheme.SAFARI_EXPERIENCE,
    stay: Stay.PREMIUM,
    safariCount: 4,
    features: [PackageFeature.PRIVATE_SAFARI, PackageFeature.PRIVATE_ROOM],
    startPlace: 'Nagpur',
    endPlace: 'Nagpur',
    priceBeforeDiscount: null,
    activityMessage: null,
    priceMessage: null,
    tagText: null,
    tagBackgroundColor: '#C0392B',
    tagTextColor: '#FFFFFF',
    bannerPicture: null,
    inclusions: [
        { inclusion: Inclusion.ACCOMMODATION, isIncluded: true },
        { inclusion: Inclusion.MEALS, isIncluded: true },
        { inclusion: Inclusion.PICK_DROP, isIncluded: true },
        { inclusion: Inclusion.PERMIT, isIncluded: true },
        { inclusion: Inclusion.GUIDE_FEE, isIncluded: true },
        { inclusion: Inclusion.CAMERA_FEE, isIncluded: false },
    ],
    moreInclusions: null,
    exclusions: 'Flights and personal expenses.',
    gettingThere: 'Nagpur airport is the nearest; the drive is about 4 hours.',
    faqs: [{ question: 'Are children allowed?', answer: 'Yes, children above 5 years can join the safaris.' }],
    saved: { itinerary: true, inclusions: true, gettingThere: true, faqs: true },
});

export const LOCAL_PACKAGES: readonly DemoPackagePlan[] = [
    {
        ownerEmail: PARTNER_EMAIL,
        slug: 'tiger-song-kanha-escape',
        websiteStatus: PackageWebsiteStatus.ACTIVE,
        isPopular: false,
        isBestDeal: false,
        deleteReasonName: null,
        deleteDetails: null,
        deletedAtIst: null,
        versions: [
            liveVersion({
                name: 'Kanha Escape',
                parkNames: ['Kanha Tiger Reserve'],
                dayCount: 3,
                pricePerPerson: 38000,
                totalPrice: 76000,
                packagePicture: 'leopard.jpg',
                galleryTitle: GALLERY_TITLE,
                overview: 'Three days at Tiger Song Kanha Camp with four core zone safaris and all meals.',
                days: [
                    day('Arrive at Kanha', 'Pick-up from Nagpur and drive to the camp.', [Meal.DINNER], GALLERY_TITLE),
                    day('Core zone safaris', 'Morning and evening safaris in the core zone.', [Meal.BREAKFAST, Meal.LUNCH, Meal.DINNER]),
                    day('Departure', 'Last morning safari and drive back to Nagpur.', [Meal.BREAKFAST]),
                ],
            }),
        ],
    },
    {
        ownerEmail: PARTNER_EMAIL,
        slug: 'tiger-song-tadoba-bandhavgarh-trail',
        websiteStatus: PackageWebsiteStatus.ACTIVE,
        isPopular: false,
        isBestDeal: false,
        deleteReasonName: null,
        deleteDetails: null,
        deletedAtIst: null,
        versions: [
            liveVersion({
                name: 'Tadoba and Bandhavgarh Trail',
                parkNames: ['Tadoba-Andhari Tiger Reserve', 'Bandhavgarh Tiger Reserve'],
                dayCount: 4,
                pricePerPerson: 52000,
                totalPrice: 104000,
                packagePicture: 'elephant.jpg',
                galleryTitle: null,
                overview: 'Two tiger reserves in one trip: two days in Tadoba, two in Bandhavgarh.',
                days: [
                    day('Arrive at Tadoba', 'Pick-up from Nagpur and an evening safari.', [Meal.DINNER]),
                    day('Tadoba safaris', 'Morning safari, then the drive towards Bandhavgarh.', [Meal.BREAKFAST, Meal.LUNCH, Meal.DINNER]),
                    day('Bandhavgarh safaris', 'Morning and evening safaris in Tala zone.', [Meal.BREAKFAST, Meal.LUNCH, Meal.DINNER]),
                    day('Departure', 'Breakfast and drop at Jabalpur.', [Meal.BREAKFAST]),
                ],
            }),
        ],
    },
];

export const LOCAL_QUOTES: readonly DemoQuotePlan[] = [
    {
        key: 'local-user-kanha-escape',
        senderEmail: USER_EMAIL,
        packageSlug: 'tiger-song-kanha-escape',
        versionNumber: 1,
        travellerCount: 2,
        startDate: '2027-01-15',
        notes: 'Two adults, our first tiger safari.',
        sentAtIst: '2026-11-10T18:00',
        mark: null,
        status: QuoteRequestStatus.ACTIVE,
    },
];
