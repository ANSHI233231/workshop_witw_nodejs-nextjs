import type { ISignUpProfileWriter, SignUpProfile } from '../contracts/sign-up-profile-writer.contract';

export class SignUpProfileSlot implements ISignUpProfileWriter {
    private writer: ISignUpProfileWriter | undefined;

    connect(writer: ISignUpProfileWriter): void {
        this.writer = writer;
    }

    async saveAtSignUp(userId: number, profile: SignUpProfile): Promise<void> {
        if (!this.writer) throw new Error('Sign-up profiles are not connected to the profile module.');
        await this.writer.saveAtSignUp(userId, profile);
    }
}
