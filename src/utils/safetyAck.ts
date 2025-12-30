import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'safety_ack_v1';
const ACK_VALIDITY_DAYS = 30;

type AcknowledgmentRecord = {
  programId: string;
  timestamp: number; // Unix timestamp in milliseconds
};

/**
 * Check if user has acknowledged safety notes for a program within the last 30 days
 */
export async function hasSafetyAcknowledgment(programId: string): Promise<boolean> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    const records: AcknowledgmentRecord[] = JSON.parse(stored);
    const now = Date.now();
    const validityMs = ACK_VALIDITY_DAYS * 24 * 60 * 60 * 1000;

    // Find record for this program
    const record = records.find((r) => r.programId === programId);
    if (!record) return false;

    // Check if still valid (within 30 days)
    const isValid = now - record.timestamp < validityMs;
    return isValid;
  } catch (error) {
    console.error('Failed to check safety acknowledgment:', error);
    return false;
  }
}

/**
 * Save safety acknowledgment for a program
 */
export async function saveSafetyAcknowledgment(programId: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    let records: AcknowledgmentRecord[] = stored ? JSON.parse(stored) : [];

    // Remove old record for this program if exists
    records = records.filter((r) => r.programId !== programId);

    // Add new record
    records.push({
      programId,
      timestamp: Date.now(),
    });

    // Clean up expired records (older than 30 days)
    const now = Date.now();
    const validityMs = ACK_VALIDITY_DAYS * 24 * 60 * 60 * 1000;
    records = records.filter((r) => now - r.timestamp < validityMs);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save safety acknowledgment:', error);
    throw error;
  }
}

/**
 * Clear all acknowledgments (useful for testing or reset)
 */
export async function clearAllAcknowledgments(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear acknowledgments:', error);
  }
}
