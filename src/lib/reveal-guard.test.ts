import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Source-reading tests: the no-JS reveal guard and the skip link are markup/CSS
 * contracts that vitest cannot exercise through the DOM (no jsdom in this
 * repo), so they are protected by asserting the contracts exist in source.
 */

const css = readFileSync(resolve("src/app/globals.css"), "utf8");
const layout = readFileSync(resolve("src/app/layout.tsx"), "utf8");

describe("no-JS reveal guard (fail-open)", () => {
  it("globals.css forces [data-reveal] visible when the js class is absent", () => {
    expect(css).toContain("html:not(.js) [data-reveal]");
    expect(css).toMatch(/html:not\(\.js\)\s*\[data-reveal\][\s\S]*?opacity:\s*1\s*!important/);
  });

  it("globals.css guards scripting-disabled browsers via the scripting media query", () => {
    expect(css).toContain("(scripting: none)");
    expect(css).toMatch(
      /@media\s*\(scripting:\s*none\)[\s\S]*?\[data-reveal\][\s\S]*?opacity:\s*1\s*!important/,
    );
  });

  it("the inline theme script marks the document as js-enabled", () => {
    expect(layout).toContain('classList.add("js")');
  });
});

describe("skip-to-content link", () => {
  it("layout renders a skip link targeting #main-content", () => {
    expect(layout).toContain('href="#main-content"');
  });

  it("the main landmark carries the id the skip link targets", () => {
    expect(layout).toContain('id="main-content"');
  });
});
