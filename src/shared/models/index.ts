/**
 * Barrel file for shared model types.
 *
 * Exports all public model types used across client, API routes, and backend services.
 * This ensures a single source of truth for data contracts and DTOs throughout the application.
 */

// Auth models and types
export * from './authModels';
export type {
	ChangeNameRequest,
	ChangeNameResponse,
	ChangePasswordRequest,
	ChangePasswordResponse,
	ForgotPasswordRequest,
	ForgotPasswordResponse,
	ResetPasswordRequest,
	ResetPasswordResponse,
	SignInRequest,
	SignInResponse,
	SignUpRequest,
	SignUpResponse,
	VerifyUserRequest,
	VerifyUserResponse,
} from './authModels';

// Document models and types
export * from './documentModels';
export type { DocumentType } from './documentModels';

// Link models and types
export * from './linkModels';
export type {
	PublicLinkFilePayload,
	LinkDetailRow,
	PublicLinkMetaResponse,
	PublicLinkMeta,
	Contact,
	LinkVisitor,
	LinkAccessState,
} from './linkModels';

// Profile models and types
export * from './profileModels';
export type {
	ProfileDto,
	UpdateNameRequest,
	UpdateNameResponse,
	UpdatePasswordRequest,
	UpdatePasswordResponse,
} from './profileModels';

// Analytics models and types
export * from './analyticsModels';
export type {
	ANALYTICS_PERIODS,
	AnalyticsBucket,
	AnalyticsEvent,
	AnalyticsPeriod,
	AnalyticsSummary,
	DocumentLinkStat,
	PERIOD_OPTIONS,
} from './analyticsModels';

// Settings models and types
export * from './settingsModels';
export type {
	AccountSetting,
	UpdateAccountSettingPayload,
	TestEmailPayload,
	SystemSettingsUpdatePayload,
	SystemSettingDTO,
} from './settingsModels';
