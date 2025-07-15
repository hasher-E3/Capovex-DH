import { z } from 'zod';
import { THEME_PRESETS, BG_PRESETS, BgPreset, ThemePreset } from '@/shared/config/brandingConfig';
import {
	AccountSetting,
	SystemSettingDTO,
	SystemSettingsUpdatePayload,
	TestEmailPayload,
	UpdateAccountSettingPayload,
} from '@/shared/models';

const ThemeEnum = z.enum([...THEME_PRESETS] as [ThemePreset, ...ThemePreset[]]);
const BgEnum = z.enum([...BG_PRESETS] as [BgPreset, ...BgPreset[]]);

const MIN_BREVO_LEN = 30; // observed length ~48 chars, allow some slack
const MIN_TTL = 60; // 1 minute
const MAX_TTL = 31_556_952; // 1 year in seconds
const MIN_MB = 1;
const MAX_MB = 50;

/* ------------------ PATCH /api/settings/branding ------------------ */
export const UpdateAccountSettingSchema: z.ZodType<UpdateAccountSettingPayload> = z.object({
	primaryColor: z
		.string()
		.regex(/^#?([0-9a-fA-F]{3}){1,2}$/, 'Invalid HEX colour')
		.optional(),
	themePreset: ThemeEnum.nullable().optional(),
	bgPreset: BgEnum.optional(),
	showPersonalInfo: z.boolean().optional(),
	displayName: z.string().max(40).nullable().optional(),
	/* logo image handled via multipart file; not present in JSON body */
});

/* ------------------ GET /api/settings/branding ------------------- */
export const AccountSettingSchema: z.ZodType<AccountSetting> = z.object({
	userId: z.string(),
	logoUrl: z.string().nullable(),
	primaryColor: z.string(),
	themePreset: ThemeEnum.nullable(),
	bgPreset: BgEnum,
	showPersonalInfo: z.boolean(),
	displayName: z.string().nullable(),
	updatedAt: z.string(),
	createdAt: z.string(),
});

/* ------------------ PATCH /api/settings/system  ------------------ */

export const SystemSettingsUpdateSchema: z.ZodType<SystemSettingsUpdatePayload> = z
	.object({
		enableNotifications: z.boolean().optional(),

		brevoApiKey: z.string().min(MIN_BREVO_LEN).optional(),
		emailFromName: z.string().min(2).max(40).optional(),
		emailFromAddr: z.string().email().optional(),

		defaultTtlSeconds: z.number().int().min(MIN_TTL).max(MAX_TTL).optional(),
		debugLogs: z.boolean().optional(),

		maxFileSizeMb: z.number().int().min(MIN_MB).max(MAX_MB).nullable().optional(),
		allowedMimeTypes: z.string().nullable().optional(), // CSV
	})
	.superRefine((data, ctx) => {
		// If notifications are turned ON, require all email credentials
		if (data.enableNotifications) {
			if (!data.brevoApiKey) ctx.addIssue({ code: 'custom', message: 'brevoApiKey required' });
			if (!data.emailFromName) ctx.addIssue({ code: 'custom', message: 'emailFromName required' });
			if (!data.emailFromAddr) ctx.addIssue({ code: 'custom', message: 'emailFromAddr required' });
		}
	});

/* ------------------ GET /api/settings/system ------------------- */

export const SystemSettingSchema: z.ZodType<SystemSettingDTO> = z.object({
	enableNotifications: z.boolean(),
	emailFromName: z.string().nullable(),
	emailFromAddr: z.string().nullable(),
	defaultTtlSeconds: z.number().int(),
	maxFileSizeMb: z.number().int().nullable(),
	allowedMimeTypes: z.string().nullable(),
	debugLogs: z.boolean(),
	updatedAt: z.string(), // ISO
});

/* ------------------ POST /api/settings/system/test-email ------------------- */

export const TestEmailSchema: z.ZodType<TestEmailPayload> = z.object({
	to: z.string().email(),
});
