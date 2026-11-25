import { ForbiddenException, NotFoundException } from '../../../core/exceptions';
import type { Database } from '../../../database/connection';
import { AuditAction, type AuditActionCode, AuditEntity, type IAuditService } from '../../audit';
import type { IPackageService, WebsiteCardDto } from '../../package';
import type { IPartnerService } from '../../partner';
import type { ISharedSafariService } from '../../shared-safari';
import type { IWishlistRepository } from '../contracts/wishlist-repository.contract';
import type { IWishlistService } from '../contracts/wishlist-service.contract';
import type {
    SavedItem,
    VisibilityChanges,
    WishlistChangeDto,
    WishlistIdsDto,
    WishlistPackageDto,
    WishlistPage,
    WishlistSafariDto,
} from '../dto/wishlist.dto';
import {
    WISHLIST_LIMITS,
    type WishlistItemRow,
    WishlistItemStatus,
    WishlistItemType,
    type WishlistItemTypeCode,
} from '../types/wishlist.types';
import { WISHLIST_MESSAGES } from '../validators/wishlist.validators';

type AuditPair = { readonly done: AuditActionCode; readonly failed: AuditActionCode };

type VisiblePackage = { readonly row: WishlistItemRow; readonly card: WebsiteCardDto };

const ADDED: AuditPair = { done: AuditAction.WISHLIST_ITEM_ADDED, failed: AuditAction.WISHLIST_ITEM_ADD_FAILED };

const REMOVED: AuditPair = { done: AuditAction.WISHLIST_ITEM_REMOVED, failed: AuditAction.WISHLIST_ITEM_REMOVE_FAILED };

const partnerRefused = (): ForbiddenException =>
    new ForbiddenException(WISHLIST_MESSAGES.PARTNER, 'WISHLIST_PARTNER');

const packageNotAvailable = (): NotFoundException =>
    new NotFoundException(WISHLIST_MESSAGES.PACKAGE_NOT_AVAILABLE, 'WISHLIST_PACKAGE_NOT_AVAILABLE');

const safariNotAvailable = (): NotFoundException =>
    new NotFoundException(WISHLIST_MESSAGES.SAFARI_NOT_AVAILABLE, 'WISHLIST_SAFARI_NOT_AVAILABLE');

const notInWishlist = (): NotFoundException =>
    new NotFoundException(WISHLIST_MESSAGES.NOT_IN_WISHLIST, 'WISHLIST_ITEM_NOT_FOUND');

const pageOf = <T>(all: readonly T[], page: number): WishlistPage<T> => {
    const size = WISHLIST_LIMITS.PAGE_SIZE;
    return {
        items: all.slice((page - 1) * size, page * size),
        total: all.length,
        page,
        pageSize: size,
        hasMore: page * size < all.length,
    };
};

const changesOf = (rows: readonly WishlistItemRow[], cards: ReadonlyMap<number, WebsiteCardDto>): VisibilityChanges => {
    const hiddenIds: number[] = [];
    const returnedIds: number[] = [];
    const droppedIds: number[] = [];
    for (const row of rows) {
        const card = row.package_id === null ? undefined : cards.get(row.package_id);
        if (!card) {
            if (row.is_hidden !== 1) hiddenIds.push(row.id);
        } else if (row.is_hidden === 1) {
            if (card.pricePerPerson === row.saved_price_per_person) returnedIds.push(row.id);
            else droppedIds.push(row.id);
        }
    }
    return { hiddenIds, returnedIds, droppedIds };
};

const hasChanges = (changes: VisibilityChanges): boolean =>
    changes.hiddenIds.length + changes.returnedIds.length + changes.droppedIds.length > 0;

export class WishlistService implements IWishlistService {
    constructor(
        private readonly db: Database,
        private readonly repository: IWishlistRepository,
        private readonly auditService: IAuditService,
        private readonly packageService: IPackageService,
        private readonly sharedSafariService: ISharedSafariService,
        private readonly partnerService: IPartnerService,
    ) {}

