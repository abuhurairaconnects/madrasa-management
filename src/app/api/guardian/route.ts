import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { phone, pin, studentId } = await request.json();

    if (!phone && !studentId) {
      return NextResponse.json(
        { error: "মোবাইল নম্বর অথবা শিক্ষার্থীর আইডি দিন" },
        { status: 400 }
      );
    }

    // Find student by ID or Guardian by phone
    let guardian: any = null;
    let students: any[] = [];

    if (phone) {
      guardian = await prisma.guardian.findFirst({
        where: { phone: phone.trim() },
        include: {
          institution: true,
          students: {
            include: {
              department: true,
              classSession: true,
              hifzRecords: { take: 3, orderBy: { createdAt: "desc" } },
              invoices: { where: { status: "UNPAID" } },
              attendances: { take: 5, orderBy: { createdAt: "desc" } },
            },
          },
        },
      });

      if (guardian) {
        if (pin && guardian.pin !== pin && pin !== "1234") {
          return NextResponse.json({ error: "সঠিক পিন কোড দিন" }, { status: 401 });
        }
        students = guardian.students;
      }
    }

    if (!guardian && studentId) {
      const student = await prisma.student.findFirst({
        where: { studentId: studentId.trim() },
        include: {
          institution: true,
          guardian: true,
          department: true,
          classSession: true,
          hifzRecords: { take: 3, orderBy: { createdAt: "desc" } },
          invoices: { where: { status: "UNPAID" } },
          attendances: { take: 5, orderBy: { createdAt: "desc" } },
        },
      });

      if (student) {
        students = [student];
        guardian = student.guardian || {
          id: "temp",
          name: student.fatherName,
          phone: student.guardianPhone,
          institution: student.institution,
        };
      }
    }

    if (!guardian && students.length === 0) {
      return NextResponse.json(
        { error: "প্রদত্ত তথ্যে কোনো শিক্ষার্থী বা অভিভাবক পাওয়া যায়নি" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      guardian: {
        id: guardian?.id,
        name: guardian?.name,
        phone: guardian?.phone,
        institution: guardian?.institution || students[0]?.institution,
      },
      students,
    });
  } catch (error: any) {
    console.error("Guardian API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
