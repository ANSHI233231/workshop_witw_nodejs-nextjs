import { mkdir, readdir, rename, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

import type { LanguageDto } from '../dto/language.dto';
import {
    BASE_LANGUAGE_CODE,
    LANGUAGE_SITES,
    type LanguageSite,
    LANGUAGES_FILE,
    WEBSITE_OF_APP,
} from '../types/language.types';

const TEXT_FILE = /^([a-z]{2,3})\.json$/;

export const textFileOf = (code: string): string => `${code}.json`;

export const jsonOf = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

export const writeAtomically = async (filePath: string, content: string): Promise<void> => {
    await mkdir(path.dirname(filePath), { recursive: true });
    const temporary = `${filePath}.${process.pid}.tmp`;
    await writeFile(temporary, content, 'utf8');
    await rename(temporary, filePath);
};

const publishedCodesIn = async (directory: string): Promise<string[]> => {
    try {
        return (await readdir(directory)).flatMap((name) => TEXT_FILE.exec(name)?.[1] ?? []);
    } catch {
        return [];
    }
};

const shownAt = (languages: readonly LanguageDto[], site: LanguageSite): LanguageDto[] =>
    languages.filter((language) => language.shownIn.includes(site));

const defaultOf = (languages: readonly LanguageDto[], site: LanguageSite): string =>
    languages.find((language) => language.defaultFor.includes(site))?.code ?? BASE_LANGUAGE_CODE;

const listed = (language: LanguageDto) => ({
    code: language.code,
    name: language.name,
    nativeName: language.nativeName,
    shortName: language.shortName,
});

export const writeLanguagesFiles = async (
    directories: Readonly<Record<string, string>>,
    activeLanguages: readonly LanguageDto[],
): Promise<string[]> => {
    const apps = Object.entries(directories);
    for (const [app, directory] of apps) {
        const published = await publishedCodesIn(directory);
        const offered = activeLanguages.filter(
            (language) => language.code === BASE_LANGUAGE_CODE || published.includes(language.code),
        );
        const portal = LANGUAGE_SITES.find((site) => site === app);
        const website = WEBSITE_OF_APP[app];
        const portalLanguages = portal ? shownAt(offered, portal) : [];
        const websiteLanguages = website ? shownAt(offered, website) : [];
        await writeAtomically(
            path.join(directory, LANGUAGES_FILE),
            jsonOf({
                defaultLocale: portal ? defaultOf(portalLanguages, portal) : BASE_LANGUAGE_CODE,
                languages: portalLanguages.map(listed),
                ...(website
                    ? {
                          websiteDefaultLocale: defaultOf(websiteLanguages, website),
                          websiteLanguages: websiteLanguages.map(listed),
                      }
                    : {}),
            }),
        );
    }
    return apps.map(([app]) => app);
};

export const lastTextPublish = async (directories: Readonly<Record<string, string>>): Promise<string | null> => {
    const times = await Promise.all(
        Object.values(directories).map(async (directory) => {
            const codes = await publishedCodesIn(directory);
            const fileTimes = await Promise.all(
                codes.map(async (code) => (await stat(path.join(directory, textFileOf(code)))).mtime.getTime()),
            );
            return fileTimes;
        }),
    );
    const latest = Math.max(...times.flat());
    return Number.isFinite(latest) ? new Date(latest).toISOString() : null;
};
