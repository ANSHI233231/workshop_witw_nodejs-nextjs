import type { EmailDelivery, EmailMessage, IEmailSender } from '../email.contract';

export class CaptureEmailSender implements IEmailSender {
    send(_message: EmailMessage): Promise<EmailDelivery> {
        return Promise.resolve({ outcome: 'captured' });
    }
}
