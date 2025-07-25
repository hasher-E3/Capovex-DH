/* -------------------------------------------------------------------------- *
 * createCustomTheme.ts  –  build a vivid brand theme from a single HEX seed  *
 * -------------------------------------------------------------------------- *
 * Depends on:
 *   • @material/material-color-utilities  (Material-3 CorePalette generator)
 *   • chroma-js                           (contrast helper + alpha fallback)
 *   • src/theme/ds/baseColors.ts          (neutral design-system tokens)
 *   • src/theme/globalTheme.ts            (typography / spacing / neutral overrides)
 * -------------------------------------------------------------------------- */

import { alpha, createTheme, Theme } from '@mui/material';
import { ThemeOptions } from '@mui/material/styles';

import { argbFromHex, CorePalette } from '@material/material-color-utilities';

import globalTheme from '../globalTheme';

import {
	alert as neutralAlert,
	background as neutralBackground,
	border as neutralBorder,
	disabled as neutralDisabled,
	hover as neutralHover,
	text as neutralText,
} from '../ds/baseColors';

import { BgPreset } from '@/shared/config/brandingConfig';
import {
	AlertTokens,
	BackgroundTokens,
	BorderTokens,
	DisabledTokens,
	HoverTokens,
	TextTokens,
} from '../themeTypes';

import { chooseContrast, tone } from './helpers';

/* -------------------------------------------------------------------------- */
/* Public factory                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Generates a complete MUI `Theme` from a single primary hex & background preset.
 */
export function createCustomTheme(primaryHex: string, bgPreset: BgPreset = 'plain'): Theme {
	/* 1 ▸ Material-3 Core palette (a1=primary, a2=secondary, a3=tertiary) */
	const core = CorePalette.of(argbFromHex(primaryHex));

	/* 2 ▸ Map tones into MUI colour groups */
	const primary = {
		main: tone(core.a1, 40),
		light: tone(core.a1, 90),
		dark: tone(core.a1, 20),
		contrastText: chooseContrast(tone(core.a1, 40)),
	};

	const secondary = {
		main: tone(core.a2, 40),
		light: tone(core.a2, 90),
		dark: tone(core.a2, 20),
		contrastText: chooseContrast(tone(core.a2, 40)),
	};

	/** We’ll store “tertiary” inside MUI’s `info` slot to avoid module augmentation */
	const info = {
		main: tone(core.a3, 40),
		light: tone(core.a3, 90),
		dark: tone(core.a3, 20),
		contrastText: chooseContrast(tone(core.a3, 40)),
	};

	const error = {
		main: tone(core.error, 40),
		light: tone(core.error, 90),
		dark: tone(core.error, 20),
		contrastText: chooseContrast(tone(core.error, 40)),
	};

	/* 3 ▸ Clone neutral tokens & inject vivid hues */
	const brandText: TextTokens = { ...neutralText, brand: primary.main };

	const alert: AlertTokens = { ...neutralAlert };
	const disabled: DisabledTokens = { ...neutralDisabled };
	const border: BorderTokens = { ...neutralBorder };

	const brandHover: HoverTokens = {
		...neutralHover,
		primary: alpha(primary.main, 0.08),
		tertiary: alpha(primary.main, 0.04),
		alt: alpha(primary.main, 0.05),
	};

	/* 4 ▸ Background tokens (new mutable object) */
	let brandBg: BackgroundTokens = { ...neutralBackground, paper: neutralBackground.alt };

	if (bgPreset === 'soft') {
		brandBg = { ...brandBg, content: alpha(primary.light!, 0.06) };
	} else if (bgPreset === 'dark') {
		brandBg = {
			...brandBg,
			content: tone(core.n1, 20),
			paper: tone(core.n1, 30),
		};
	}

	/* 5 ▸ Assemble brand-specific overrides */
	const brandOverrides: ThemeOptions = {
		palette: {
			mode: bgPreset === 'dark' ? 'dark' : 'light',
			primary,
			secondary,
			info,
			error,
			background: brandBg,
			text: brandText,
			action: {
				hover: brandHover.primary,
				selected: alpha(primary.main, 0.12),
				disabled: disabled.primary,
				disabledBackground: disabled.secondary,
			},
		},
		text: brandText,
		background: brandBg,
		hover: brandHover,
		alert,
		border,
		disabled,

		components: {
			/* Skeleton shimmer tinted to brand colour */
			MuiSkeleton: {
				styleOverrides: {
					root: ({ theme }) => ({
						backgroundColor: alpha(theme.palette.primary.main, 0.15),
					}),
				},
			},

			/* Accessible focus ring */
			MuiButtonBase: {
				styleOverrides: {
					root: ({ theme }) => ({
						'&:focus-visible': {
							outline: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
							outlineOffset: 2,
						},
					}),
				},
			},

			/* Switch thumb & track */
			MuiSwitch: {
				styleOverrides: {
					switchBase: ({ theme }) => ({
						'&.Mui-checked': {
							color: theme.palette.primary.main,
							'& + .MuiSwitch-track': {
								backgroundColor: alpha(theme.palette.primary.main, 0.6),
							},
						},
					}),
				},
			},

			/* Accordion hover / expanded tint */
			MuiAccordionSummary: {
				styleOverrides: {
					root: ({ theme }) => ({
						'&:hover': {
							backgroundColor: alpha(theme.palette.primary.main, 0.08),
						},
						'&.Mui-expanded': {
							backgroundColor: alpha(theme.palette.primary.main, 0.12),
						},
					}),
				},
			},
		},
	};

	/* 6 ▸ Merge with neutral foundation and return */
	return createTheme(globalTheme, brandOverrides);
}
