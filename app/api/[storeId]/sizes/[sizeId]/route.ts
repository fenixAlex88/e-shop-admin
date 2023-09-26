import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string; sizeId: string } },
) {
    try {
        const { userId } = auth();
        const { name, value } = await req.json();
        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }
        if (!name) {
            return new NextResponse("Size name is required", { status: 400 });
        }
        if (!value) {
            return new NextResponse("Size value is required", { status: 400 });
        }
        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }
        if (!params.sizeId) {
            return new NextResponse("Size id is required", { status: 400 });
        }
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });
        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const size = await prismadb.size.update({
            where: {
                id: params.sizeId,
            },
            data: {
                name,
                value,
            },
        });
        return NextResponse.json(size);
    } catch (error) {
        console.log("[SIZE_PATCH] ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: { storeId: string; sizeId: string } },
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }
        if (!params.sizeId) {
            return new NextResponse("Size id is required", { status: 400 });
        }
        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId,
            },
        });
        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }
        const size = await prismadb.size.delete({
            where: {
                id: params.sizeId,
            },
        });
        return NextResponse.json(size);
    } catch (error) {
        console.log("[SIZE_DELETE] ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(_req: Request, { params }: { params: { sizeId: string } }) {
    try {
        if (!params.sizeId) {
            return new NextResponse("Size id is required", { status: 400 });
        }
        const size = await prismadb.category.findUnique({
            where: {
                id: params.sizeId,
            },
        });
        return NextResponse.json(size);
    } catch (error) {
        console.log("[SIZE_GET] ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
