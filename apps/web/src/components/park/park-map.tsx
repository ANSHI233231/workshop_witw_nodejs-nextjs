'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect, useRef } from 'react';

import { useT } from '@/hooks/i18n/use-t';
import { logger } from '@/lib/logger';

const log = logger.category('parks');

const MAP_ZOOM = 10;

const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

const PIN_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>';

export function ParkMap({
    name,
    latitude,
    longitude,
}: {
    readonly name: string;
    readonly latitude: number;
    readonly longitude: number;
}) {
    const t = useT();
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) return;
        let disposed = false;
        let dispose = () => {};
        import('leaflet')
            .then((leaflet) => {
                if (disposed) return;
                const map = leaflet.map(host, { scrollWheelZoom: false }).setView([latitude, longitude], MAP_ZOOM);
                leaflet
                    .tileLayer(TILE_URL, {
                        maxZoom: 19,
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    })
                    .addTo(map);
                leaflet
                    .marker([latitude, longitude], {
                        icon: leaflet.divIcon({
                            className: 'pk6-marker',
                            html: PIN_SVG,
                            iconSize: [36, 36],
                            iconAnchor: [18, 36],
                        }),
                        title: name,
                    })
                    .addTo(map);
                dispose = () => map.remove();
            })
            .catch((error: unknown) => log.error('The park map could not be loaded.', { error }));
        return () => {
            disposed = true;
            dispose();
        };
    }, [latitude, longitude, name]);

    return (
        <div className="pk6-map" role="img" aria-label={t('Map of {name} at {location}', { name, location: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` })}>
            <div ref={hostRef} style={{ position: 'absolute', inset: 0 }}></div>
            <span className="pk6-ll">{`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}</span>
        </div>
    );
}
