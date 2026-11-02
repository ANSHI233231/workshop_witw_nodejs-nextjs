import type { Metadata } from 'next';
import Link from 'next/link';

import { WebsiteShell } from '@/components/website/website-shell';
import { consoleSession } from '@/lib/console-session';
import { serverTranslator } from '@/lib/i18n/server-translator';

import styles from './welcome.module.css';

export const generateMetadata = async (): Promise<Metadata> => ({ title: (await serverTranslator()).t('Welcome') });

const INSIDE = [
    {
        title: 'API',
        points: [
            'Node.js and Express, a modular monolith: one folder per business module',
            'Hand-written SQL with MySQL, no ORM; dated migrations applied by hand',
            'Sign-in with one session for every app, change and forgot password',
            'Audit log of every write, error and system logs, mail templates',
            'A CLI and a worker for background jobs, languages and translations',
        ],
    },
    {
        title: 'Manage console',
        points: [
            'The Super Admin app: users and roles',
            'Audit Log, Error Logs, System Logs, Notification Templates, Delivery Log',
            'Background Jobs: schedules, one-time runs, Run Command',
            'Languages and App Translations, published to every app',
            'Tech Documentation: the repository’s docs as pages',
        ],
    },
    {
        title: 'Web portal (this app)',
        points: [
            'This welcome page, sign-in and forgot password',
            'The signed-in frame with a menu and a dashboard',
            'Logging of browser and server errors, translations, error pages',
            'The skeleton every new app of the project starts from',
        ],
    },
    {
        title: 'Rules and docs',
        points: [
            'AGENTS.md: the rules for people and AI agents working in the repo',
            'docs/how-it-works: how every part works today',
            'docs/planning: one planning file per feature, with its test cases',
            'Word copies of the technical document and the deployment guides',
        ],
    },
] as const;

const URLS = [
    { app: 'Web portal', url: 'http://localhost:3040', what: 'This page, then Sign in' },
    { app: 'Manage console', url: 'http://localhost:3041', what: 'Super Admin sign-in' },
    { app: 'API', url: 'http://localhost:8030/api/health', what: 'Health check' },
] as const;

