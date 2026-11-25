import type { GenderCode } from '../../../core/validation';

export type SignUpProfile = {
    readonly dateOfBirth: string;
    readonly gender: GenderCode;
};

export interface ISignUpProfileWriter {
    saveAtSignUp(userId: number, profile: SignUpProfile): Promise<void>;
}
