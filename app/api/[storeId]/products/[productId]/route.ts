import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string; productId: string } },
) {
    try {
        const { userId } = auth();
        const { name, price, categoryId, sizeId, colorId, images, isFeatured, isArchived } =
            await req.json();
        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }
        if (!name) {
            return new NextResponse("Product name is required", { status: 400 });
        }
        if (!price) {
            return new NextResponse("Product prace is required", { status: 400 });
        }
        if (!categoryId) {
            return new NextResponse("Product category id is required", { status: 400 });
        }
        if (!sizeId) {
            return new NextResponse("Product size id is required", { status: 400 });
        }
        if (!colorId) {
            return new NextResponse("Product color id is required", { status: 400 });
        }
        if (!images || !images.length) {
            return new NextResponse("Product images are required", { status: 400 });
        }
        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }
        if (!params.productId) {
            return new NextResponse("Product id is required", { status: 400 });
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

        await prismadb.product.update({
            where: {
                id: params.productId,
            },
            data: {
                name,
                price,
                isFeatured,
                isArchived,
                categoryId,
                sizeId,
                colorId,
                storeId: params.storeId,
                images: {
                    deleteMany: {},
                },
            },
        });
        const product = await prismadb.product.update({
            where: {
                id: params.productId,
            },
            data: {
                images: {
                    createMany: {
                        data: [...images].map((img: { url: string }) => img),
                    },
                },
            },
        });
        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_PATCH] ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: { storeId: string; productId: string } },
) {
    try {
        const { userId } = auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        if (!params.storeId) {
            return new NextResponse("Store id is required", { status: 400 });
        }
        if (!params.productId) {
            return new NextResponse("Product id is required", { status: 400 });
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
        const product = await prismadb.product.delete({
            where: {
                id: params.productId,
            },
        });
        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_DELETE] ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(_req: Request, { params }: { params: { productId: string } }) {
    try {
        if (!params.productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }
        const product = await prismadb.product.findUnique({
            where: {
                id: params.productId,
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true,
            },
        });
        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCT_GET] ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
