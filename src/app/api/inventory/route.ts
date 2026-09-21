import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);

    const [assets, inventoryItems] = await Promise.all([
      prisma.madrasaAsset.findMany({
        where: { institutionId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.inventoryItem.findMany({
        where: { institutionId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalAssetValue = assets.reduce((acc, a) => acc + a.estimatedCost * a.quantity, 0);

    return NextResponse.json({
      success: true,
      assets,
      inventoryItems,
      stats: {
        totalAssetItems: assets.reduce((acc, a) => acc + a.quantity, 0),
        totalAssetValue,
        totalConsumableTypes: inventoryItems.length,
      },
    });
  } catch (error: any) {
    console.error("Inventory GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load inventory data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const { action } = body;

    if (action === "ADD_ASSET") {
      const { name, category, quantity, location, condition, purchaseDate, estimatedCost } = body;
      const asset = await prisma.madrasaAsset.create({
        data: {
          institutionId,
          name,
          category: category || "GENERAL",
          quantity: Number(quantity) || 1,
          location,
          condition: condition || "GOOD",
          purchaseDate: purchaseDate || new Date().toISOString().split("T")[0],
          estimatedCost: Number(estimatedCost) || 0,
        },
      });
      return NextResponse.json({ success: true, asset });
    }

    if (action === "ADD_ITEM") {
      const { name, category, unit, currentStock, reorderLevel } = body;
      const item = await prisma.inventoryItem.create({
        data: {
          institutionId,
          name,
          category: category || "STATIONERY",
          unit: unit || "পিস",
          currentStock: Number(currentStock) || 0,
          reorderLevel: Number(reorderLevel) || 5,
        },
      });
      return NextResponse.json({ success: true, item });
    }

    if (action === "UPDATE_STOCK") {
      const { itemId, currentStock } = body;
      const updated = await prisma.inventoryItem.update({
        where: { id: itemId },
        data: { currentStock: Number(currentStock) },
      });
      return NextResponse.json({ success: true, item: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Inventory POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save inventory record" },
      { status: 500 }
    );
  }
}
