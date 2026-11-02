import { AuthScreen } from './auth-screen';
import { SignInForm } from './sign-in-form';

export async function SignInScreen() {
    return (
        <AuthScreen>
            <SignInForm />
        </AuthScreen>
    );
}
