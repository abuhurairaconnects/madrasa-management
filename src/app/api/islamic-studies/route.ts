import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const classId = searchParams.get("classId");

    const whereStudent: any = { institutionId };
    if (classId && classId !== "ALL") {
      whereStudent.classId = classId;
    }

    const [classes, students, tajweedRecords] = await Promise.all([
      prisma.classSession.findMany({
        where: { institutionId },
      }),
      prisma.student.findMany({
        where: whereStudent,
        include: {
          classSession: true,
          namazRecords: {
            where: { date },
          },
          amalRecords: {
            where: { date },
          },
        },
        orderBy: { studentId: "asc" },
      }),
      prisma.tajweedRecord.findMany({
        where: { institutionId },
        include: { student: { include: { classSession: true } } },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
    ]);

    return NextResponse.json({
      success: true,
      date,
      classes,
      students,
      tajweedRecords,
    });
  } catch (error: any) {
    console.error("Islamic Studies GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load islamic studies data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const { action } = body;

    if (action === "UPDATE_NAMAZ") {
      const { studentId, date, fajr, dhuhr, asr, maghrib, isha, tahajjud } = body;
      const record = await prisma.namazRecord.upsert({
        where: {
          institutionId_studentId_date: {
            institutionId,
            studentId,
            date,
          },
        },
        update: {
          fajr,
          dhuhr,
          asr,
          maghrib,
          isha,
          tahajjud: Boolean(tahajjud),
        },
        create: {
          institutionId,
          studentId,
          date,
          fajr: fajr || "JAMAAT",
          dhuhr: dhuhr || "JAMAAT",
          asr: asr || "JAMAAT",
          maghrib: maghrib || "JAMAAT",
          isha: isha || "JAMAAT",
          tahajjud: Boolean(tahajjud),
        },
      });
      return NextResponse.json({ success: true, record });
    }

    if (action === "UPDATE_AMAL") {
      const { studentId, date, morningAdhkar, eveningAdhkar, tilawatPages, akhlaqRating, remark } = body;
      const record = await prisma.amalRecord.upsert({
        where: {
          institutionId_studentId_date: {
            institutionId,
            studentId,
            date,
          },
        },
        update: {
          morningAdhkar: Boolean(morningAdhkar),
          eveningAdhkar: Boolean(eveningAdhkar),
          tilawatPages: Number(tilawatPages) || 0,
          akhlaqRating: akhlaqRating || "MUMTAZ",
          remark,
        },
        create: {
          institutionId,
          studentId,
          date,
          morningAdhkar: Boolean(morningAdhkar),
          eveningAdhkar: Boolean(eveningAdhkar),
          tilawatPages: Number(tilawatPages) || 0,
          akhlaqRating: akhlaqRating || "MUMTAZ",
          remark,
        },
      });
      return NextResponse.json({ success: true, record });
    }

    if (action === "ADD_TAJWEED") {
      const { studentId, date, makhrajScore, sifatScore, tartilQuality, surahOrPara, notes } = body;
      const record = await prisma.tajweedRecord.create({
        data: {
          institutionId,
          studentId,
          date,
          makhrajScore: Number(makhrajScore) || 5,
          sifatScore: Number(sifatScore) || 5,
          tartilQuality: tartilQuality || "MUMTAZ",
          surahOrPara,
          notes,
        },
      });
      return NextResponse.json({ success: true, record });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Islamic Studies POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save islamic studies record" },
      { status: 500 }
    );
  }
}
