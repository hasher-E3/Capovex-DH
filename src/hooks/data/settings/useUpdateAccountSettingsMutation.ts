import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import { queryKeys } from '@/shared/queryKeys';
import { AccountSetting, AccountSettingResponse } from '@/shared/models';

export default function useUpdateAccountSettingsMutation() {
	const queryClient = useQueryClient();

	return useMutation<AccountSetting, Error, FormData>({
		mutationFn: async (formData) => {
			const { data } = await axios.patch<AccountSettingResponse>(
				'/api/settings/branding',
				formData,
			);
			return data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.settings.branding.base,
			});
		},
	});
}
