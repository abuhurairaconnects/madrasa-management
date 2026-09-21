import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheGet, cacheSet } from "@/lib/redis";

export async function GET() {
  try {
    const cacheKey = "superadmin:overview";
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, cached: true });
    }

    const institutions = await prisma.institution.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            students: { where: { status: "ACTIVE" } },
            users: true,
            invoices: true,
            smsLogs: true,
          },
        },
      },
    });

    const totalInstitutions = institutions.length;
    const activeInstitutions = institutions.filter((i) => i.subscriptionStatus === "ACTIVE").length;
    
    let totalStudents = 0;
    let totalSmsBalance = 0;
    let totalStorageBytes = 0;

    const formattedInstitutions = institutions.map((inst) => {
      const studentCount = inst._count.students;
      totalStudents += studentCount;
      totalSmsBalance += inst.smsBalance;
      totalStorageBytes += inst.storageUsedBytes;

      return {
        id: inst.id,
        code: inst.code,
        nameBn: inst.nameBn,
        nameEn: inst.nameEn,
        phone: inst.phone,
        muhtamimName: inst.muhtamimName,
        studentCount,
        studentLimit: inst.studentLimit,
        smsBalance: inst.smsBalance,
        storageUsedMb: Math.round(inst.storageUsedBytes / (1024 * 1024)),
        subscriptionStatus: inst.subscriptionStatus,
        subscriptionPlan: inst.subscriptionPlan,
        subscriptionExpiresAt: inst.subscriptionExpiresAt,
        createdAt: inst.createdAt,
      };
    });

    const payload = {
      metrics: {
        totalInstitutions,
        activeInstitutions,
        totalStudents,
        totalSmsBalance,
        totalStorageMb: Math.round(totalStorageBytes / (1024 * 1024)),
      },
      institutions: formattedInstitutions,
      cached: false,
    };

    await cacheSet(cacheKey, payload, 15);

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Super Admin API error:", error);
    return NextResponse.json({ error: "Failed to fetch super admin data" }, { status: 500 });
  }
}
