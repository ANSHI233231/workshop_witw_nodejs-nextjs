import { redirect } from 'next/navigation';

import { consoleSession } from '@/lib/console-session';
import { currentSitePartner } from '@/lib/site-partner';

const SIGN_IN = '/login';

const HOME = '/';

export const requireMember = async (path: string, options: { readonly partnerGoesHome: boolean }) => {
    const session = await consoleSession();
    if (!session) redirect(`${SIGN_IN}?next=${encodeURIComponent(path)}`);
    const partner = await currentSitePartner();
    if (partner && options.partnerGoesHome) redirect(HOME);
    return { user: session.user, partner };
};
