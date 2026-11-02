import { BreadcrumbChevronIcon } from '@/components/ui/icons';
import { TablePager } from '@/components/ui/table-pager';
import { formatCount } from '@/lib/format';
import type { Translate } from '@/lib/i18n/locale';
import { serverTranslator } from '@/lib/i18n/server-translator';
import type { Paginated } from '@/types/api.types';
import { MetaRoleStatus, type RoleListFilters, type RoleListItem } from '@/types/roles.types';

import { RolesFilterBar } from './roles-filter-bar';
import { ROLES_PATH, roleListParams } from './roles-url';

const COLUMNS = 3;

const STATUS_BADGES: Readonly<Record<number, { readonly className: string; readonly label: string }>> = {
    [MetaRoleStatus.ACTIVE]: { className: 'badge badge-success', label: 'Active' },
    [MetaRoleStatus.INACTIVE]: { className: 'badge badge-neutral', label: 'Inactive' },
};

function RoleRow({
    role,
    serial,
    t,
}: {
    readonly role: RoleListItem;
    readonly serial: number;
    readonly t: Translate;
}) {
    const badge = STATUS_BADGES[role.status];
    return (
        <tr>
            <td className="col-sno">{formatCount(serial)}</td>
            <td className="">{role.name}</td>
            <td className="col-status">{badge ? <span className={badge.className}>{t(badge.label)}</span> : '–'}</td>
        </tr>
    );
}

export async function RolesList({
    filters,
    result,
}: {
    readonly filters: RoleListFilters;
    readonly result: Paginated<RoleListItem>;
}) {
    const { t } = await serverTranslator();
    const firstSerial = (filters.page - 1) * result.meta.limit + 1;
    return (
        <div className="page">
            <div>
                <nav className="breadcrumb" aria-label={t('Breadcrumb')}>
                    <a>{t('User & Role')}</a>
                    <BreadcrumbChevronIcon />
                    <a>{t('Users & Roles')}</a>
                    <BreadcrumbChevronIcon />
                    <span>{t('Roles')}</span>
                </nav>
                <div className="page-head">
                    <h1 className="page-title">{t('Roles')}</h1>
                </div>
            </div>
            <div className="table-card">
                <RolesFilterBar filters={filters} />
                <div className="table-top">
                    <span className="table-total">
                        {t('Total Items')}: <b>{formatCount(result.meta.total)}</b>
                    </span>
                </div>
                <div className="table-scroll">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col" className="col-sno">
                                    {t('S.No')}
                                </th>
                                <th scope="col" className="">
                                    {t('Role')}
                                </th>
                                <th scope="col" className="col-status">
                                    {t('Status')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.items.length === 0 ? (
                                <tr>
                                    <td colSpan={COLUMNS} className="empty-value">
                                        {t('No roles found.')}
                                    </td>
                                </tr>
                            ) : (
                                result.items.map((role, index) => (
                                    <RoleRow key={role.id} role={role} serial={firstSerial + index} t={t} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <TablePager
                    path={ROLES_PATH}
                    params={roleListParams(filters)}
                    page={filters.page}
                    total={result.meta.total}
                    totalPages={result.meta.totalPages}
                    limit={result.meta.limit}
                />
            </div>
        </div>
    );
}
