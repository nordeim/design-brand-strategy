import { describe, expect, it } from "vitest";
import { resolveDatabaseUrl } from "../db-url";

/**
 * Contract tests for the shared DATABASE_URL resolver.
 * Mirrors car-care's contract — repo root = design-brand-strategy.
 */

const ROOT = "/srv/design-brand-strategy";

describe("resolveDatabaseUrl", () => {
  it("resolves the portable relative URL against the repo-root cwd", () => {
    expect(resolveDatabaseUrl("file:../db/custom.db", ROOT)).toBe(
      `file:${ROOT}/db/custom.db`,
    );
  });

  it("walks up two levels from the standalone cwd (.next/standalone chdir trap)", () => {
    expect(
      resolveDatabaseUrl("file:../db/custom.db", `${ROOT}/.next/standalone`),
    ).toBe(`file:${ROOT}/db/custom.db`);
  });

  it("resolves a stale repo-relative URL (file:db/custom.db) to the repo root", () => {
    expect(resolveDatabaseUrl("file:db/custom.db", ROOT)).toBe(
      `file:${ROOT}/db/custom.db`,
    );
  });

  it("leaves absolute file: URLs untouched", () => {
    expect(resolveDatabaseUrl("file:/data/custom.db", ROOT)).toBe(
      "file:/data/custom.db",
    );
    expect(resolveDatabaseUrl("file:///data/custom.db", ROOT)).toBe(
      "file:///data/custom.db",
    );
  });

  it("leaves non-file connection URLs untouched", () => {
    expect(resolveDatabaseUrl("postgres://u:p@h:5432/db", ROOT)).toBe(
      "postgres://u:p@h:5432/db",
    );
  });

  it("leaves relative URLs that do not point at db/custom.db untouched", () => {
    expect(resolveDatabaseUrl("file:./other.sqlite", ROOT)).toBe(
      "file:./other.sqlite",
    );
  });

  it("returns undefined when no DATABASE_URL is set", () => {
    expect(resolveDatabaseUrl(undefined, ROOT)).toBeUndefined();
  });

  it("defaults cwd to process.cwd() when omitted", () => {
    expect(resolveDatabaseUrl("file:db/custom.db")).toBe(
      `file:${process.cwd()}/db/custom.db`,
    );
  });
});
