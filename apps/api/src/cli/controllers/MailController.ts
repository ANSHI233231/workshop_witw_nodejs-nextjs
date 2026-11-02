import { config } from '../../config';
import { createEmailSender } from '../../infrastructure/email';
import { createAuditModule } from '../../modules/audit';
import { createMailModule, MailTemplateCode } from '../../modules/mail';
import { ConsoleController } from '../lib/ConsoleController';

const WITW_COLOURS: readonly (readonly [string, string])[] = [
    [
        'background:#F5F6F8;font-family:Arial,Helvetica,sans-serif;color:#1F2937',
        'background:#F5F5F5;font-family:Roboto,Arial,Helvetica,sans-serif;color:#1E1E1E',
    ],
    ['border:1px solid #E5E7EB', 'border:1px solid #D1D5DB'],
    ['#6B3FA0', '#09422D'],
    ['#6B7280', '#4B4B4B'],
];

export class MailController extends ConsoleController {
    /**
     * Gives the password-reset email the WITW colours (green button, WITW greys, Roboto), e.g. "npm run cli mail/witw-colours confirm". Dry run unless "confirm" is given; safe to run again.
     */
    public async actionWitwColours(confirm?: string): Promise<void> {
        const { auditService } = createAuditModule({ db: this.db });
        const { mailService } = createMailModule({
            db: this.db,
            auditService,
            emailSender: createEmailSender({ driver: config.mail.driver }),
            mailFrom: config.mail.from,
        });
        const templates = await mailService.listTemplates({ search: undefined, status: undefined });
        const template = templates.find((item) => item.code === MailTemplateCode.PASSWORD_RESET);
        if (!template) {
            this.stderr(`No mail template "${MailTemplateCode.PASSWORD_RESET}".\n`);
            process.exitCode = 1;
            return;
        }
        const { bodyHtml } = await mailService.templateDetail(template.id);
        const found = WITW_COLOURS.filter(([from]) => bodyHtml.includes(from));
        if (found.length === 0) {
            this.stdout(`Nothing to change: "${template.name}" already has the WITW colours (or was edited by hand).\n`);
            return;
        }
        const restyled = found.reduce((body, [from, to]) => body.split(from).join(to), bodyHtml);
        for (const [from, to] of found) this.stdout(`  ${from}  →  ${to}\n`);
        if (confirm !== 'confirm') {
            this.stdout(`Would change ${found.length} styles in "${template.name}".\n`);
            this.stdout(this.ansiFormat('Dry run: nothing written. Add "confirm" to change it.\n', 'yellow'));
            return;
        }
        await mailService.updateTemplateBody(template.id, restyled);
        this.stdout(`Changed ${found.length} styles in "${template.name}".\n`);
    }
}

export default MailController;
