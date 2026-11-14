import { BreadcrumbChevronIcon } from '@/components/ui/icons';

export function PageBreadcrumb({
    portalLabel,
    pageLabel,
    ariaLabel,
}: {
    readonly portalLabel: string;
    readonly pageLabel: string;
    readonly ariaLabel: string;
}) {
    return (
        <nav className="breadcrumb" aria-label={ariaLabel}>
            <a>{portalLabel}</a>
            <BreadcrumbChevronIcon />
            <span>{pageLabel}</span>
        </nav>
    );
}
