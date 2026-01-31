import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import { DocumentType } from '@/shared/models';
import { queryKeys } from '@/shared/queryKeys';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface DocumentResponse {
	documents: DocumentType[];
}

type UseDocumentsQueryParams = {
	category?: string;
};

/* -------------------------------------------------------------------------- */
/*  Fetcher                                                                   */
/* -------------------------------------------------------------------------- */

const fetchDocuments = async (
	params?: UseDocumentsQueryParams,
): Promise<DocumentResponse> => {
	const response = await axios.get('/api/documents', {
		params: {
			category: params?.category,
		},
	});

	return response.data;
};

/* -------------------------------------------------------------------------- */
/*  Hook                                                                      */
/* -------------------------------------------------------------------------- */

const useDocumentsQuery = (params?: UseDocumentsQueryParams) => {
	return useQuery({
		// 🔑 category-aware cache
		queryKey: [...queryKeys.documents.all, params?.category],
		queryFn: () => fetchDocuments(params),
	});
};

export default useDocumentsQuery;
