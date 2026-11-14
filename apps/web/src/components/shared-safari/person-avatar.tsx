import { cn } from '@/lib/class-names';
import { partnerLogoUrl } from '@/services/partner.service';
import type { Person } from '@/types/shared-safari.types';

export function PersonAvatar({
    person,
    className,
    title,
}: {
    readonly person: Person;
    readonly className?: string;
    readonly title?: string;
}) {
    const logoVersion = person.partner?.logoVersion;
    return (
        <span className={cn('avatar', className)} title={title}>
            {logoVersion && person.partner ? (
                <img className="avatar-photo" src={partnerLogoUrl(person.partner.id, logoVersion)} alt="" />
            ) : (
                person.initials
            )}
        </span>
    );
}
