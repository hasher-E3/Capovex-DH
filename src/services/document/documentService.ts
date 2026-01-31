import prisma from '@/lib/prisma';
import {
	ServiceError,
	statsService,
	storageService,
	systemSettingService,
} from '@/services';

import {
	SIGNED_URL_TTL,
	STORAGE_BUCKET,
} from '@/shared/config/storageConfig';

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

type GetUserDocumentsOptions = {
	category?: string;
	isAdmin?: boolean;
};

/* -------------------------------------------------------------------------- */
/*  Document Service                                                          */
/* -------------------------------------------------------------------------- */

export const documentService = {
	/**
	 * Retrieves documents for a user.
	 * - Admin: sees ALL documents
	 * - User: sees only their documents
	 * - Optional category filtering for both
	 */
	async getUserDocuments(
		userId: string,
		options?: GetUserDocumentsOptions,
	) {
		const where: any = {};

		// 🔒 Non-admin users see only their documents
		if (!options?.isAdmin) {
			where.userId = userId;
		}

		// 📂 Category filter (Admin + User)
		if (options?.category) {
			where.category = options.category;
		}

		const docs = await prisma.document.findMany({
			where,
			select: {
				documentId: true,
				fileName: true,
				filePath: true,
				fileType: true,
				size: true,
				createdAt: true,
				updatedAt: true,
				user: {
					select: {
						firstName: true,
						lastName: true,
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});

		const statsArray = await Promise.all(
			docs.map((d) =>
				statsService.getQuickStatsForDocument(d.documentId),
			),
		);

		return docs.map((doc, idx) => ({
			documentId: doc.documentId,
			fileName: doc.fileName,
			filePath: doc.filePath,
			fileType: doc.fileType,
			size: doc.size,
			createdAt: doc.createdAt.toISOString(),
			updatedAt: doc.updatedAt.toISOString(),
			uploader: {
				name: `${doc.user.firstName} ${doc.user.lastName}`,
				avatar: null,
			},
			stats: statsArray[idx],
		}));
	},

	/**
	 * Creates a new document record for the given user.
	 */
	async createDocument({
		userId,
		fileName,
		filePath,
		fileType,
		size,
	}: {
		userId: string;
		fileName: string;
		filePath: string;
		fileType: string;
		size: number;
	}) {
		return prisma.document.create({
			data: {
				userId,
				fileName,
				filePath,
				fileType,
				size,
			},
		});
	},

	/**
	 * Fetches a single document by its ID, ensuring it belongs to the user.
	 */
	async getDocumentById(userId: string, documentId: string) {
		const doc = await prisma.document.findFirst({
			where: { documentId, userId },
			select: {
				documentId: true,
				fileName: true,
				filePath: true,
				fileType: true,
				size: true,
				createdAt: true,
				updatedAt: true,
				user: {
					select: {
						firstName: true,
						lastName: true,
					},
				},
			},
		});

		if (!doc) return null;

		const stats = await statsService.getQuickStatsForDocument(documentId);

		return {
			documentId: doc.documentId,
			fileName: doc.fileName,
			filePath: doc.filePath,
			fileType: doc.fileType,
			size: doc.size,
			createdAt: doc.createdAt.toISOString(),
			updatedAt: doc.updatedAt.toISOString(),
			uploader: {
				name: `${doc.user.firstName} ${doc.user.lastName}`,
				avatar: null,
			},
			stats,
		};
	},

	/**
	 * Updates a document's file name if owned by the user.
	 */
	async updateDocument(
		userId: string,
		documentId: string,
		data: { fileName?: string },
	) {
		const existingDoc = await prisma.document.findUnique({
			where: { documentId },
		});

		if (!existingDoc || existingDoc.userId !== userId) {
			return null;
		}

		return prisma.document.update({
			where: { documentId },
			data: {
				fileName: data.fileName ?? existingDoc.fileName,
			},
		});
	},

	/**
	 * Deletes a document and its file from storage if owned by the user.
	 */
	async deleteDocument(userId: string, documentId: string) {
		const document = await prisma.document.findUnique({
			where: { documentId },
		});

		if (!document || document.userId !== userId) {
			return null;
		}

		const deletedDoc = await prisma.document.delete({
			where: { documentId },
		});

		await storageService.deleteFile(deletedDoc.filePath);

		return deletedDoc;
	},

	/**
	 * Retrieves all visitors who accessed any link under this document.
	 */
	async getDocumentVisitors(userId: string, documentId: string) {
		const doc = await prisma.document.findFirst({
			where: { documentId, userId },
			include: { documentLinks: true },
		});

		if (!doc) return null;

		const linkIds = doc.documentLinks.map(
			(l) => l.documentLinkId,
		);

		if (!linkIds.length) return [];

		return prisma.documentLinkVisitor.findMany({
			where: {
				documentLinkId: { in: linkIds },
			},
			orderBy: { updatedAt: 'desc' },
		});
	},

	/**
	 * Verifies document ownership.
	 */
	async verifyOwnership(userId: string, documentId: string): Promise<void> {
		const document = await prisma.document.findFirst({
			where: { documentId, userId },
			select: { documentId: true },
		});

		if (!document) {
			throw new ServiceError(
				'Document not found or access denied.',
				404,
			);
		}
	},

	/**
	 * Generates a signed URL for document owner.
	 */
	async getSignedUrlForOwner(
		userId: string,
		documentId: string,
	): Promise<string> {
		const doc = await prisma.document.findFirst({
			where: { documentId, userId },
			select: { filePath: true },
		});

		if (!doc) {
			throw new ServiceError(
				'Document not found or access denied.',
				404,
			);
		}

		return storageService.generateSignedUrl(
			doc.filePath,
			SIGNED_URL_TTL,
			STORAGE_BUCKET,
		);
	},

	/**
	 * Validates file type and size.
	 */
	async validateUploadFile(file: File) {
		const { maxFileSizeMb, allowedMimeTypes } =
			await systemSettingService.getUploadLimits();

		const whitelist = (allowedMimeTypes ?? []).filter(Boolean);

		if (whitelist.length && !whitelist.includes(file.type)) {
			throw new ServiceError(
				`INVALID_FILE_TYPE: ${file.type} is not allowed`,
				400,
			);
		}

		const fileSizeMB = file.size / (1024 * 1024);
		const limit = maxFileSizeMb ?? 1;

		if (fileSizeMB > limit) {
			throw new ServiceError(
				`FILE_TOO_LARGE: ${fileSizeMB.toFixed(
					2,
				)}MB exceeds limit of ${limit}MB`,
				413,
			);
		}
	},
};
