import type { Metadata } from 'next';

import { PackageEditPage } from '@/components/package/package-edit-page';
import { serverTranslator } from '@/lib/i18n/server-translator';
import { readAccessToken, requireActivePartner } from '@/lib/portal-session';
import { getFormOptions } from '@/services/package.service';

export const generateMetadata = async (): Promise<Metadata> => ({
    title: (await serverTranslator()).t('Add package'),
});

export default async function NewPackagePage() {
    const { request } = await requireActivePartner();
    const options = await getFormOptions(await readAccessToken());
    return <PackageEditPage view={null} options={options} partnerName={request?.businessName ?? ''} />;
}
