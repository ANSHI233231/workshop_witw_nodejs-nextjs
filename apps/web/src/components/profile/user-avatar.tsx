import { cn } from '@/lib/class-names';
import { userPhotoUrl } from '@/services/profile.service';

export function UserAvatar({
    userId,
    initials,
    photoVersion,
    className,
}: {
    readonly userId: number;
    readonly initials: string;
    readonly photoVersion: string | null;
    readonly className?: string;
}) {
    return (
        <span className={cn('avatar', className)}>
            {photoVersion ? <img className="avatar-photo" src={userPhotoUrl(userId, photoVersion)} alt="" /> : initials}
        </span>
    );
}
