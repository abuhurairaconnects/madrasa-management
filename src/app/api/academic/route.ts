import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    const whereClause: any = { institutionId };
    if (classId && classId !== "ALL") {
      whereClause.classId = classId;
    }

    const [subjects, routines, classes, teachers] = await Promise.all([
      prisma.subject.findMany({
        where: whereClause,
        include: {
          classSession: true,
          teacher: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.classRoutine.findMany({
        where: whereClause,
        include: {
          classSession: true,
          subject: true,
          teacher: true,
        },
        orderBy: [{ dayOfWeek: "asc" }, { periodNumber: "asc" }],
      }),
      prisma.classSession.findMany({
        where: { institutionId },
        include: { department: true },
      }),
      prisma.user.findMany({
        where: { institutionId, role: { in: ["TEACHER", "MUHTAMIM", "NAZIM_E_TALIMAT"] } },
        select: { id: true, name: true, phone: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      subjects,
      routines,
      classes,
      teachers,
    });
  } catch (error: any) {
    console.error("Academic GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load academic data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const { action } = body;

    if (action === "CREATE_SUBJECT") {
      const { classId, nameBn, nameEn, code, totalMarks, passMarks, teacherId } = body;
      const subject = await prisma.subject.create({
        data: {
          institutionId,
          classId,
          nameBn,
          nameEn,
          code,
          totalMarks: Number(totalMarks) || 100,
          passMarks: Number(passMarks) || 33,
          teacherId: teacherId || null,
        },
      });
      return NextResponse.json({ success: true, subject });
    }

    if (action === "CREATE_ROUTINE") {
      const { classId, subjectId, teacherId, dayOfWeek, periodNumber, startTime, endTime, roomNo } = body;
      const routine = await prisma.classRoutine.create({
        data: {
          institutionId,
          classId,
          subjectId,
          teacherId: teacherId || null,
          dayOfWeek,
          periodNumber: Number(periodNumber),
          startTime,
          endTime,
          roomNo,
        },
      });
      return NextResponse.json({ success: true, routine });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Academic POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save academic record" },
      { status: 500 }
    );
  }
}
