import { describe, expect, it } from "vitest";

import { contactSchema, fieldErrors } from "@/lib/contact";

const VALID = {
  name: "Jordan Avery",
  email: "jordan@example.com",
  company: "Avery & Co.",
  projectType: "brand-identity",
  budget: "50-100k",
  message: "We are relaunching our brand this year and need a full identity system.",
  referral: "A friend in the industry",
};

describe("contactSchema", () => {
  it("accepts a complete, valid submission", () => {
    const result = contactSchema.safeParse(VALID);
    expect(result.success).toBe(true);
  });

  it("accepts optional fields being omitted entirely", () => {
    const { company, referral, ...rest } = VALID;
    const result = contactSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.company).toBe("");
      expect(result.data.referral).toBe("");
    }
  });

  it("rejects a name that is too short", () => {
    const result = contactSchema.safeParse({ ...VALID, name: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...VALID, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    const result = contactSchema.safeParse({ ...VALID, message: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too long", () => {
    const result = contactSchema.safeParse({ ...VALID, message: "a".repeat(2_001) });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown project type or budget", () => {
    expect(contactSchema.safeParse({ ...VALID, projectType: "logo-please" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...VALID, budget: "lots" }).success).toBe(false);
  });

  it("trims whitespace before validating lengths", () => {
    const result = contactSchema.safeParse({ ...VALID, name: "  Jordan Avery  " });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Jordan Avery");
  });
});

describe("fieldErrors", () => {
  it("maps issues to a field → message record, first message per field wins", () => {
    const result = contactSchema.safeParse({
      name: "",
      email: "bad",
      projectType: "brand-identity",
      budget: "50-100k",
      message: "too short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = fieldErrors(result.error);
      expect(typeof errors.name).toBe("string");
      expect(typeof errors.email).toBe("string");
      expect(typeof errors.message).toBe("string");
      expect(Object.keys(errors)).toHaveLength(3);
    }
  });
});
