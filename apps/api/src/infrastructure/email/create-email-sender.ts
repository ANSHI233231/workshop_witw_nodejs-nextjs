import type { IEmailSender } from './email.contract';
import { CaptureEmailSender } from './providers/capture.provider';

export const EMAIL_DRIVERS = ['capture'] as const;

export type EmailDriver = (typeof EMAIL_DRIVERS)[number];

export const createEmailSender = (options: { readonly driver: EmailDriver }): IEmailSender => {
    switch (options.driver) {
        case 'capture':
            return new CaptureEmailSender();
    }
};
