-- Partner Portal as a place where languages are shown (master_language_site.site 4 = Partner Portal), so the Super
-- Admin can show a language in it and make it the default there. English starts shown and the default, as everywhere.
-- Plan: docs/planning/features/2026-11-16-review-fixes.md (fix 3). The API already treats English as shown in every
-- place, so the portal works before this runs; the row makes English's default visible in Console > Languages.
-- Codes: master_language_site.site 1 = Manage, 2 = Web Portal, 3 = Web Website, 4 = Partner Portal

INSERT INTO master_language_site (master_language_code, site, is_default)
VALUES ('en', 4, 1)
ON DUPLICATE KEY UPDATE master_language_code = master_language_code;
