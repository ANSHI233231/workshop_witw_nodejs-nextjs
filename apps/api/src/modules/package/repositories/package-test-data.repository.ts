import type { DbExecutor, RowDataPacket } from '../../../database/connection';
import {
    PACKAGE_VERSION_CHILD_TABLES,
    type PackageVersionChildTable,
    PackageTestDataSQL,
} from '../sql/package-test-data.sql';

const startsWith = (text: string): string => `${text.replace(/[\\%_]/g, (character) => `\\${character}`)}%`;

export interface TestPackageRow extends RowDataPacket {
    id: number;
    partner_id: number;
    slug: string;
    website_status: number;
}

export interface TestVersionRow extends RowDataPacket {
    id: number;
    package_id: number;
    version_number: number;
    name: string;
}

export interface TestVersionChildRow extends RowDataPacket {
    id: number;
    package_version_id: number;
}

export interface TestReasonRow extends RowDataPacket {
    id: number;
    name: string;
}

export interface ReasonUseRow extends RowDataPacket {
    id: number;
    master_package_delete_reason_id: number;
}

export class PackageTestDataRepository {
    async marked(db: DbExecutor, partnerIds: readonly number[], textPrefix: string, slugPrefix: string): Promise<TestPackageRow[]> {
        return db.query<TestPackageRow>(PackageTestDataSQL.marked(partnerIds.length), [
            ...partnerIds,
            startsWith(slugPrefix),
            startsWith(textPrefix),
        ]);
    }

    async packagesNotIn(db: DbExecutor, packageIds: readonly number[]): Promise<TestPackageRow[]> {
        return db.query<TestPackageRow>(PackageTestDataSQL.packagesNotIn(packageIds.length), packageIds);
    }

    async versionsOf(db: DbExecutor, packageIds: readonly number[]): Promise<TestVersionRow[]> {
        if (packageIds.length === 0) return [];
        return db.query<TestVersionRow>(PackageTestDataSQL.versionsOf(packageIds.length), packageIds);
    }

    async markedVersionsOfOthers(db: DbExecutor, packageIds: readonly number[], textPrefix: string): Promise<TestVersionRow[]> {
        return db.query<TestVersionRow>(PackageTestDataSQL.markedVersionsOfOthers(packageIds.length), [
            ...packageIds,
            startsWith(textPrefix),
        ]);
    }

    async childrenOf(
        db: DbExecutor,
        versionIds: readonly number[],
    ): Promise<ReadonlyMap<PackageVersionChildTable, TestVersionChildRow[]>> {
        const children = new Map<PackageVersionChildTable, TestVersionChildRow[]>();
        for (const table of PACKAGE_VERSION_CHILD_TABLES) {
            const rows =
                versionIds.length === 0
                    ? []
                    : await db.query<TestVersionChildRow>(PackageTestDataSQL.childrenOf(table, versionIds.length), versionIds);
            children.set(table, rows);
        }
        return children;
    }

    async markedReasons(db: DbExecutor, textPrefix: string): Promise<TestReasonRow[]> {
        return db.query<TestReasonRow>(PackageTestDataSQL.markedReasons, [startsWith(textPrefix)]);
    }

    async reasonsUsedByOthers(
        db: DbExecutor,
        reasonIds: readonly number[],
        packageIds: readonly number[],
    ): Promise<ReasonUseRow[]> {
        if (reasonIds.length === 0) return [];
        return db.query<ReasonUseRow>(PackageTestDataSQL.reasonsUsedByOthers(reasonIds.length, packageIds.length), [
            ...reasonIds,
            ...packageIds,
        ]);
    }

    async deletePackages(db: DbExecutor, packageIds: readonly number[], versionIds: readonly number[]): Promise<number> {
        if (versionIds.length > 0) {
            for (const table of PACKAGE_VERSION_CHILD_TABLES) {
                await db.execute(PackageTestDataSQL.deleteChildren(table, versionIds.length), versionIds);
            }
            await db.execute(PackageTestDataSQL.deleteVersions(versionIds.length), versionIds);
        }
        if (packageIds.length === 0) return 0;
        return (await db.execute(PackageTestDataSQL.deletePackages(packageIds.length), packageIds)).affectedRows;
    }

    async deleteReasons(db: DbExecutor, reasonIds: readonly number[]): Promise<number> {
        if (reasonIds.length === 0) return 0;
        return (await db.execute(PackageTestDataSQL.deleteReasons(reasonIds.length), reasonIds)).affectedRows;
    }
}
