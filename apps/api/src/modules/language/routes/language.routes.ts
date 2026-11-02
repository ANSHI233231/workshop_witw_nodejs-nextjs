import { type AccessGuard, type ApiRouter, apiRouter, asyncHandler, fileUpload, publicAccess } from '../../../core/http';
import { validate } from '../../../core/validation';
import type { LanguageController } from '../controllers/language.controller';
import type { AppTranslationController } from '../controllers/app-translation.controller';
import type { DataTranslationController } from '../controllers/data-translation.controller';
import { APP_TRANSLATION_UPLOAD_LIMITS } from '../types/language.types';
import {
    createLanguageSchema,
    createTranslationSchema,
    languageStatusSchema,
    listLanguageSchema,
    listTranslationSchema,
    translationStatusSchema,
    updateLanguageSchema,
    updateTranslationSchema,
} from '../validators/language.validators';

const translationFileUpload = fileUpload({
    field: 'file',
    maxFiles: 1,
    maxFileBytes: APP_TRANSLATION_UPLOAD_LIMITS.MAX_BYTES,
    tooLargeMessage: 'The file can be at most 2 MB.',
});

export const createLanguageRouter = (
    controllers: {
        readonly language: LanguageController;
        readonly translation: AppTranslationController;
        readonly dataTranslation: DataTranslationController;
    },
    superAdmin: AccessGuard,
): ApiRouter => {
    const route = apiRouter();
    const { language, translation, dataTranslation } = controllers;

    route.get('/active', publicAccess, asyncHandler(dataTranslation.languages));

    route.get('/master', superAdmin, validate(listLanguageSchema), asyncHandler(language.list));
    route.get('/master/options', superAdmin, asyncHandler(language.options));
    route.post('/master', superAdmin, validate(createLanguageSchema), asyncHandler(language.create));
    route.patch('/master/:code', superAdmin, validate(updateLanguageSchema), asyncHandler(language.update));
    route.patch('/master/:code/status', superAdmin, validate(languageStatusSchema), asyncHandler(language.setStatus));

    route.get('/translations', superAdmin, validate(listTranslationSchema), asyncHandler(translation.list));
    route.get('/translations/export', superAdmin, asyncHandler(translation.exportRows));
    route.get('/translations/languages', superAdmin, asyncHandler(translation.languages));
    route.get('/translations/last-publish', superAdmin, asyncHandler(translation.lastPublish));
    route.post('/translations', superAdmin, validate(createTranslationSchema), asyncHandler(translation.create));
    route.post('/translations/upload', superAdmin, translationFileUpload, asyncHandler(translation.upload));
    route.post('/translations/publish', superAdmin, asyncHandler(translation.publish));
    route.patch(
        '/translations/:id',
        superAdmin,
        validate(updateTranslationSchema),
        asyncHandler(translation.update),
    );
    route.patch(
        '/translations/:id/status',
        superAdmin,
        validate(translationStatusSchema),
        asyncHandler(translation.setStatus),
    );

    return route;
};
