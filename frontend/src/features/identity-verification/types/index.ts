export type VerificationStatusValue =
  | "NOT_STARTED"
  | "PENDING"
  | "PROCESSING"
  | "VERIFIED"
  | "FAILED"
  | "MANUAL_REVIEW"
  | "REVOKED";

export type ChallengeTypeValue =
  | "BLINK"
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "LOOK_UP";

export type VerificationStep =
  | "consent"
  | "document"
  | "selfie"
  | "result";
