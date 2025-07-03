import { ThemePreset, BgPreset } from '@/shared/config/brandingConfig';

/**
 * Row returned by GET /api/settings (mirrors DB).
 */
export interface AccountSetting {
	userId: string;
	logoUrl: string | null;
	primaryColor: string;
	themePreset: ThemePreset | null;
	bgPreset: BgPreset;
	showPersonalInfo: boolean;
	displayName: string | null;
	updatedAt: string; // ISO
	createdAt: string; // ISO
}

/**
 * Payload accepted by PATCH /api/settings.
 */
export interface UpdateAccountSettingPayload {
	primaryColor?: string;
	themePreset?: ThemePreset | null;
	bgPreset?: BgPreset;
	showPersonalInfo?: boolean;
	displayName?: string | null;
	/** sent as multipart/form-data under field name “logo” */
}

/**
 * Row returned by GET /api/settings/system (mirrors DB).
 */
export interface SystemSettingDTO {
	enableNotifications: boolean;
	emailFromName: string | null;
	emailFromAddr: string | null;
	defaultTtlSeconds: number;
	maxFileSizeMb: number | null;
	allowedMimeTypes: string | null;
	debugLogs: boolean;
	updatedAt: string; // ISO
}

/**
 * Payload accepted by POST /api/settings/system.
 */
export type SystemSettingsUpdatePayload = {
	enableNotifications?: boolean;
	brevoApiKey?: string;
	emailFromName?: string;
	emailFromAddr?: string;
	defaultTtlSeconds?: number;
	debugLogs?: boolean;
	maxFileSizeMb?: number | null;
	allowedMimeTypes?: string | null; // CSV
};

/**
 * Payload for sending a test e-mail.
 */
export interface TestEmailPayload {
	to: string;
}
