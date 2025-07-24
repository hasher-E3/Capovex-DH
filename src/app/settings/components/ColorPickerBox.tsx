import { useState } from 'react';
import { SketchPicker } from 'react-color';

import { Box, Dialog, IconButton } from '@mui/material';

import { convertTransparencyToHex } from '@/shared/utils';
import { UpdateAccountSettingFormValues } from '@/hooks/forms';
import { useFormContext } from 'react-hook-form';
import { FormInput } from '@/components';

export default function ColorPickerBox() {
	const [showPicker, setShowPicker] = useState(false);

	const { setValue, watch, register } = useFormContext<UpdateAccountSettingFormValues>();

	const primaryColor = watch('primaryColor') ?? '#3f51b5';

	const handleColorChange = (newColor: any) => {
		//Concat the 2-digit hex as a transparency number to newColor.hex
		const transparentColor = newColor.hex.concat(convertTransparencyToHex(newColor.rgb.a));
		setValue('primaryColor', transparentColor, { shouldDirty: true });
	};

	//Open and close a color picker
	const togglePicker = () => {
		setShowPicker(!showPicker);
	};

	return (
		<Box
			border={1}
			borderColor='text.notes'
			borderRadius={2}
			width={150}
			p={3}
			display='flex'
			alignItems='center'>
			<IconButton
				sx={{
					bgcolor: primaryColor,
					border: 1,
					borderRadius: 2,
					p: 5,
					'&:hover': {
						bgcolor: primaryColor,
					},
				}}
				onClick={togglePicker}></IconButton>
			<FormInput
				minWidth={120}
				fullWidth={false}
				{...register('primaryColor')}
				value={primaryColor}
				sx={{
					'& .MuiInputBase-input': { py: 0 },
					'& .MuiOutlinedInput-root': {
						'& fieldset': {
							border: 'none',
						},
					},
				}}
			/>
			<Dialog
				onClose={togglePicker}
				open={showPicker}
				sx={{
					'& .MuiPaper-root': {
						minWidth: 200,
					},
				}}>
				<SketchPicker
					color={primaryColor}
					onChange={handleColorChange}
				/>
			</Dialog>
		</Box>
	);
}
