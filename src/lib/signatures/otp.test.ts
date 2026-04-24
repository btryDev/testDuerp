import { describe, expect, it } from "vitest";
import { generateOtp, hashOtp, verifyOtp, otpExpirationDate } from "./otp";

describe("OTP", () => {
  it("génère un code à 6 chiffres", () => {
    for (let i = 0; i < 20; i++) {
      const otp = generateOtp();
      expect(otp).toMatch(/^\d{6}$/);
    }
  });

  it("vérifie un OTP valide", () => {
    const otp = generateOtp();
    const h = hashOtp(otp);
    expect(verifyOtp(otp, h)).toBe(true);
  });

  it("rejette un OTP incorrect", () => {
    const otp = "123456";
    const h = hashOtp(otp);
    expect(verifyOtp("999999", h)).toBe(false);
    expect(verifyOtp("12345", h)).toBe(false); // longueur
    expect(verifyOtp("1234567", h)).toBe(false);
  });

  it("rejette un hash mal formé", () => {
    expect(verifyOtp("123456", "notahash")).toBe(false);
  });

  it("calcule une expiration 10 minutes après now", () => {
    const now = new Date("2026-04-23T12:00:00Z");
    const exp = otpExpirationDate(now);
    expect(exp.toISOString()).toBe("2026-04-23T12:10:00.000Z");
  });
});