    async savedIds(userId: number): Promise<WishlistIdsDto> {
        await this.refusePartner(userId);
        const [packages, safaris] = await Promise.all([
            this.visiblePackages(userId),
            this.repository.savedOfUser(this.db, userId, WishlistItemType.SHARED_SAFARI),
        ]);
        return {
            packageIds: packages.map((item) => item.card.id),
            sharedSafariIds: safaris.flatMap((row) => (row.shared_safari_id === null ? [] : [row.shared_safari_id])),
        };
    }

    async packages(userId: number, page: number): Promise<WishlistPage<WishlistPackageDto>> {
        await this.refusePartner(userId);
        const visible = await this.visiblePackages(userId);
        return pageOf(
            visible.map(({ row, card }) => ({ ...card, savedAt: row.saved_at.toISOString() })),
            page,
        );
    }

    async sharedSafaris(userId: number, page: number): Promise<WishlistPage<WishlistSafariDto>> {
        await this.refusePartner(userId);
        const rows = await this.repository.savedOfUser(this.db, userId, WishlistItemType.SHARED_SAFARI);
        const ids = rows.flatMap((row) => (row.shared_safari_id === null ? [] : [row.shared_safari_id]));
        const cards = new Map((await this.sharedSafariService.cardsOfIds(ids, userId)).map((card) => [card.id, card]));
        const items = rows.flatMap((row) => {
            const card = row.shared_safari_id === null ? undefined : cards.get(row.shared_safari_id);
            return card ? [{ ...card, savedAt: row.saved_at.toISOString() }] : [];
        });
        return pageOf(items, page);
    }

    async addPackage(userId: number, packageId: number): Promise<WishlistChangeDto> {
        await this.refusePartner(userId);
        const shown = await this.packageService.shownPackage(packageId);
        if (!shown) throw packageNotAvailable();
        const existing = await this.repository.findPackageItem(this.db, userId, packageId);
        const result = { itemType: WishlistItemType.PACKAGE, itemId: packageId, isSaved: true };
        if (existing?.status === WishlistItemStatus.SAVED && existing.is_hidden !== 1) return result;
        await this.save(
            {
                userId,
                itemType: WishlistItemType.PACKAGE,
                packageId,
                sharedSafariId: null,
                savedPricePerPerson: shown.pricePerPerson,
            },
            existing,
        );
        return result;
    }

    async removePackage(userId: number, packageId: number): Promise<WishlistChangeDto> {
        await this.refusePartner(userId);
        const existing = await this.repository.findPackageItem(this.db, userId, packageId);
        await this.remove(existing, WishlistItemType.PACKAGE, packageId, userId);
        return { itemType: WishlistItemType.PACKAGE, itemId: packageId, isSaved: false };
    }

    async addSharedSafari(userId: number, sharedSafariId: number): Promise<WishlistChangeDto> {
        await this.refusePartner(userId);
        const state = await this.sharedSafariService.wishlistState(sharedSafariId);
        if (!state?.isSavable) throw safariNotAvailable();
        const existing = await this.repository.findSafariItem(this.db, userId, sharedSafariId);
        const result = { itemType: WishlistItemType.SHARED_SAFARI, itemId: sharedSafariId, isSaved: true };
        if (existing?.status === WishlistItemStatus.SAVED) return result;
        await this.save(
            {
                userId,
                itemType: WishlistItemType.SHARED_SAFARI,
                packageId: null,
                sharedSafariId,
                savedPricePerPerson: null,
            },
            existing,
        );
        return result;
    }

    async removeSharedSafari(userId: number, sharedSafariId: number): Promise<WishlistChangeDto> {
        await this.refusePartner(userId);
        const existing = await this.repository.findSafariItem(this.db, userId, sharedSafariId);
        await this.remove(existing, WishlistItemType.SHARED_SAFARI, sharedSafariId, userId);
        return { itemType: WishlistItemType.SHARED_SAFARI, itemId: sharedSafariId, isSaved: false };
    }

