import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { AccountSetting, AccountSettingResponse } from '@/shared/models';
import { queryKeys } from '@/shared/queryKeys';

export default function useAccountSettingsQuery() {
	return useQuery<AccountSettingResponse, Error, AccountSetting>({
		queryKey: queryKeys.settings.branding.base,
		queryFn: async () => (await axios.get<AccountSettingResponse>('/api/settings/branding')).data,
		select: (resp) => resp.data,
		staleTime: 5 * 60 * 1_000,
	});
}
