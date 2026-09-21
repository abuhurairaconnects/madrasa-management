import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";
import { cacheDel } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const institution =
      (await prisma.institution.findUnique({
        where: { id: institutionId },
      })) || (await prisma.institution.findFirst());

    return NextResponse.json({ institution });
  } catch (error) {
    console.error("Institution GET error:", error);
    return NextResponse.json({ error: "Failed to fetch institution" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();

    const existing =
      (await prisma.institution.findUnique({
        where: { id: institutionId },
      })) || (await prisma.institution.findFirst());

    if (existing) {
      const updated = await prisma.institution.update({
        where: { id: existing.id },
        data: {
          nameBn: body.nameBn,
          nameEn: body.nameEn,
          arabicName: body.arabicName || null,
          address: body.address,
          phone: body.phone,
          email: body.email || null,
          muhtamimName: body.muhtamimName || null,
          establishedYear: body.establishedYear || null,
          receiptFooter: body.receiptFooter || null,
        },
      });

      await cacheDel(`institution:${existing.id}:dashboard`);
      await cacheDel("superadmin:overview");

      return NextResponse.json(updated);
    } else {
      const created = await prisma.institution.create({
        data: {
          code: body.code || "JAMIA-01",
          nameBn: body.nameBn,
          nameEn: body.nameEn,
          address: body.address,
          phone: body.phone,
        },
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Institution PUT error:", error);
    return NextResponse.json({ error: "Failed to update institution" }, { status: 500 });
  }
}
