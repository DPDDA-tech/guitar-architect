import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// These tests cannot spin up a real Postgres instance in this environment
// (no Docker/Deno available, and remote db push is explicitly out of scope
// for this change). Instead they statically verify that the SQL migration
// and the Edge Function source actually encode the intended security model,
// so a future edit that reintroduces a client write path — even one that
// "looks safe" (e.g. `auth.uid() = user_id`) — fails this suite immediately
// instead of only being caught by a live pentest.

const MIGRATION_PATH = path.resolve(
  __dirname,
  '../supabase/migrations/20260723000215_gear_public_feedback.sql'
);
const SERVICE_ROLE_GRANTS_MIGRATION_PATH = path.resolve(
  __dirname,
  '../supabase/migrations/20260723035421_gear_public_feedback_service_role_grants.sql'
);
const EDGE_FUNCTION_PATH = path.resolve(
  __dirname,
  '../supabase/functions/submit-gear-feedback/index.ts'
);

const migrationSql = fs.readFileSync(MIGRATION_PATH, 'utf8');
const serviceRoleGrantsMigrationSql = fs.readFileSync(SERVICE_ROLE_GRANTS_MIGRATION_PATH, 'utf8');
const edgeFunctionSource = fs.readFileSync(EDGE_FUNCTION_PATH, 'utf8');

// Strip SQL line comments so a "-- create policy ... for insert" mentioned
// only in prose can't accidentally satisfy (or fail) a regex check.
const stripSqlComments = (sql: string) =>
  sql
    .split(/\r\n|\n/)
    .map(line => line.replace(/--.*$/, ''))
    .join('\n');

const migrationCode = stripSqlComments(migrationSql);

describe('gear_public_feedback: no client write path (RLS + grants)', () => {
  it('does not create any INSERT policy for gear_public_feedback', () => {
    const insertPolicy = /create\s+policy[^;]*?for\s+insert[^;]*?on\s+public\.gear_public_feedback|create\s+policy[^;]*?on\s+public\.gear_public_feedback[^;]*?for\s+insert/is;
    expect(insertPolicy.test(migrationCode)).toBe(false);
  });

  it('does not create any UPDATE policy for gear_public_feedback', () => {
    const updatePolicy = /create\s+policy[^;]*?for\s+update[^;]*?on\s+public\.gear_public_feedback|create\s+policy[^;]*?on\s+public\.gear_public_feedback[^;]*?for\s+update/is;
    expect(updatePolicy.test(migrationCode)).toBe(false);
  });

  it('does not create any DELETE policy for gear_public_feedback', () => {
    const deletePolicy = /create\s+policy[^;]*?for\s+delete[^;]*?on\s+public\.gear_public_feedback|create\s+policy[^;]*?on\s+public\.gear_public_feedback[^;]*?for\s+delete/is;
    expect(deletePolicy.test(migrationCode)).toBe(false);
  });

  it('creates exactly one policy for gear_public_feedback, and it is a SELECT policy scoped to auth.uid() = user_id', () => {
    const policyBlocks = [...migrationCode.matchAll(/create\s+policy\s+"([^"]+)"\s+on\s+public\.gear_public_feedback([\s\S]*?);/gi)];
    expect(policyBlocks).toHaveLength(1);
    const [, name, body] = policyBlocks[0];
    expect(name.toLowerCase()).toContain('read');
    expect(/for\s+select/i.test(body)).toBe(true);
    expect(/using\s*\(\s*auth\.uid\(\)\s*=\s*user_id\s*\)/i.test(body)).toBe(true);
  });

  it('revokes all default privileges before granting, and grants ONLY select to authenticated', () => {
    expect(/revoke\s+all\s+on\s+table\s+public\.gear_public_feedback\s+from\s+anon,\s*authenticated/i.test(migrationCode)).toBe(true);

    const grantStatements = [...migrationCode.matchAll(/grant\s+([^;]+?)\s+on\s+table\s+public\.gear_public_feedback\s+to\s+([^;]+);/gi)];
    expect(grantStatements.length).toBeGreaterThan(0);
    for (const [, privileges, roles] of grantStatements) {
      const privilegeList = privileges.toLowerCase();
      expect(privilegeList).toContain('select');
      expect(privilegeList).not.toContain('insert');
      expect(privilegeList).not.toContain('update');
      expect(privilegeList).not.toContain('delete');
      // These grants must never be extended to raw anon or unauthenticated callers.
      expect(roles.toLowerCase()).not.toContain('anon');
    }
  });

  it('never grants insert, update or delete on the table to anon or authenticated anywhere in the migration', () => {
    const dangerousGrant = /grant\s+(?:[^;]*\b(?:insert|update|delete)\b[^;]*)\s+on\s+table\s+public\.gear_public_feedback\s+to\s+(?:[^;]*\b(?:anon|authenticated)\b[^;]*);/i;
    expect(dangerousGrant.test(migrationCode)).toBe(false);
  });

  it('keeps the risk_status protection trigger as defense-in-depth, documented as not a substitute for the missing write policies', () => {
    expect(/create\s+trigger\s+gear_feedback_protect_risk_status/i.test(migrationCode)).toBe(true);
    expect(migrationSql).toMatch(/defense-in-depth/i);
    expect(migrationSql).toMatch(/is not a substitute for them/i);
  });

  it('keeps the rate-limit table fully locked down from anon/authenticated (service_role only, via RPC)', () => {
    expect(/revoke\s+all\s+on\s+table\s+public\.gear_feedback_rate_limits\s+from\s+anon,\s*authenticated/i.test(migrationCode)).toBe(true);
    const rateLimitPolicies = [...migrationCode.matchAll(/create\s+policy[^;]*?on\s+public\.gear_feedback_rate_limits[\s\S]*?;/gi)];
    expect(rateLimitPolicies).toHaveLength(0);
    expect(/grant\s+execute\s+on\s+function\s+public\.gear_feedback_check_rate_limit\([^)]*\)\s+to\s+service_role/i.test(migrationCode)).toBe(true);
  });
});

