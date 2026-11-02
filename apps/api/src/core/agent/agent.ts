import { UAParser } from 'ua-parser-js';

export type HttpHeaders = Record<string, string | string[] | undefined>;

export interface AgentDetails {
    browser: string;
    browserVersion: string;
    platform: string;
    platformVersion: string;
    device: string;
    deviceVendor: string;
    deviceModel: string;
    deviceType: string;
    engine: string;
    engineVersion: string;
    cpu: string;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
    isRobot: boolean;
    isAndroid: boolean;
    isIos: boolean;
    isChrome: boolean;
    isSafari: boolean;
    isFirefox: boolean;
    isOpera: boolean;
    isEdge: boolean;
    languages: string[];
}

const ROBOT_MARKERS = [
    'bot',
    'spider',
    'crawler',
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'sogou',
    'exabot',
    'facebot',
    'ia_archiver',
    'google-read-aloud',
];

export class Agent {
    private parser: UAParser;
    private userAgent: string;
    private headers: HttpHeaders = {};
    private cachedDetails: AgentDetails | null = null;

    constructor(userAgent?: string, headers?: HttpHeaders) {
        this.userAgent = userAgent || '';
        this.headers = headers || {};
        this.parser = new UAParser(this.userAgent);
    }

    public setUserAgent(userAgent: string): void {
        if (this.userAgent !== userAgent) {
            this.userAgent = userAgent;
            this.parser.setUA(userAgent);
            this.cachedDetails = null;
        }
    }

    public setHttpHeaders(headers: HttpHeaders): void {
        this.headers = headers;
        const userAgent = headers['user-agent'];
        if (userAgent) {
            this.setUserAgent(Array.isArray(userAgent) ? (userAgent[0] ?? '') : userAgent);
        }
    }

    public browser(): string {
        const ua = this.userAgent;
        if (ua.includes('ClickworkerApp')) return 'ClickworkerApp';
        if (ua.includes('YJApp-IOS') || ua.includes('YJApp-ANDROID')) return 'Yahoo Japan App';
        if (ua.includes('android-timebucks-mobile')) return 'TimeBucks App';

        return this.parser.getBrowser().name || '';
    }

    public browserVersion(): string {
        const version = this.parser.getBrowser().version;
        if (version) return version;

        const ua = this.userAgent;
        if (/ClickworkerApp\/Android/i.test(ua)) return '';

        const yjMatch = ua.match(/(?:YJApp-IOS|YJApp-ANDROID)[^/]*\/([\d.]+)/i);
        if (yjMatch) return yjMatch[1] || '';

        const versionMatch = ua.match(/(?:ClickworkerApp|Quark|Whale|Ddg|Edge|EdgA|OPR)\/([\d.]+)/i);
        return versionMatch?.[1] ?? '';
    }

    public platform(): string {
        const os = this.parser.getOS().name;
        if (os) return os;

        const ua = this.userAgent.toLowerCase();
        if (ua.includes('openharmony')) return 'OpenHarmony';
        if (ua.includes('harmonyos')) return 'HarmonyOS';

        return '';
    }

    public platformVersion(): string {
        const osVersion = this.parser.getOS().version;
        if (osVersion) return osVersion;

        const match = this.userAgent.match(/(?:OpenHarmony|HarmonyOS)\s?([\d.]+)/i);
        return match?.[1] ?? '';
    }

    public device(): string {
        const device = this.parser.getDevice();
        if (device.model) return device.model;
        if (device.vendor) return device.vendor;

        const ua = this.userAgent;
        if (ua.includes('HuaweiBrowser') || ua.includes('Huawei')) return 'Huawei Device';
        if (ua.includes('Phone') && (ua.includes('OpenHarmony') || ua.includes('HarmonyOS'))) return 'HarmonyOS Phone';

        return '';
    }

    public deviceVendor(): string {
        const vendor = this.parser.getDevice().vendor;
        if (vendor) return vendor;

        const ua = this.userAgent;
        if (ua.includes('Huawei')) return 'Huawei';
        if (ua.includes('Samsung')) return 'Samsung';
        if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('Macintosh')) return 'Apple';

        return '';
    }

    public deviceType(): string {
        const type = this.parser.getDevice().type;
        if (type) return type;

        const ua = this.userAgent.toLowerCase();
        if (['mobile', 'phone', 'clickworkerapp', 'yjapp', 'timebucks'].some((marker) => ua.includes(marker))) return 'mobile';
        if (ua.includes('tablet') || ua.includes('ipad')) return 'tablet';

        return 'desktop';
    }

    public engine(): string {
        return this.parser.getEngine().name || '';
    }

    public engineVersion(): string {
        return this.parser.getEngine().version || '';
    }

    public cpu(): string {
        return this.parser.getCPU().architecture || '';
    }

    public isMobile(): boolean {
        const type = this.deviceType();
        return type === 'mobile' || type === 'tablet';
    }

    public isTablet(): boolean {
        return this.deviceType() === 'tablet';
    }

    public isDesktop(): boolean {
        return this.deviceType() === 'desktop';
    }

    public isRobot(): boolean {
        const ua = this.userAgent.toLowerCase();
        return ROBOT_MARKERS.some((marker) => ua.includes(marker));
    }

    public languages(): string[] {
        const header = this.headers['accept-language'];
        const acceptLanguage = (Array.isArray(header) ? header[0] : header) || '';
        if (!acceptLanguage) return [];

        return acceptLanguage
            .split(',')
            .map((language) => (language.split(';')[0] || '').trim())
            .filter((language) => language !== '');
    }

    public version(name: string): string {
        const search = name.toLowerCase();
        const browser = this.parser.getBrowser();
        const os = this.parser.getOS();

        if (browser.name && browser.name.toLowerCase() === search) return browser.version || '';
        if (os.name && os.name.toLowerCase() === search) return os.version || '';

        return '';
    }

    public is(name: string): boolean {
        const search = name.toLowerCase();
        const candidates = [this.parser.getBrowser().name || '', this.platform(), this.device(), this.deviceVendor()];
        return candidates.some((value) => value.toLowerCase().includes(search));
    }

    public getDetails(): AgentDetails {
        if (this.cachedDetails) return this.cachedDetails;

        const browser = this.browser().toLowerCase();
        const os = this.platform().toLowerCase();

        this.cachedDetails = {
            browser: this.browser(),
            browserVersion: this.browserVersion(),
            platform: this.platform(),
            platformVersion: this.platformVersion(),
            device: this.device(),
            deviceVendor: this.deviceVendor(),
            deviceModel: this.parser.getDevice().model || '',
            deviceType: this.deviceType(),
            engine: this.engine(),
            engineVersion: this.engineVersion(),
            cpu: this.cpu(),
            isMobile: this.isMobile(),
            isTablet: this.isTablet(),
            isDesktop: this.isDesktop(),
            isRobot: this.isRobot(),
            isAndroid: os.includes('android') || os.includes('openharmony') || os.includes('harmonyos'),
            isIos: os.includes('ios') || os.includes('mac os'),
            isChrome: browser.includes('chrome'),
            isSafari: browser.includes('safari') && !browser.includes('chrome'),
            isFirefox: browser.includes('firefox'),
            isOpera: browser.includes('opera') || browser.includes('opr'),
            isEdge: browser.includes('edge') || browser.includes('edg'),
            languages: this.languages(),
        };

        return this.cachedDetails;
    }
}
