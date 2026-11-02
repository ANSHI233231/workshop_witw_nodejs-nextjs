import type { RowDataPacket } from '../../../database/connection';

export const AuditModule = {
    USERS: 1,
    AUTH: 2,
    SYSTEM_LOG: 3,
    LANGUAGE: 4,
    JOBS: 5,
    NOTIFICATION: 6,
    MAIL: 7,
} as const;

export const AuditAction = {
    USER_CREATED: 101,
    USER_CREATE_FAILED: 102,
    USER_UPDATED: 103,
    USER_UPDATE_FAILED: 104,
    USER_PASSWORD_CHANGED: 105,
    USER_PASSWORD_CHANGE_FAILED: 106,

    SIGNED_IN: 201,
    SIGN_IN_FAILED: 202,
    SIGNED_OUT: 203,
    TOKENS_REFRESHED: 204,
    REFRESH_TOKEN_REUSED: 205,
    PASSWORD_RESET_REQUESTED: 206,
    PASSWORD_RESET_DONE: 207,
    PASSWORD_RESET_REFUSED: 208,

    APP_LOG_PRUNED: 301,
    APP_LOG_PRUNE_FAILED: 302,

    LANGUAGE_CREATED: 401,
    LANGUAGE_CREATE_FAILED: 402,
    LANGUAGE_UPDATED: 403,
    LANGUAGE_UPDATE_FAILED: 404,
    LANGUAGE_STATUS_CHANGED: 405,
    LANGUAGE_STATUS_CHANGE_FAILED: 406,
    TRANSLATION_CREATED: 407,
    TRANSLATION_CREATE_FAILED: 408,
    TRANSLATION_UPDATED: 409,
    TRANSLATION_UPDATE_FAILED: 410,
    TRANSLATION_STATUS_CHANGED: 411,
    TRANSLATION_STATUS_CHANGE_FAILED: 412,
    TRANSLATIONS_UPLOADED: 413,
    TRANSLATIONS_UPLOAD_FAILED: 414,
    TRANSLATIONS_PUBLISHED: 415,
    TRANSLATIONS_PUBLISH_FAILED: 416,
    TRANSLATION_COLUMN_ADDED: 417,
    TRANSLATION_COLUMN_ADD_FAILED: 418,
    LANGUAGES_FILE_WRITTEN: 419,
    LANGUAGES_FILE_WRITE_FAILED: 420,

    JOB_SCHEDULE_ADDED: 501,
    JOB_SCHEDULE_ADD_FAILED: 502,
    JOB_SCHEDULE_UPDATED: 503,
    JOB_SCHEDULE_UPDATE_FAILED: 504,
    JOB_RUN_QUEUED: 505,
    JOB_RUN_QUEUE_FAILED: 506,
    JOB_RUN_CANCELLED: 507,
    JOB_RUN_TERMINATED: 508,
    JOB_RUN_STOP_FAILED: 509,

    NOTIFICATION_TEST_SENT: 601,
    NOTIFICATION_TEST_FAILED: 602,

    MAIL_TEMPLATE_UPDATED: 701,
    MAIL_TEMPLATE_UPDATE_FAILED: 702,
} as const;

export const AuditEntity = {
    USER: 1,
    APP_LOG: 2,
    LANGUAGE: 3,
    LANGUAGE_TRANSLATION: 4,
    DATA_TRANSLATION: 5,
    JOB_SCHEDULE: 6,
    JOB_RUN: 7,
    MAIL_TEMPLATE: 8,
} as const;

export const AuditOutcome = { SUCCESS: 1, FAILURE: 2 } as const;

export type AuditModuleCode = (typeof AuditModule)[keyof typeof AuditModule];
export type AuditActionCode = (typeof AuditAction)[keyof typeof AuditAction];
export type AuditEntityCode = (typeof AuditEntity)[keyof typeof AuditEntity];
export type AuditOutcomeCode = (typeof AuditOutcome)[keyof typeof AuditOutcome];

export const ACTIONS_PER_MODULE = 100;

export const moduleOfAction = (action: AuditActionCode): number => Math.floor(action / ACTIONS_PER_MODULE);

export const AUDIT_LIMITS = {
    ACTOR_LABEL: 254,
    USER_AGENT: 512,
} as const;

export const AUDIT_LIST_LIMITS = { SEARCH: 100 } as const;

const nameMap = (codes: Readonly<Record<string, number>>): ReadonlyMap<number, string> =>
    new Map(Object.entries(codes).map(([name, code]) => [code, name]));

export const AUDIT_MODULE_NAMES = nameMap(AuditModule);

export const AUDIT_ACTION_NAMES = nameMap(AuditAction);

export const AUDIT_ENTITY_NAMES = nameMap(AuditEntity);

export interface AuditLogListRow extends RowDataPacket {
    id: number;
    client_app: number;
    module: number;
    action: number;
    outcome: number;
    user_id: number | null;
    user_name: string | null;
    username: string | null;
    actor_label: string | null;
    entity_type: number | null;
    entity_id: number | null;
    ip_address: string | null;
    created_at: Date;
}

export interface AuditLogDetailRow extends AuditLogListRow {
    changes: unknown;
    details: unknown;
    request_id: string | null;
    user_agent: string | null;
}

export interface AuditCountRow extends RowDataPacket {
    total: number;
}

export interface AuditSummaryRow extends RowDataPacket {
    total: number;
    failed: number | null;
    sign_in: number | null;
    today: number | null;
}
