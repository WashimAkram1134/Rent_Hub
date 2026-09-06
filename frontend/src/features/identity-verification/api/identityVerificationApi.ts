/**
 * RentHub — Identity Verification API Client
 */

import apiClient from "@/lib/axios";

export interface VerificationStatus {
  status: string;
  attempt_count: number;
  document_type: string | null;
  document_number_masked: string | null;
  face_match_score: number | null;
  liveness_score: number | null;
  consent_given: boolean;
  verified_at: string | null;
  message: string;
}

export interface ChallengeInfo {
  challenge_type: string;
  instruction: string;
}

export interface DocumentUploadResult {
  status: string;
  face_detected: boolean;
  quality: string | null;
  error: string | null;
  next_step: string | null;
}

export interface SelfieUploadResult {
  status: string;
  liveness_passed: boolean;
  error: string | null;
  next_step: string | null;
}

export interface CompleteResult {
  status: string;
  face_match_score: number | null;
  liveness_score: number | null;
  verified_at: string | null;
  attempt_count: number;
  message: string;
}

const BASE = "/identity-verification";

export const identityVerificationApi = {
  /** Start or resume a verification session */
  start: async () => {
    const res = await apiClient.post(`${BASE}/start`);
    return res.data;
  },

  /** Get current status */
  getStatus: async (): Promise<VerificationStatus> => {
    const res = await apiClient.get(`${BASE}/status`);
    return res.data;
  },

  /** Get a liveness challenge */
  getChallenge: async (): Promise<ChallengeInfo> => {
    const res = await apiClient.get(`${BASE}/challenge`);
    return res.data;
  },

  /** Record consent */
  recordConsent: async () => {
    const res = await apiClient.post(`${BASE}/consent`);
    return res.data;
  },

  /** Upload NID document image */
  uploadDocument: async (file: File): Promise<DocumentUploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await apiClient.post(`${BASE}/document`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /** Submit selfie + liveness result */
  uploadSelfie: async (
    blob: Blob,
    challengeType: string,
    challengeCompleted: boolean
  ): Promise<SelfieUploadResult> => {
    const formData = new FormData();
    formData.append("file", blob, "selfie.jpg");
    formData.append("challenge_type", challengeType);
    formData.append("challenge_completed", String(challengeCompleted));
    const res = await apiClient.post(`${BASE}/selfie`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /** Complete verification (face matching) */
  complete: async (): Promise<CompleteResult> => {
    const res = await apiClient.post(`${BASE}/complete`);
    return res.data;
  },
};

// ── Admin API ──────────────────────────────────────────────────────────────

export const adminIdentityApi = {
  list: async (statusFilter?: string, skip = 0, limit = 20) => {
    const params = new URLSearchParams({ skip: String(skip), limit: String(limit) });
    if (statusFilter) params.append("status", statusFilter);
    const res = await apiClient.get(`/admin/identity-verifications?${params}`);
    return res.data;
  },

  getById: async (id: string) => {
    const res = await apiClient.get(`/admin/identity-verifications/${id}`);
    return res.data;
  },

  review: async (id: string, action: string, notes?: string) => {
    const res = await apiClient.patch(`/admin/identity-verifications/${id}/review`, {
      action,
      notes,
    });
    return res.data;
  },
};
