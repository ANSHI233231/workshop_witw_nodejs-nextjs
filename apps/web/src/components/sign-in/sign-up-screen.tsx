import { AuthScreen } from './auth-screen';
import { SignUpForm } from './sign-up-form';

export async function SignUpScreen() {
    return (
        <AuthScreen>
            <SignUpForm />
        </AuthScreen>
    );
}
