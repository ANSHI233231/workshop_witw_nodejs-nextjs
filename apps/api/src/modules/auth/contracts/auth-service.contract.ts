import type { AuthSession, AuthUserDto } from '../dto/auth.dto';
import type { ActiveRole } from '../../users';
import type { ChangePasswordBody, SignInBody, SignUpBody, WebsiteSignUpBody } from '../validators/auth.validators';

export type SignedInSession = AuthSession & { readonly remember: boolean };

export type SignedUpWith<T> = { readonly session: SignedInSession; readonly created: T };

export type RefreshedSession = SignedInSession | { readonly user: AuthUserDto; readonly tokens: undefined };

export interface IAuthService {
    signIn(body: SignInBody): Promise<SignedInSession>;
    signUp(body: WebsiteSignUpBody): Promise<SignedInSession>;
    signUpWith<T>(body: SignUpBody, alsoCreate: (user: AuthUserDto) => Promise<T>): Promise<SignedUpWith<T>>;
    refresh(refreshToken: string | undefined): Promise<RefreshedSession>;
    signOut(refreshToken: string | undefined): Promise<void>;
    authenticate(accessToken: string | undefined, sessionUserId?: string): Promise<AuthUserDto>;
    identify(accessToken: string | undefined, sessionUserId?: string): Promise<AuthUserDto>;
    consoleRoles(userId: number): Promise<ActiveRole[]>;
    changePassword(userId: number, body: ChangePasswordBody): Promise<void>;
    grantedRoleIds(userId: number, roleIds: readonly number[]): Promise<number[]>;
}
