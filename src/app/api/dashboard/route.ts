import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";
import { cacheGet, cacheSet } from "@/lib/redis";

export async function GET(request: Request) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const cacheKey = `institution:${institutionId}:dashboard`;

    // 1. Try fetching from Redis cache
    const cachedData = await cacheGet(cacheKey);
    if (cachedData) {
      return NextResponse.json({ ...cachedData, cached: true });
    }

    // 2. Query from database with tenant isolation
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    }) || await prisma.institution.findFirst();

    if (!institution) {
      return NextResponse.json({ error: "Institution not found" }, { status: 404 });
    }

    const currentInstId = institution.id;

    const [
      totalStudents,
      hifzStudentsCount,
      boardingStudentsCount,
      orphanStudentsCount,
      funds,
      todayAttendance,
      recentInvoices,
      recentHifz,
      recentTransactions,
      totalSubjects,
      totalExams,
      occupiedBeds,
      totalBooks,
      totalStaff,
    ] = await Promise.all([
      prisma.student.count({ where: { institutionId: currentInstId, status: "ACTIVE" } }),
      prisma.student.count({
        where: {
          institutionId: currentInstId,
          status: "ACTIVE",
          department: { code: "HIFZ" },
        },
      }),
      prisma.student.count({
        where: { institutionId: currentInstId, status: "ACTIVE", isBoarding: true },
      }),
      prisma.student.count({
        where: { institutionId: currentInstId, status: "ACTIVE", isEligibleForLillah: true },
      }),
      prisma.fund.findMany({ where: { institutionId: currentInstId } }),
      prisma.attendance.findMany({
        where: {
          institutionId: currentInstId,
          date: new Date().toISOString().split("T")[0],
        },
      }),
      prisma.feeInvoice.findMany({
        where: { institutionId: currentInstId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            include: { department: true, classSession: true },
          },
        },
      }),
      prisma.hifzRecord.findMany({
        where: { institutionId: currentInstId },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { student: true },
      }),
      prisma.transaction.findMany({
        where: { institutionId: currentInstId },
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { fund: true },
      }),
      prisma.subject.count({ where: { institutionId: currentInstId } }),
      prisma.exam.count({ where: { institutionId: currentInstId } }),
      prisma.hostelBed.count({ where: { institutionId: currentInstId, isOccupied: true } }),
      prisma.book.count({ where: { institutionId: currentInstId } }),
      prisma.user.count({ where: { institutionId: currentInstId } }),
    ]);

    const totalFundBalance = funds.reduce((acc, f) => acc + f.currentBalance, 0);

    const todayStr = new Date().toISOString().split("T")[0];
    const todayInvoices = await prisma.feeInvoice.findMany({
      where: { institutionId: currentInstId, receivedDate: todayStr },
    });
    const todayCollection = todayInvoices.reduce((acc, inv) => acc + inv.paidAmount, 0);

    const presentCount = todayAttendance.filter((a) => a.status === "PRESENT").length;
    const absentCount = todayAttendance.filter((a) => a.status === "ABSENT").length;

    const responsePayload = {
      institution,
      stats: {
        totalStudents,
        hifzStudentsCount,
        boardingStudentsCount,
        orphanStudentsCount,
        totalFundBalance,
        todayCollection,
        presentCount,
        absentCount,
        totalSubjects,
        totalExams,
        occupiedBeds,
        totalBooks,
        totalStaff,
      },
      funds,
      recentInvoices,
      recentHifz,
      recentTransactions,
      cached: false,
    };

    // Cache in Redis for 30 seconds
    await cacheSet(cacheKey, responsePayload, 30);

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
