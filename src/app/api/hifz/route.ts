import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";
import { sendHifzProgressAlert } from "@/lib/notifications";
import { cacheDel } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    // If specific student logs requested
    if (studentId) {
      const student = await prisma.student.findFirst({
        where: { id: studentId, institutionId },
        include: {
          classSession: true,
          hifzRecords: {
            orderBy: { date: "desc" },
            include: { teacher: true },
          },
        },
      });
      return NextResponse.json({ student });
    }

    // Otherwise get all Hifz department students for this institution
    const hifzDepartment = await prisma.department.findFirst({
      where: { institutionId, code: "HIFZ" },
    });

    if (!hifzDepartment) {
      return NextResponse.json({ students: [] });
    }

    const students = await prisma.student.findMany({
      where: { institutionId, departmentId: hifzDepartment.id, status: "ACTIVE" },
      include: {
        classSession: true,
        hifzRecords: {
          take: 1,
          orderBy: { date: "desc" },
        },
      },
      orderBy: { studentId: "asc" },
    });

    const teachers = await prisma.user.findMany({
      where: { institutionId, role: "TEACHER" },
    });

    return NextResponse.json({ students, teachers });
  } catch (error) {
    console.error("Hifz GET error:", error);
    return NextResponse.json({ error: "Failed to fetch Hifz data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      studentId,
      date,
      sabaqPara,
      sabaqSurah,
      sabaqPage,
      sabaqQuality,
      sabaqiPages,
      sabaqiQuality,
      amukhtaParas,
      amukhtaQuality,
      totalParasMemorized,
      notes,
      teacherId,
      sendAlert = false,
    } = body;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { institution: true },
    });

    if (!student) {
      return NextResponse.json({ error: "শিক্ষার্থী পাওয়া যায়নি" }, { status: 404 });
    }

    const institutionId = student.institutionId;

    const record = await prisma.hifzRecord.create({
      data: {
        institutionId,
        studentId,
        date: date || new Date().toISOString().split("T")[0],
        sabaqPara: sabaqPara ? Number(sabaqPara) : null,
        sabaqSurah: sabaqSurah || null,
        sabaqPage: sabaqPage ? Number(sabaqPage) : null,
        sabaqQuality: sabaqQuality || "MUMTAZ",
        sabaqiPages: sabaqiPages || null,
        sabaqiQuality: sabaqiQuality || null,
        amukhtaParas: amukhtaParas || null,
        amukhtaQuality: amukhtaQuality || null,
        totalParasMemorized: Number(totalParasMemorized || 0),
        notes: notes || null,
        teacherId: teacherId || null,
      },
      include: {
        student: true,
      },
    });

    // Send instant SMS if requested
    if (sendAlert && student.guardianPhone && sabaqPara) {
      const qualityBn = sabaqQuality === "MUMTAZ" ? "চমৎকার" : "উত্তম";
      await sendHifzProgressAlert(
        institutionId,
        student.institution.nameBn,
        student.nameBn,
        student.guardianPhone,
        Number(sabaqPara),
        Number(sabaqPage || 1),
        qualityBn
      );
    }

    await cacheDel(`institution:${institutionId}:dashboard`);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Hifz POST error:", error);
    return NextResponse.json({ error: "Failed to save Hifz record" }, { status: 500 });
  }
}