    private async visiblePackages(userId: number): Promise<VisiblePackage[]> {
        const rows = await this.repository.savedOfUser(this.db, userId, WishlistItemType.PACKAGE);
        const ids = rows.flatMap((row) => (row.package_id === null ? [] : [row.package_id]));
        const cards = new Map((await this.packageService.shownCards(ids)).map((card) => [card.id, card]));
        const changes = changesOf(rows, cards);
        if (hasChanges(changes)) await this.applyVisibility(userId, changes);
        const dropped = new Set(changes.droppedIds);
        return rows.flatMap((row) => {
            const card = row.package_id === null ? undefined : cards.get(row.package_id);
            return card && !dropped.has(row.id) ? [{ row, card }] : [];
        });
    }

    private async applyVisibility(userId: number, changes: VisibilityChanges): Promise<void> {
        const event = { action: AuditAction.WISHLIST_ITEMS_SYNCED, entityType: AuditEntity.WISHLIST_ITEM } as const;
        try {
            await this.db.transaction(async () => {
                await this.repository.setHidden(this.db, changes.hiddenIds, true, userId);
                await this.repository.setHidden(this.db, changes.returnedIds, false, userId);
                await this.repository.drop(this.db, changes.droppedIds, userId);
                await this.auditService.record({ ...event, details: { userId, ...changes } });
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { ...event, action: AuditAction.WISHLIST_ITEMS_SYNC_FAILED, details: { userId, ...changes } },
                error,
            );
            throw error;
        }
    }

    private async save(item: SavedItem, existing: WishlistItemRow | undefined): Promise<void> {
        await this.audited(ADDED, existing?.id, { ...item }, async () => {
            const id = await this.repository.save(this.db, item);
            return {
                id,
                changes: {
                    itemType: item.itemType,
                    packageId: item.packageId,
                    sharedSafariId: item.sharedSafariId,
                    savedPricePerPerson: item.savedPricePerPerson,
                    status: { from: existing?.status ?? null, to: WishlistItemStatus.SAVED },
                },
            };
        });
    }

    private async remove(
        existing: WishlistItemRow | undefined,
        itemType: WishlistItemTypeCode,
        itemId: number,
        userId: number,
    ): Promise<void> {
        await this.audited(REMOVED, existing?.id, { itemType, itemId }, async () => {
            if (existing?.status !== WishlistItemStatus.SAVED) throw notInWishlist();
            const done = await this.repository.setStatus(
                this.db,
                existing.id,
                WishlistItemStatus.SAVED,
                WishlistItemStatus.REMOVED,
                userId,
            );
            if (!done) throw notInWishlist();
            return {
                id: existing.id,
                changes: { itemType, itemId, status: { from: WishlistItemStatus.SAVED, to: WishlistItemStatus.REMOVED } },
            };
        });
    }

    private async audited(
        actions: AuditPair,
        id: number | undefined,
        input: Readonly<Record<string, unknown>>,
        work: () => Promise<{ readonly id: number; readonly changes: Readonly<Record<string, unknown>> }>,
    ): Promise<void> {
        try {
            await this.db.transaction(async () => {
                const done = await work();
                await this.auditService.record({
                    action: actions.done,
                    entityType: AuditEntity.WISHLIST_ITEM,
                    entityId: done.id,
                    changes: done.changes,
                });
            });
        } catch (error) {
            await this.auditService.recordFailure(
                { action: actions.failed, entityType: AuditEntity.WISHLIST_ITEM, entityId: id, details: { input } },
                error,
            );
            throw error;
        }
    }

    private async refusePartner(userId: number): Promise<void> {
        if (await this.partnerService.partnerOf(userId)) throw partnerRefused();
    }
}