export default async function WelcomePage() {
    const { t } = await serverTranslator();
    const signedIn = (await consoleSession()) !== null;
    return (
        <WebsiteShell>
            <div className={styles.main}>
                <section className={styles.hero}>
                    <span className={styles.eyebrow}>{t('Project template')}</span>
                    <h1 className={styles.title}>{t('The core every new project starts from.')}</h1>
                    <p className={styles.lead}>
                        {t(
                            'An API, a Super Admin console and this example portal, already built, tested and documented, with the rules that keep the code, the docs and the database in step. Start a new project from it instead of building the same foundation again.',
                        )}
                    </p>
                    <div className={styles.actions}>
                        <Link href={signedIn ? '/dashboard' : '/login'} className="btn btn-primary">
                            {signedIn ? t('Open your dashboard') : t('Sign in to the portal')}
                        </Link>
                        <a href="#install" className="btn btn-secondary">
                            {t('Install it')}
                        </a>
                        <a href="#new-project" className="btn btn-secondary">
                            {t('Make it your project')}
                        </a>
                    </div>
                </section>

                <section className={styles.section}>
                    <h2 className={styles.heading}>{t('What is inside')}</h2>
                    <div className={styles.grid}>
                        {INSIDE.map((part) => (
                            <div key={part.title} className={styles.card}>
                                <h3 className={styles.cardTitle}>{t(part.title)}</h3>
                                <ul className={styles.list}>
                                    {part.points.map((point) => (
                                        <li key={point}>{t(point)}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="install" className={styles.section}>
                    <h2 className={styles.heading}>{t('Install it locally')}</h2>
                    <p className={styles.sub}>
                        {t('You need Node.js 20.9 or newer, npm, git and MySQL 8.')}
                    </p>
                    <ol className={styles.steps}>
                        <li className={styles.step}>
                            <div className={styles.stepBody}>
                                <h3 className={styles.stepTitle}>{t('Get a fresh copy')}</h3>
                                <pre className={styles.code}>{`npx degit git@github.com:aayush-cmd/starter_nodejs-nextjs.git my-project --mode=git
cd my-project`}</pre>
                                <p className={styles.stepText}>
                                    {t(
                                        'On GitHub you can instead open the starter, press Use this template and clone the new repository.',
                                    )}
                                </p>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepBody}>
                                <h3 className={styles.stepTitle}>{t('Set it up')}</h3>
                                <p className={styles.stepText}>
                                    {t(
                                        'It asks for the environment (development, staging, production), the project name, the database connection and your repository, then gives the project its own README, writes every .env with new secrets, creates the database with the migrations, installs the packages, creates the first Super Admin and sets up git. The steps that make it your project run once and are then removed, so in your project the same command only sets up machines: a new developer’s computer, staging or production. It runs once per machine; add --dry-run to see what it would do.',
                                    )}
                                </p>
                                <pre className={styles.code}>{`node init.js`}</pre>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepBody}>
                                <h3 className={styles.stepTitle}>{t('Run it')}</h3>
                                <p className={styles.stepText}>
                                    {t(
                                        'One terminal per app, or pm2 with the local process file the setup wrote.',
                                    )}
                                </p>
                                <pre className={styles.code}>{`cd apps/api && npm run dev
cd apps/manage && npm run dev
cd apps/web && npm run dev`}</pre>
                            </div>
                        </li>
                    </ol>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col">{t('App')}</th>
                                <th scope="col">{t('Address')}</th>
                                <th scope="col">{t('What you see')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {URLS.map((row) => (
                                <tr key={row.app}>
                                    <td>{t(row.app)}</td>
                                    <td>
                                        <span className={styles.inline}>{row.url}</span>
                                    </td>
                                    <td>{t(row.what)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section id="new-project" className={styles.section}>
                    <h2 className={styles.heading}>{t('Make it your new project')}</h2>
                    <ol className={styles.steps}>
                        <li className={styles.step}>
                            <div className={styles.stepBody}>
                                <h3 className={styles.stepTitle}>{t('Give it its own repository')}</h3>
                                <p className={styles.stepText}>
                                    {t(
                                        'Create an empty repository for the project and give its address to the setup (or add it later as origin). Nothing is ever pushed to the starter.',
                                    )}
                                </p>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepBody}>
                                <h3 className={styles.stepTitle}>{t('Give it your name')}</h3>
                                <p className={styles.stepText}>
                                    {t(
                                        'The setup renames “starter” in the process names, the database name, the sender of mails and the API’s description. The welcome page, the technical document and the apps’ titles are yours to rewrite.',
                                    )}
                                </p>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepBody}>
                                <h3 className={styles.stepTitle}>{t('Shape the apps')}</h3>
                                <p className={styles.stepText}>
                                    {t(
                                        'Rename web for your first product, or copy it for each app you need. The console’s colours are one set of tokens in globals.css, and each app has its own favicon.',
                                    )}
                                </p>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepBody}>
                                <h3 className={styles.stepTitle}>{t('Add the design prototype')}</h3>
                                <p className={styles.stepText}>
                                    {t(
                                        'Add your prototype repository as docs/prototype and list the boards that are ready in AGENTS.md.',
                                    )}
                                </p>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepBody}>
                                <h3 className={styles.stepTitle}>{t('Build the first feature the repo’s way')}</h3>
                                <p className={styles.stepText}>
                                    {t(
                                        'Copy docs/planning/TEMPLATE.md to a dated planning file, write the requirement and the test cases, then the migration, the module, the screens and the docs. AGENTS.md has every rule.',
                                    )}
                                </p>
                            </div>
                        </li>
                        <li className={styles.step}>
                            <div className={styles.stepBody}>
                                <h3 className={styles.stepTitle}>{t('Bring improvements back')}</h3>
                                <p className={styles.stepText}>
                                    {t(
                                        'When a project improves a core part, copy the change into the starter too, so the next project starts with it.',
                                    )}
                                </p>
                            </div>
                        </li>
                    </ol>
                </section>
            </div>
        </WebsiteShell>
    );
}
