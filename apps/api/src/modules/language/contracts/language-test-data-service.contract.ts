import type { LanguageTestData, LanguageTestDataMarker } from '../dto/language-test-data.dto';

export interface ILanguageTestDataService {
    find(marker: LanguageTestDataMarker): Promise<LanguageTestData>;
    remove(found: LanguageTestData): Promise<number>;
}