describe('submit-gear-feedback Edge Function: writes only via service_role, user_id only from JWT', () => {
  it('builds the write-capable client from SUPABASE_SERVICE_ROLE_KEY, never from an anon/publishable key', () => {
    expect(edgeFunctionSource).toMatch(/Deno\.env\.get\(\s*['"]SUPABASE_SERVICE_ROLE_KEY['"]\s*\)/);
    expect(edgeFunctionSource).toMatch(/createClient\(\s*supabaseUrl,\s*supabaseServiceRoleKey\s*\)/);
  });

  it('performs the upsert on the service-role client, not the user-scoped client', () => {
    const upsertCall = edgeFunctionSource.match(/(\w+)\s*\n?\s*\.from\('gear_public_feedback'\)\s*\.upsert\(/);
    expect(upsertCall).not.toBeNull();
    expect(upsertCall?.[1]).toBe('adminClient');
  });

  it('upserts on conflict(product_id, user_id), so a repeat submission updates the existing row instead of creating a duplicate', () => {
    expect(edgeFunctionSource).toMatch(/onConflict:\s*['"]product_id,user_id['"]/);
  });

  it('reports whether the row already existed (create vs update) using its own pre-check, not client input', () => {
    expect(edgeFunctionSource).toMatch(/const\s+wasExisting\s*=\s*Boolean\(existingRow\)/);
    expect(edgeFunctionSource).toMatch(/status:\s*wasExisting\s*\?\s*'updated'\s*:\s*'created'/);
  });

  it('never writes a client-supplied user_id — the upserted user_id comes from the authenticated JWT', () => {
    // The value assigned to `user_id:` in the upsert payload must be the
    // `userId` variable derived from userClient.auth.getUser(), never a key
    // read out of the parsed request body.
    expect(edgeFunctionSource).toMatch(/const\s+userId\s*=\s*userData\.user\.id/);
    expect(edgeFunctionSource).toMatch(/user_id:\s*userId\b/);
    expect(edgeFunctionSource).not.toMatch(/user_id:\s*(?:rawBody|body|feedback)\??\.\s*userId/i);
    expect(edgeFunctionSource).not.toMatch(/user_id:\s*(?:rawBody|body)\.user_id/i);
  });

  it('extracts the user strictly from the Authorization JWT before doing anything else with the payload', () => {
    expect(edgeFunctionSource).toMatch(/req\.headers\.get\('Authorization'\)/);
    expect(edgeFunctionSource).toMatch(/userClient\.auth\.getUser\(\)/);
  });

  it('validates the Turnstile token and the rate limit before any database write', () => {
    const turnstileIndex = edgeFunctionSource.indexOf('verifyTurnstileToken(');
    const rateLimitIndex = edgeFunctionSource.indexOf('gear_feedback_check_rate_limit');
    const upsertIndex = edgeFunctionSource.indexOf(".upsert(");
    expect(turnstileIndex).toBeGreaterThan(-1);
    expect(rateLimitIndex).toBeGreaterThan(-1);
    expect(upsertIndex).toBeGreaterThan(-1);
    expect(turnstileIndex).toBeLessThan(upsertIndex);
    expect(rateLimitIndex).toBeLessThan(upsertIndex);
  });

  it('returns only a safe status/message, never raw database errors or stack traces', () => {
    // Matches both jsonResponse(req, { ... }) and errorResponse(req, status, 'literal') calls.
    const responseCalls = edgeFunctionSource.match(/(?:json|error)Response\([^;]*?\)(?=[;,\)])/gs) ?? [];
    expect(responseCalls.length).toBeGreaterThan(0);
    for (const call of responseCalls) {
      expect(call).not.toMatch(/error\.stack/);
      expect(call).not.toMatch(/upsertError\.message|existingRowError\.message|rateLimitError\.message|userError\.message/);
    }
  });

  it('restricts CORS to an explicit origin allowlist instead of a wildcard', () => {
    expect(edgeFunctionSource).not.toMatch(/Access-Control-Allow-Origin['"]?\s*:\s*['"]\*['"]/);
    expect(edgeFunctionSource).toMatch(/ALLOWED_ORIGINS/);
    expect(edgeFunctionSource).toMatch(/guitararchitect\.com\.br/);
  });

  it('handles OPTIONS preflight requests using the same origin-aware CORS headers', () => {
    expect(edgeFunctionSource).toMatch(/req\.method === 'OPTIONS'/);
    expect(edgeFunctionSource).toMatch(/buildCorsHeaders\(req\)/);
  });
});

describe('Frontend: no direct write path to gear_public_feedback, no service role key', () => {
  const FRONTEND_ROOTS = ['components', 'utils', 'src', 'data', 'features', 'music', 'types'];
  const PROJECT_ROOT = path.resolve(__dirname, '..');

  const listFiles = (dir: string): string[] => {
    const abs = path.join(PROJECT_ROOT, dir);
    if (!fs.existsSync(abs)) return [];
    const entries = fs.readdirSync(abs, { withFileTypes: true });
    return entries.flatMap(entry => {
      const rel = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(rel);
      if (/\.(ts|tsx)$/.test(entry.name)) return [rel];
      return [];
    });
  };

  const frontendFiles = [
    ...FRONTEND_ROOTS.flatMap(listFiles),
    'App.tsx',
    'types.ts',
    'i18n.ts',
  ].filter(rel => fs.existsSync(path.join(PROJECT_ROOT, rel)));

  it('scans a non-trivial number of frontend source files (sanity check for the scan itself)', () => {
    expect(frontendFiles.length).toBeGreaterThan(20);
  });

  it('never calls .insert/.update/.upsert/.delete chained to the gear_public_feedback table anywhere in the frontend', () => {
    const offenders: string[] = [];
    for (const rel of frontendFiles) {
      const content = fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8');
      if (!content.includes('gear_public_feedback')) continue;
      // Look at each usage of the table name and check nearby chained calls.
      const regex = /from\(\s*['"]gear_public_feedback['"]\s*\)([\s\S]{0,120})/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content))) {
        const nearby = match[1];
        if (/\.(insert|update|upsert|delete)\s*\(/.test(nearby)) {
          offenders.push(rel);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('only ever pairs gear_public_feedback with .select( in the frontend (read-only usage)', () => {
    const usages: { file: string; hasSelect: boolean }[] = [];
    for (const rel of frontendFiles) {
      const content = fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8');
      if (!content.includes('gear_public_feedback')) continue;
      const regex = /from\(\s*['"]gear_public_feedback['"]\s*\)([\s\S]{0,60})/g;
      let match: RegExpExecArray | null;
      while ((match = regex.exec(content))) {
        usages.push({ file: rel, hasSelect: /\.select\s*\(/.test(match[1]) });
      }
    }
    expect(usages.length).toBeGreaterThan(0);
    expect(usages.every(u => u.hasSelect)).toBe(true);
  });

  it('never references SUPABASE_SERVICE_ROLE_KEY or a service-role key anywhere in frontend source', () => {
    const offenders: string[] = [];
    for (const rel of frontendFiles) {
      const content = fs.readFileSync(path.join(PROJECT_ROOT, rel), 'utf8');
      if (/service[_-]?role/i.test(content)) offenders.push(rel);
    }
    expect(offenders).toEqual([]);
  });

  it('submission still only goes through the Edge Function via supabase.functions.invoke', () => {
    const clientPath = path.join(PROJECT_ROOT, 'utils/gearFeedbackClient.ts');
    const content = fs.readFileSync(clientPath, 'utf8');
    expect(content).toMatch(/supabase\.functions\.invoke\(\s*['"]submit-gear-feedback['"]/);
  });
});

describe('Corrective migration: service_role grants on gear_public_feedback', () => {
  const stripped = stripSqlComments(serviceRoleGrantsMigrationSql);

  it('grants exactly select, insert, update on gear_public_feedback to service_role', () => {
    const grantStatements = [...stripped.matchAll(/grant\s+([^;]+?)\s+on\s+table\s+public\.gear_public_feedback\s+to\s+([^;]+);/gi)];
    expect(grantStatements).toHaveLength(1);
    const [, privileges, roles] = grantStatements[0];
    const privilegeList = privileges.toLowerCase().replace(/\s+/g, ' ').trim();
    expect(privilegeList).toBe('select, insert, update');
    expect(roles.trim().toLowerCase()).toBe('service_role');
  });

  it('does not grant anything on gear_feedback_rate_limits (access stays exclusive to the security definer RPC)', () => {
    expect(stripped).not.toMatch(/gear_feedback_rate_limits/i);
  });

  it('does not touch RLS, policies, or any other object — grants only', () => {
    expect(stripped).not.toMatch(/create\s+policy/i);
    expect(stripped).not.toMatch(/drop\s+policy/i);
    expect(stripped).not.toMatch(/alter\s+table/i);
    expect(stripped).not.toMatch(/create\s+trigger/i);
    expect(stripped).not.toMatch(/create\s+(or\s+replace\s+)?function/i);
    expect(stripped).not.toMatch(/drop\s+table/i);
  });

  it('does not edit the already-applied original migration', () => {
    // Sanity check: the original migration file must still exist unchanged
    // in its grant shape (authenticated stays select-only) — this corrective
    // migration is additive, in its own new file. Uses the same
    // comment-stripped source as the rest of the suite so a "grant" mentioned
    // only in prose above the real statement can't be matched instead.
    const originalStripped = stripSqlComments(migrationSql);
    const originalGrant = originalStripped.match(/grant\s+([^;]+?)\s+on\s+table\s+public\.gear_public_feedback\s+to\s+([^;]+);/i);
    expect(originalGrant?.[1].toLowerCase().trim()).toBe('select');
    expect(originalGrant?.[2].trim().toLowerCase()).toBe('authenticated');
  });
});
