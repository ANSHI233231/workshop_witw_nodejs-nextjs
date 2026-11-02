import type { AuthUserDto } from '../dto/auth.dto';

type SignedInUser = {
    readonly id: number;
    readonly name: string;
    readonly username: string | null;
    readonly email: string | null;
    readonly passwordChangedAt: string | null;
};

export const toAuthUser = (user: SignedInUser): AuthUserDto => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    passwordChangedAt: user.passwordChangedAt,
});
