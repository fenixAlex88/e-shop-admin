import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { storeId: string } }) {
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
            return new NextResponse("Store ID is required", { status: 400 });
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

        const product = await prismadb.product.create({
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
                    createMany: {
                        data: [...images].map((img: { url: string }) => img),
                    },
                },
            },
        });
        return NextResponse.json(product);
    } catch (error) {
        console.log("[PRODUCTS_POST] ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
    try {
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoryId") || undefined;
        const colorId = searchParams.get("colorId") || undefined;
        const sizeId = searchParams.get("sizeId") || undefined;
        const isFeatured = searchParams.get("isFeatured");

        if (!params.storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }
        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                colorId,
                sizeId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false,
            },
            include: {
                images: true,
                category: true,
                color: true,
                size: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.log("[PRODUCTS_GET] ", error);
        return new NextResponse("Internal error", { status: 500 });
    }
}
