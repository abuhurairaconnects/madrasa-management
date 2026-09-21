import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";
import { cacheDel } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const classId = searchParams.get("classId");
    const search = searchParams.get("search");

    const whereClause: Record<string, unknown> = {
      institutionId,
    };
    if (departmentId && departmentId !== "ALL") {
      whereClause.departmentId = departmentId;
    }
    if (classId && classId !== "ALL") {
      whereClause.classId = classId;
    }
    if (search) {
      whereClause.OR = [
        { nameBn: { contains: search } },
        { studentId: { contains: search } },
        { fatherName: { contains: search } },
        { guardianPhone: { contains: search } },
      ];
    }

    const students = await prisma.student.findMany({
      where: whereClause,
      include: {
        department: true,
        classSession: true,
        hifzRecords: {
          take: 1,
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const departments = await prisma.department.findMany({
      where: { institutionId },
      include: { classes: true },
    });

    return NextResponse.json({ students, departments });
  } catch (error) {
    console.error("Students GET error:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();

    // Verify Institution Quota
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      return NextResponse.json({ error: "মাদ্রাসা খুঁজে পাওয়া যায়নি" }, { status: 404 });
    }

    const activeCount = await prisma.student.count({
      where: { institutionId, status: "ACTIVE" },
    });

    if (activeCount >= institution.studentLimit) {
      return NextResponse.json(
        {
          error: `এই মাদ্রাসার শিক্ষার্থী কোটা (${institution.studentLimit} জন) পূর্ণ হয়ে গেছে। অনুগ্রহ করে সেন্ট্রাল এডমিনের মাধ্যমে কোটা বৃদ্ধি করুন।`,
        },
        { status: 403 }
      );
    }

    // Auto generate studentId if not provided
    const count = await prisma.student.count({ where: { institutionId } });
    const nextId = `${institution.code}-STD-${String(count + 1).padStart(3, "0")}`;

    // Link or create Guardian profile for mobile portal
    let guardianId: string | undefined = undefined;
    if (body.guardianPhone) {
      const guardian = await prisma.guardian.upsert({
        where: {
          institutionId_phone: {
            institutionId,
            phone: body.guardianPhone.trim(),
          },
        },
        update: {},
        create: {
          institutionId,
          name: body.fatherName || "অভিভাবক",
          phone: body.guardianPhone.trim(),
          pin: "1234",
        },
      });
      guardianId = guardian.id;
    }

    const newStudent = await prisma.student.create({
      data: {
        institutionId,
        studentId: body.studentId || nextId,
        nameBn: body.nameBn,
        nameEn: body.nameEn || null,
        fatherName: body.fatherName,
        motherName: body.motherName || null,
        guardianPhone: body.guardianPhone,
        emergencyPhone: body.emergencyPhone || null,
        guardianId,
        village: body.village || null,
        district: body.district || null,
        bloodGroup: body.bloodGroup || null,
        birthDate: body.birthDate || null,
        admissionDate: body.admissionDate || new Date().toISOString().split("T")[0],
        isBoarding: Boolean(body.isBoarding),
        isOrphan: Boolean(body.isOrphan),
        isEligibleForLillah: Boolean(body.isEligibleForLillah),
        monthlyTuitionFee: Number(body.monthlyTuitionFee || 0),
        monthlyBoardingFee: Number(body.monthlyBoardingFee || 0),
        departmentId: body.departmentId,
        classId: body.classId,
      },
      include: {
        department: true,
        classSession: true,
      },
    });

    // Invalidate dashboard cache
    await cacheDel(`institution:${institutionId}:dashboard`);

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Students POST error:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
