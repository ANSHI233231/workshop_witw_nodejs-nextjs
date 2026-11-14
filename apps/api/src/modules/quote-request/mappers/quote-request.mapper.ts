import type {
    ConsoleQuoteRequestDto,
    MyQuoteRequestDto,
    PortalQuoteRequestDto,
    QuotePackageDto,
} from '../dto/quote-request.dto';
import type { QuoteRequestRow } from '../types/quote-request.types';

const isoOf = (value: Date | null): string | null => (value === null ? null : value.toISOString());

const packageOf = (row: QuoteRequestRow): QuotePackageDto => ({
    id: row.package_id,
    slug: row.package_slug,
    name: row.package_name,
    versionNumber: row.version_number,
});

const partnerOf = (row: QuoteRequestRow) => ({ id: row.partner_id, businessName: row.business_name });

export const toMine = (row: QuoteRequestRow): MyQuoteRequestDto => ({
    id: row.id,
    package: packageOf(row),
    partner: partnerOf(row),
    travellerCount: row.traveller_count,
    startDate: row.start_date,
    notes: row.notes,
    sentAt: row.created_at.toISOString(),
});

export const toPortal = (row: QuoteRequestRow, isPhoneShown: boolean): PortalQuoteRequestDto => ({
    id: row.id,
    user: { name: row.user_name, phone: isPhoneShown ? row.user_mobile : null },
    package: packageOf(row),
    travellerCount: row.traveller_count,
    startDate: row.start_date,
    notes: row.notes,
    receivedAt: row.created_at.toISOString(),
    mark: row.mark,
    markedAt: isoOf(row.marked_at),
});

export const toConsole = (row: QuoteRequestRow): ConsoleQuoteRequestDto => ({
    id: row.id,
    user: { id: row.user_id, name: row.user_name, email: row.user_email, mobile: row.user_mobile },
    package: packageOf(row),
    partner: partnerOf(row),
    travellerCount: row.traveller_count,
    startDate: row.start_date,
    notes: row.notes,
    receivedAt: row.created_at.toISOString(),
    mark: row.mark,
    markedAt: isoOf(row.marked_at),
    status: row.status,
});
