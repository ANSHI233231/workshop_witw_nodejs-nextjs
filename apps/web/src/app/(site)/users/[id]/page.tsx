import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { UserProfileView } from '@/components/profile/user-profile';
import { SiteBanner } from '@/components/website/witw-site-frame';
import { ACCESS_TOKEN_COOKIE } from '@/lib/config';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { ApiError } from '@/services/api-error';
import { getUserProfile } from '@/services/profile.service';

const HOME = '/';

const USER_NOT_FOUND = 'USER_PROFILE_NOT_FOUND';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Profile') });

export default async function UserProfilePage({ params }: { readonly params: Promise<{ readonly id: string }> }) {
    const id = Number((await params).id);
    if (!Number.isInteger(id) || id <= 0) redirect(HOME);
    const accessToken = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
    let answer;
    try {
        answer = await getUserProfile(id, accessToken);
    } catch (error) {
        if (error instanceof ApiError && error.code === USER_NOT_FOUND) redirect(HOME);
        throw error;
    }
    if (answer.kind === 'partner') redirect(`/partners/${answer.partnerId}`);
    return (
        <>
            <SiteBanner title={answer.user.name} />
            <UserProfileView view={answer} />
        </>
    );
}
