'use client';

import { PackageEditor } from '@/components/package-editor/package-editor';
import { PackageSide } from '@/components/package/package-side';
import { PACKAGES_PATH } from '@/hooks/package/use-package-actions';
import { createPackage } from '@/services/package.service';
import type { FormOptions, PackageView } from '@/types/package.types';

export function PackageEditorHost({
    initial,
    options,
    partnerName,
}: {
    readonly initial: PackageView | null;
    readonly options: FormOptions;
    readonly partnerName: string;
}) {
    return (
        <PackageEditor
            mode="partner"
            initial={initial}
            options={options}
            listPath={PACKAGES_PATH}
            create={createPackage}
            renderSide={(context) => <PackageSide context={context} partnerName={partnerName} />}
        />
    );
}
