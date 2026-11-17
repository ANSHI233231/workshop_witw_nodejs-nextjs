import type { DemoPartner } from '../../../modules/partner';
import type { DemoAccount } from '../../../modules/users';

export const LOCAL_SUPER_ADMIN: DemoAccount = { name: 'Anshika', email: 'anshika@example.in', mobile: '9876500201' };

export const LOCAL_PARTNER_ACCOUNT: DemoAccount = { name: 'Vivek Rao', email: 'partner@example.in', mobile: '9876500202' };

export const LOCAL_USER_ACCOUNT: DemoAccount = { name: 'Ananya Iyer', email: 'user@example.in', mobile: '9876500203' };

export const LOCAL_PARTNERS: readonly DemoPartner[] = [
    { account: LOCAL_PARTNER_ACCOUNT, business: null },
    { account: LOCAL_USER_ACCOUNT, business: null },
];

export const LOCAL_ACCOUNT_EMAILS: readonly string[] = [LOCAL_PARTNER_ACCOUNT.email, LOCAL_USER_ACCOUNT.email];

export const LOCAL_EMAILS: readonly string[] = [LOCAL_SUPER_ADMIN.email, ...LOCAL_ACCOUNT_EMAILS];

export const isLocalEmail = (email: string): boolean =>
    LOCAL_EMAILS.some((local) => local.toLowerCase() === email.toLowerCase());
