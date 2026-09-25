/**
 * Adapters build dates from venue listings with the local-time constructor
 * (`new Date(2026, 8, 16, 19, 30)`), so "local" has to mean Bristol. Without
 * this, the UTC GitHub runner stored every BST event an hour late (Sept 2026).
 *
 * Imported first in cli.ts so it's set before any other module runs.
 * The sync workflow sets TZ too; this makes local and ad-hoc runs match.
 */
process.env.TZ = 'Europe/London';

export {};
