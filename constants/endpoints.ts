// API base (strict spec)
export const API_ORIGIN =
  process.env.EXPO_PUBLIC_API_ORIGIN ?? "https://dev.bhcjobs.com";

// Storage base (strict spec — latest worked example uses dev.bhcjobs.com)
export const STORAGE_BASE_ORIGIN =
  process.env.EXPO_PUBLIC_STORAGE_BASE_ORIGIN ??
  "https://dev.bhcjobs.com/storage";

// Folder-aware image bases
export const COMPANY_IMAGE_BASE = `${STORAGE_BASE_ORIGIN}/company-image/`;
export const INDUSTRY_IMAGE_BASE = `${STORAGE_BASE_ORIGIN}/industry-image/`;
