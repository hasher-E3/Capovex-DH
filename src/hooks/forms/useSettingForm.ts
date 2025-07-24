/**
 * useSettingForm.ts
 * ---------------------------------------------------------------------------
 * Form-state helper for the **settings** section.
 * Combines:
 *   • Zod schema  – UpdateAccountSettingSchema
 *   • RHF state   – useFormWithSchema
 *   • Initial API data hydration (optional)
 * ---------------------------------------------------------------------------
 */

import { useFormWithSchema } from '@/hooks/forms';
import { UpdateAccountSettingSchema } from '@/shared/validation/settingSchemas';
import { BgPreset, ThemePreset } from '@/shared/config/brandingConfig';
import type { z } from 'zod';
import { UseFormReturn } from 'react-hook-form';

export type UpdateAccountSettingFormValues = z.infer<typeof UpdateAccountSettingSchema> & {
	logo?: File;
};

/**
 * @param initial  – Optional API payload `{ primaryColor, themePreset, bgPreset, showPersonalInfo, displayName, logo }`
 *                   Passed when settings data has loaded to prime defaults.
 */
export function useSettingForm(
	initial?: Partial<UpdateAccountSettingFormValues>,
	mode: 'onBlur' | 'onChange' | 'onSubmit' = 'onBlur',
): UseFormReturn<UpdateAccountSettingFormValues> & {
	buildPayload: () => Omit<UpdateAccountSettingFormValues, 'logo'>;
} {
	/* Build default values by merging Zod-generated defaults with API data */
	const defaults: UpdateAccountSettingFormValues = {
		primaryColor: '#3f51b5',
		themePreset: null as ThemePreset | null,
		bgPreset: 'white' as BgPreset,
		showPersonalInfo: false,
		displayName: '',
		logo: undefined,
		...initial, // initial data from server overwrites blanks
	};
	const form = useFormWithSchema(UpdateAccountSettingSchema, defaults, mode);

	const buildPayload = (): Omit<UpdateAccountSettingFormValues, 'logo'> => {
		// remove undefined OR empty-string values
		const { logo, ...rest } = form.getValues() as UpdateAccountSettingFormValues;

		return Object.fromEntries(
			Object.entries(rest).filter(([, v]) => v !== undefined && v !== ''),
		) as Omit<UpdateAccountSettingFormValues, 'logo'>;
	};

	return { ...form, buildPayload };
}
