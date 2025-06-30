import { systemSettingService } from '@/services';

/**
 * Returns a standardized log prefix.
 * @param level - The log level.
 */
function stamp(level: string) {
	return `[Datahall][${level}]`;
}

/**
 * Logs a debug message if debugLogs is enabled in system settings.
 * @param args - Arguments to log.
 */
export async function logDebug(...args: any[]): Promise<void> {
	try {
		const { debugLogs } = await systemSettingService.getSystemSettings();
		if (debugLogs) console.debug(stamp('DEBUG'), ...args);
	} catch {
		// Ignore errors to avoid crashing during bootstrap
	}
}

/**
 * Logs an info message.
 * @param args - Arguments to log.
 */
export function logInfo(...args: any[]): void {
	console.info(stamp('INFO'), ...args);
}

/**
 * Logs a warning message.
 * @param args - Arguments to log.
 */
export function logWarn(...args: any[]): void {
	console.warn(stamp('WARN'), ...args);
}

/**
 * Logs an error message.
 * @param args - Arguments to log.
 */
export function logError(...args: any[]): void {
	console.error(stamp('ERROR'), ...args);
}
