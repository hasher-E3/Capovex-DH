'use client';

import { useRouter } from 'next/navigation';
import { FormProvider } from 'react-hook-form';
import {
	Box,
	Typography,
	Paper,
	Checkbox,
	Divider,
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';

import { FormInput, LoadingButton, NavLink } from '@/components';
import AuthFormWrapper from '../components/AuthFormWrapper';

import { useAuthQueryToasts, useSignInMutation } from '@/hooks/data';
import { useFormSubmission, useSignInForm } from '@/hooks/forms';
import Image from 'next/image';

export default function SignIn() {
	useAuthQueryToasts();
	const router = useRouter();

	const form = useSignInForm();
	const {
		register,
		formState: { errors, isValid },
	} = form;

	const signInMutation = useSignInMutation();

	const { loading, handleSubmit } = useFormSubmission({
		mutation: signInMutation,
		getVariables: () => form.getValues(),
		validate: () => isValid,
		successMessage: 'Successfully signed in! Redirecting…',
		onSuccess: () => router.push('/documents'),
	});

	return (
		<AuthFormWrapper>
			<Box
				display="flex"
				minHeight="100vh"
				flexDirection={{ xs: 'column', md: 'row' }}
			>
				{/* ================= LEFT PANEL ================= */}
				<Box
					flex={{ md: 5 }}
					px={{ xs: 14, md: 28 }}
					display="flex"
					flexDirection="column"
					justifyContent="center"
				>
					{/* Logo */}
					<Box display="flex" alignItems="center" gap={7} mb={20}>

<Box>
	<Image
		src="/branding/capovex-logo.png"
		alt="Capovex Institutional"
		width={480}
		height={220}
		priority
		style={{ height: 'auto', width: 'auto' }}
	/>
</Box>

					</Box>

					<Typography
						fontSize={84}
						fontWeight={900}
						mb={4}
					>
						DataRoom
					</Typography>

					<Typography
						fontSize={33}
						color="text.secondary"
						mb={18}
					>
						Secure Enterprise Login
					</Typography>

					<Box
						display="inline-flex"
						alignItems="center"
						gap={5}
						px={9}
						py={4.5}
						borderRadius={20}
						border="2px solid"
						borderColor="divider"
						width="fit-content"
					>
						<ShieldIcon color="warning" sx={{ fontSize: 44 }} />
						<Typography
							fontSize={18}
							letterSpacing="0.3em"
							fontWeight={900}
						>
							256-BIT AES ENCRYPTION
						</Typography>
					</Box>

					<Box mt={22}>
						<Typography fontSize={22} color="text.secondary">
							Secure login powered by <b>Data Hall</b>
						</Typography>
					</Box>
				</Box>

				{/* ================= RIGHT PANEL ================= */}
				<Box
					flex={{ md: 6 }}
					display="flex"
					alignItems="center"
					justifyContent="center"
					px={{ xs: 14, md: 28 }}
				>
					<Paper
						elevation={18}
						sx={{
							width: '100%',
							maxWidth: 920,
							p: 14,
							borderRadius: 8,
						}}
					>
						<FormProvider {...form}>
							<Box
								component="form"
								onSubmit={handleSubmit}
								noValidate
								display="flex"
								flexDirection="column"
								gap={10}
							>
								<FormInput
									label="Email Address"
									type="email"
									placeholder="name@company.com"
									{...register('email')}
									errorMessage={errors.email?.message}
								/>

								<FormInput
									label="Password"
									type="password"
									placeholder="••••••••"
									{...register('password')}
									errorMessage={errors.password?.message}
								/>

								<Box
									display="flex"
									justifyContent="space-between"
									alignItems="center"
								>
									<Box display="flex" alignItems="center">
										<Checkbox size="large" />
										<Typography fontSize={26}>
											Remember this device
										</Typography>
									</Box>

									<NavLink
										href="/auth/forgot-password"
										linkText="Forgot password?"
										fontSize={22}
									/>
								</Box>

								<LoadingButton
									type="submit"
									loading={loading}
									disabled={!isValid}
									buttonText="Secure Sign In"
									loadingText="Signing in..."
									sx={{
										py: 4,
										fontSize: 26,
										borderRadius: 6,
										fontWeight: 900,
									}}
								/>

								<Divider sx={{ my: 5 }} />

								<Typography
									textAlign="center"
									fontSize={26}
								>
									Don&apos;t have an account?{' '}
									<NavLink
										href="/auth/sign-up"
										linkText="Sign up"
										display="inline-flex"
										fontWeight={900}
										fontSize={26}
									/>
								</Typography>
							</Box>
						</FormProvider>
					</Paper>
				</Box>
			</Box>
		</AuthFormWrapper>
	);
}
