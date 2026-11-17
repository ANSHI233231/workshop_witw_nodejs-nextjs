import type { DemoPartner, DemoPartnerOutcome, DemoPartnerState } from '../dto/partner-demo.dto';

export interface IPartnerDemoService {
    states(partners: readonly DemoPartner[]): Promise<DemoPartnerState[]>;
    add(partners: readonly DemoPartner[], password: string): Promise<DemoPartnerOutcome[]>;
    setLogo(partnerId: number, content: Buffer): Promise<boolean>;
    remove(
        target: { readonly partnerIds: readonly number[]; readonly accountEmails: readonly string[] },
        write: boolean,
    ): Promise<{ readonly partners: number; readonly accounts: number }>;
}
