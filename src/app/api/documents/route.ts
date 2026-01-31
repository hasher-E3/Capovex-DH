import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { createErrorResponse, documentService, storageService } from '@/services';
import { authOptions } from '@/lib/authOptions';
import { UserRole } from '@/shared/enums';

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.userId) {
			return createErrorResponse('Unauthorized', 401);
		}

		const { searchParams } = new URL(req.url);
		const category = searchParams.get('category') ?? undefined;

		const documents = await documentService.getUserDocuments(
			session.user.userId,
			{
				category,
				isAdmin: session.user.role === UserRole.Admin,
			},
		);

		return NextResponse.json({ documents }, { status: 200 });
	} catch (error) {
		return createErrorResponse(
			'Server error while fetching documents',
			500,
			error,
		);
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);

		if (!session?.user?.userId) {
			return createErrorResponse('Unauthorized', 401);
		}

		const userId = session.user.userId;

		const formData = await req.formData();
		const file = formData.get('file');

		if (!(file instanceof File) || !file.name) {
			return createErrorResponse('Invalid file type or missing file', 400);
		}

		await documentService.validateUploadFile(file);

		const buffer = Buffer.from(await file.arrayBuffer());

		const uploadResult = await storageService.uploadFile(buffer, {
			userId,
			fileName: file.name,
			fileType: file.type,
		});

		if (!uploadResult) {
			return createErrorResponse('File upload failed', 500);
		}

		const document = await documentService.createDocument({
			userId,
			fileName: file.name,
			filePath: uploadResult,
			fileType: file.type,
			size: file.size,
		});

		return NextResponse.json({ document }, { status: 200 });
	} catch (error) {
		return createErrorResponse(
			'Server error while uploading document',
			500,
			error,
		);
	}
}
