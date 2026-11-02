export type EmailMessage = {
    readonly to: string;
    readonly from: string;
    readonly subject: string;
    readonly html: string;
};

export type EmailDelivery = {
    readonly outcome: 'sent' | 'captured';
    readonly providerMessageId?: string;
};

export interface IEmailSender {
    send(message: EmailMessage): Promise<EmailDelivery>;
}
