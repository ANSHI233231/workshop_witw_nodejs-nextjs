import { AuthScreen } from './auth-screen';
import { SignInForm } from './sign-in-form';

export async function SignInScreen({ returnTo }: { readonly returnTo: string }) {
    return (
        <AuthScreen>
            <SignInForm returnTo={returnTo} />
        </AuthScreen>
    );
}
