import type { PaginationQuery } from '../../../core/validation';
import type {
    LastPublishDto,
    PublishResult,
    AppTranslationDto,
    AppTranslationExportRow,
    AppTranslationFilters,
    AppTranslationInput,
    AppTranslationLanguageDto,
    AppTranslationPage,
    AppTranslationUploadResult,
} from '../dto/language.dto';

export interface IAppTranslationService {
    languages(): Promise<AppTranslationLanguageDto[]>;
    list(filters: AppTranslationFilters, pagination: PaginationQuery): Promise<AppTranslationPage>;
    lastPublish(): Promise<LastPublishDto>;
    exportRows(): Promise<AppTranslationExportRow[]>;
    create(input: AppTranslationInput, actorId: number): Promise<AppTranslationDto>;
    update(id: number, input: AppTranslationInput, actorId: number): Promise<AppTranslationDto>;
    setStatus(id: number, status: number, actorId: number): Promise<AppTranslationDto>;
    upload(content: Buffer, actorId: number): Promise<AppTranslationUploadResult>;
    publish(): Promise<PublishResult>;
}
