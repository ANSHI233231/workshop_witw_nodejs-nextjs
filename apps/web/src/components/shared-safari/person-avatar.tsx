import { useT } from '@/hooks/i18n/use-t';
import { cn } from '@/lib/class-names';
import { partnerLogoUrl } from '@/services/partner.service';
import { userPhotoUrl } from '@/services/profile.service';
import type { Person } from '@/types/shared-safari.types';

const DEFAULT_LOGO = '/witw/logo.png';

export function PersonAvatar({
    person,
    className,
    title,
}: {
    readonly person: Person;
    readonly className?: string;
    readonly title?: string;
}) {
    const t = useT();
    const logoVersion = person.partner?.logoVersion;
    return (
        <span className={cn('avatar', className)} title={title}>
            {person.partner && logoVersion ? (
                <img className="avatar-photo" src={partnerLogoUrl(person.partner.id, logoVersion)} alt="" />
            ) : person.partner ? (
                <img className="avatar-photo avatar-photo-default" src={DEFAULT_LOGO} alt={t('No logo yet')} />
            ) : person.photoVersion ? (
                <img className="avatar-photo" src={userPhotoUrl(person.id, person.photoVersion)} alt="" />
            ) : (
                person.initials
            )}
        </span>
    );
}
