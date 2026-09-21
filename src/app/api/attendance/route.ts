import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";
import { sendAttendanceAlert } from "@/lib/notifications";
import { cacheDel } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const classId = searchParams.get("classId");

    const classes = await prisma.classSession.findMany({
      where: { institutionId },
      include: { department: true },
    });

    const activeClassId = classId || classes[0]?.id;

    const students = activeClassId
      ? await prisma.student.findMany({
          where: { institutionId, classId: activeClassId, status: "ACTIVE" },
          include: {
            attendances: {
              where: { date },
            },
          },
        })
      : [];

    return NextResponse.json({
      date,
      classes,
      activeClassId,
      students,
    });
  } catch (error) {
    console.error("Attendance GET error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const { date, classId, records, sendAlerts = false } = body;

    if (!Array.isArray(records)) {
      return NextResponse.json({ error: "Invalid records" }, { status: 400 });
    }

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    for (const rec of records) {
      const existing = await prisma.attendance.findFirst({
        where: { institutionId, date, studentId: rec.studentId },
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: { status: rec.status, remark: rec.remark || null },
        });
      } else {
        await prisma.attendance.create({
          data: {
            institutionId,
            date,
            classId,
            studentId: rec.studentId,
            status: rec.status,
            remark: rec.remark || null,
          },
        });
      }

      // If student is marked ABSENT and alerts enabled, send attendance SMS
      if (sendAlerts && rec.status === "ABSENT" && institution) {
        const student = await prisma.student.findUnique({
          where: { id: rec.studentId },
        });
        if (student && student.guardianPhone) {
          await sendAttendanceAlert(
            institutionId,
            institution.nameBn,
            student.nameBn,
            student.guardianPhone,
            "ABSENT"
          );
        }
      }
    }

    await cacheDel(`institution:${institutionId}:dashboard`);

    return NextResponse.json({ success: true, count: records.length });
  } catch (error) {
    console.error("Attendance POST error:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
