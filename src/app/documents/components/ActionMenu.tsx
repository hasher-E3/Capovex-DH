'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

import { logDebug } from '@/lib/logger';

import { Menu, MenuItem, Typography } from '@mui/material';

import CreateLink from './CreateLink';
import ShareLinkDialog from './ShareLinkDialog';

import { useToast } from '@/hooks';
import { useModalContext } from '@/providers/modal/ModalProvider';

import { DocumentType } from '@/shared/models';
import { isViewableFileType } from '@/shared/utils';
import { UserRole } from '@/shared/enums';

interface Props {
	open: boolean;
	document: DocumentType;
	onClose: () => void;
	anchorEl: HTMLElement | null;
	onDelete: (documentId: string) => void;
	onAnalytics?: () => void;
}

export default function ActionMenu({
	anchorEl,
	open,
	onClose,
	document,
	onDelete,
	onAnalytics,
}: Props) {
	const { data: session } = useSession();

	// ✅ Investor == Admin
	const isInvestor = session?.user?.role === UserRole.Admin;

	const { openModal } = useModalContext();
	const { showToast } = useToast();

	// Deprecated state (kept as-is)
	const [newLinkUrl, setNewLinkUrl] = useState('');
	const [createLinkOpen, setCreateLinkOpen] = useState(false);

	function DeprecatedhandleCloseCreateLink(action: string, createdLink?: string) {
		setCreateLinkOpen(false);
		if (createdLink) setNewLinkUrl(createdLink);
	}

	const handleOpenCreateLink = () => {
		openModal({
			type: 'linkCreate',
			contentProps: {
				documentId: document.documentId,
				onLinkGenerated: (linkUrl: string) => {
					openModal({
						type: 'linkCopy',
						contentProps: { linkUrl },
					});
				},
			},
		});
		onClose();
	};

	const handleDelete = () => {
		openModal({
			type: 'deleteConfirm',
			contentProps: {
				description:
					'When you delete this file, all the links associated with the file will also be removed. This action is non-reversible.',
				onConfirm: () => {
					onDelete(document.documentId);
				},
			},
		});
	};

	const handleFilePreview = () => {
		openModal({ type: 'fileViewer', contentProps: { document } });
	};

	const canPreview = isViewableFileType(document.fileType);

	return (
		<>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={onClose}
				disableScrollLock
			>
				{/* ❌ Investor should NOT see analytics */}
				{!isInvestor && onAnalytics && (
					<MenuItem onClick={onAnalytics}>View Details</MenuItem>
				)}

				{/* ✅ Everyone can share */}
				<MenuItem onClick={handleOpenCreateLink}>Share</MenuItem>

				{/* ✅ Preview allowed if file type supports it */}
				{canPreview && (
					<MenuItem onClick={handleFilePreview}>Preview</MenuItem>
				)}

				{/* ❌ Investor should NOT see delete */}
				{!isInvestor && (
					<MenuItem onClick={handleDelete}>
						<Typography variant="body1" color="error">
							Delete
						</Typography>
					</MenuItem>
				)}
			</Menu>

			{/* Legacy dialogs (kept untouched) */}
			<CreateLink
				open={createLinkOpen}
				documentId={document.documentId}
				onClose={DeprecatedhandleCloseCreateLink}
			/>

			<ShareLinkDialog
				linkUrl={newLinkUrl}
				onClose={() => setNewLinkUrl('')}
			/>
		</>
	);
}
