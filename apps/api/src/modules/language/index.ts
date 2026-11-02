import type { AccessGuard } from '../../core/http';

import type { LanguageModuleDependencies } from './contracts/language-module.contract';
import { AppTranslationController } from './controllers/app-translation.controller';
import { DataTranslationController } from './controllers/data-translation.controller';
import { LanguageController } from './controllers/language.controller';
import { AppTranslationRepository } from './repositories/app-translation.repository';
import { DataTranslationRepository } from './repositories/data-translation.repository';
import { LanguageRepository } from './repositories/language.repository';

import { createLanguageRouter } from './routes/language.routes';
import { AppTranslationService } from './services/app-translation.service';
import { DataTranslationService } from './services/data-translation.service';
import { LanguageService } from './services/language.service';

export type { LanguageModuleDependencies } from './contracts/language-module.contract';
export type { IAppTranslationService } from './contracts/app-translation-service.contract';
export type { IDataTranslationService } from './contracts/data-translation-service.contract';
export type {
    ActiveLanguageDto,
    DataTranslationChanges,
    DataTranslationEdit,
    DataTranslationTarget,
    DataTranslationValues,
    TranslatableColumns,
} from './dto/language.dto';

export const createLanguageModule = (dependencies: LanguageModuleDependencies) => {
    const languageRepository = new LanguageRepository();
    const appTranslationRepository = new AppTranslationRepository();
    const languageService = new LanguageService(
        dependencies.db,
        languageRepository,
        appTranslationRepository,
        dependencies.auditService,
        dependencies.translationDirectories,
    );
    const appTranslationService = new AppTranslationService(
        dependencies.db,
        appTranslationRepository,
        languageRepository,
        dependencies.auditService,
        dependencies.translationDirectories,
    );
    const dataTranslationService = new DataTranslationService(
        dependencies.db,
        new DataTranslationRepository(),
        languageRepository,
        dependencies.auditService,
    );
    const controllers = {
        language: new LanguageController(languageService),
        translation: new AppTranslationController(appTranslationService),
        dataTranslation: new DataTranslationController(dataTranslationService),
    };
    return {
        languageService,
        appTranslationService,
        dataTranslationService,
        createRouter: (superAdmin: AccessGuard) => createLanguageRouter(controllers, superAdmin),
    };
};
