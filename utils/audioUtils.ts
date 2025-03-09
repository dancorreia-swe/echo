/**
 * Normalizes audio metering values to a 0-1 scale
 * @param metering Raw metering value (typically -160 to 0)
 * @returns Normalized value between 0 and 1
 */
export function normalizeAudioLevel(metering: number | undefined): number {
  if (metering === undefined || metering <= -160) {
    return 0;
  }

  // Convert from range [-160, 0] to [0, 1]
  return Math.max(0, (metering + 160) / 160);
}

/**
 * Formats seconds into MM:SS display format
 * @param seconds Total seconds to format
 * @returns Formatted time string (MM:SS)
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
