// Named, parameterized statements. A repository runs these and writes no SQL of its own.

export const HealthSQL = {
    ping: `SELECT 1 AS ok`,
} as const;
