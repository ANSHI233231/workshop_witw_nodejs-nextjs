'use client';

import { useEffect, useRef, useState } from 'react';

export function FallbackImage({
    sources,
    alt = '',
    className,
}: {
    readonly sources: readonly string[];
    readonly alt?: string;
    readonly className?: string;
}) {
    const [index, setIndex] = useState(0);
    const imageRef = useRef<HTMLImageElement>(null);
    const key = sources.join('|');
    const [lastKey, setLastKey] = useState(key);
    if (lastKey !== key) {
        setLastKey(key);
        setIndex(0);
    }
    const last = sources.length - 1;

    useEffect(() => {
        const image = imageRef.current;
        if (image && image.complete && image.naturalWidth === 0) setIndex((current) => Math.min(current + 1, last));
    }, [index, last]);

    return (
        <img
            ref={imageRef}
            className={className}
            src={sources[Math.min(index, last)]}
            alt={alt}
            onError={() => setIndex((current) => Math.min(current + 1, last))}
        />
    );
}
