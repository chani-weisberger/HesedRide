import { Platform } from 'react-native';

const KEY = 'rider_form_draft';

export type RideDraft = {
  passenger_count?: number;
  patient_name?: string;
  patient_phone?: string;
};

/**
 * saveRideDraft executes its corresponding UI or business operation.
 */
export function saveRideDraft(data: RideDraft) {
  if (Platform.OS !== 'web') return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
}

/**
 * loadRideDraft executes its corresponding UI or business operation.
 */
export function loadRideDraft(): RideDraft | null {
  if (Platform.OS !== 'web') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * clearRideDraft executes its corresponding UI or business operation.
 */
export function clearRideDraft() {
  if (Platform.OS !== 'web') return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}