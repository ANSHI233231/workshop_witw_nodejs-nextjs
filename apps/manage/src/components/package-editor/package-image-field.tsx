'use client';

import { useEffect, useMemo } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { IMAGE_ACCEPT } from '@/types/package.types';

import { checkImageFile, type PendingImage } from './package-rules';

export function PackageImageField({
    id,
    label,
    savedUrl,
    image,
    maxBytes,
    onChange,
    onProblem,
}: {
    readonly id?: string;
    readonly label: string;
    readonly savedUrl: string | null;
    readonly image: PendingImage;
    readonly maxBytes: number;
    readonly onChange: (image: PendingImage) => void;
    readonly onProblem: (message: string | null) => void;
}) {
    const t = useT();
    const preview = useMemo(() => (image.file ? URL.createObjectURL(image.file) : null), [image.file]);
    useEffect(() => () => (preview ? URL.revokeObjectURL(preview) : undefined), [preview]);
    const shown = preview ?? (image.removed ? null : savedUrl);

    return (
        <div className="pq-img">
            {shown && <img src={shown} alt="" />}
            <div className="ss-stack">
                <input
                    id={id}
                    className="input"
                    type="file"
                    accept={IMAGE_ACCEPT}
                    aria-label={label}
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = '';
                        if (!file) return;
                        const problem = checkImageFile(t, file, maxBytes);
                        onProblem(problem);
                        if (!problem) onChange({ file, removed: false });
                    }}
                />
                {shown && (
                    <button
                        type="button"
                        className="btn btn-text"
                        style={{ alignSelf: 'flex-start' }}
                        onClick={() => {
                            onProblem(null);
                            onChange({ file: null, removed: true });
                        }}
                    >
                        {t('Remove')}
                    </button>
                )}
            </div>
        </div>
    );
}
