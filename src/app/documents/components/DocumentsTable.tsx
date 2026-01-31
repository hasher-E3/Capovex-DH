'use client';

import {
	Box,
	CircularProgress,
	Paper,
	Table,
	TableBody,
	TableContainer,
	TableHead,
	Typography,
} from '@mui/material';

import { useSearchParams } from 'next/navigation';

import DocumentsTableHeader from './DocumentsTableHeader';
import DocumentsTableRow from './DocumentsTableRow';

import { Paginator } from '@/components';
import { usePaginatedTable, useResponsivePageSize, useToast } from '@/hooks';
import { useDeleteDocumentMutation, useDocumentsQuery } from '@/hooks/data';

import { DocumentType } from '@/shared/models';

const DocumentsTable = () => {
	const { showToast } = useToast();
	const searchParams = useSearchParams();

	const category = searchParams.get('category') ?? undefined;

	const { data, error, isLoading } = useDocumentsQuery({ category });
	const allDocs = data?.documents ?? [];

	const { mutate: deleteDocument } = useDeleteDocumentMutation();

	const {
		pageData,
		page,
		totalPages,
		setPage,
		pageSize,
		setPageSize,
		sortKey,
		sortDirection,
		toggleSort,
	} = usePaginatedTable<DocumentType>(allDocs, {
		initialSort: 'createdAt',
		pageSize: 4,
	});

	useResponsivePageSize(setPageSize, { offsetHeight: 500 });

	if (isLoading) {
		return (
			<Box display="flex" justifyContent="center" minHeight="50vh">
				<CircularProgress />
			</Box>
		);
	}

	if (error) {
		return (
			<Box display="flex" justifyContent="center" minHeight="50vh">
				<Typography color="error">{error.message}</Typography>
			</Box>
		);
	}

	return (
		<Box display="flex" flexDirection="column" flexGrow={1}>
			<TableContainer component={Paper}>
				<Table>
					<TableHead>
						<DocumentsTableHeader
							orderBy={sortKey}
							orderDirection={sortDirection}
							onSort={toggleSort}
						/>
					</TableHead>
					<TableBody>
						{pageData.map((document, index) => (
							<DocumentsTableRow
								key={index}
								document={document}
								onDelete={(id) =>
									deleteDocument(id, {
										onSuccess: () =>
											showToast({
												message: 'Document deleted successfully',
												variant: 'success',
											}),
									})
								}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>

			{totalPages > 1 && (
				<Paginator
					nextPage={page}
					totalPages={totalPages}
					onPageChange={setPage}
					pageSize={pageSize}
					totalItems={allDocs.length}
				/>
			)}
		</Box>
	);
};

export default DocumentsTable;
