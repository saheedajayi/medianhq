import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AccountStage, AuthUser } from "@/services/auth/types";
import {
  getAuthDestination,
  getAuthDestinationPath,
} from "./auth-routing.ts";

function createUser(accountStage: AccountStage): AuthUser {
  return {
    id: "user-1",
    email: "person+test@medianhq.co",
    firstName: "Median",
    lastName: "User",
    role: null,
    isEmailVerified: accountStage !== "EMAIL_VERIFICATION",
    hasMenteeProfile: false,
    hasMentorProfile: false,
    accountStage,
  };
}

describe("authentication routing", () => {
  const destinations = [
    ["ROLE_SELECTION", "/role-selection"],
    ["MENTEE_ONBOARDING", "/mentee-onboarding"],
    ["MENTOR_ONBOARDING", "/mentor-onboarding"],
    ["MENTOR_PENDING", "/mentor-submitted"],
    ["READY", "/dashboard"],
  ] satisfies Array<[AccountStage, string]>;

  for (const [accountStage, destination] of destinations) {
    it(`routes ${accountStage} accounts to ${destination}`, () => {
      assert.equal(getAuthDestination(createUser(accountStage)), destination);
    });
  }

  it("routes unverified accounts to email verification with encoded email", () => {
    assert.equal(
      getAuthDestination(createUser("EMAIL_VERIFICATION")),
      "/email-verification?email=person%2Btest%40medianhq.co",
    );
  });

  it("adds the retry flag when verification email delivery failed", () => {
    assert.equal(
      getAuthDestination(createUser("EMAIL_VERIFICATION"), {
        retryEmail: true,
      }),
      "/email-verification?email=person%2Btest%40medianhq.co&retryEmail=true",
    );
  });

  it("returns a pathname without query parameters for guarded-page checks", () => {
    assert.equal(
      getAuthDestinationPath(createUser("EMAIL_VERIFICATION")),
      "/email-verification",
    );
  });
});
