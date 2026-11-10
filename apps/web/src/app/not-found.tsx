import { StatusPage } from '@/components/layout/status-page';
import { WebsitePage } from '@/components/website/website-shell';

export default function NotFound() {
    return (
        <WebsitePage>
            <StatusPage kind="not-found" framed />
        </WebsitePage>
    );
}
