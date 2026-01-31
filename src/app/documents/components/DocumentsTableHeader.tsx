'use client';

import { TableCell, TableRow, TableSortLabel } from '@mui/material';
import { useSession } from 'next-auth/react';

import { DocumentType } from '@/shared/models';
import { UserRole } from '@/shared/enums';

import {
	ChevronDownIcon,
	ChevronSelectorVerticalIcon,
} from '@/icons';

interface Props {
	orderBy: keyof DocumentType | undefined;
	orderDirection: 'asc' | 'desc' | undefined;
	onSort: (property: keyof DocumentType) => void;
}

const DocumentsTableHeader = ({
	orderBy,
	orderDirection,
	onSort,
}: Props) => {
	const { data: session } = useSession();

	// ✅ Investor == Admin
	const isInvestor = session?.user?.role === UserRole.Admin;

	return (
		<TableRow>
			<TableCell sx={{ width: '5%' }} />

			<TableCell sx={{ width: '40%' }}>
				DOCUMENT
			</TableCell>

			<TableCell sx={{ width: '20%' }}>
				<TableSortLabel
					active={orderBy === 'uploader'}
					direction={orderDirection}
					onClick={() => onSort('uploader')}
					hideSortIcon={false}
					IconComponent={
						orderDirection === undefined
							? ChevronSelectorVerticalIcon
							: ChevronDownIcon
					}
				>
					UPLOADER
				</TableSortLabel>
			</TableCell>

			{/* ❌ Hide analytics for Investor */}
			{!isInvestor && (
				<TableCell sx={{ width: '15%', textAlign: 'center' }}>
					ANALYTICS
				</TableCell>
			)}

			<TableCell sx={{ width: '10%', textAlign: 'center' }}>
				LINK
			</TableCell>

			<TableCell sx={{ width: '10%', textAlign: 'center' }}>
				ACTION
			</TableCell>
		</TableRow>
	);
};

export default DocumentsTableHeader;
