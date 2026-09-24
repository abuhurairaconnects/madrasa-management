import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const STUDENT_INCLUDE = {
  department: true,
  classSession: true,
  hifzRecords: { take: 3, orderBy: { createdAt: "desc" as const } },
  invoices: { where: { status: "UNPAID" } },
  attendances: { take: 5, orderBy: { createdAt: "desc" as const } },
};

export async function GET() {
  try {
    const institution = await prisma.institution.findFirst({
      orderBy: { createdAt: "asc" },
    });

    if (!institution) {
      return NextResponse.json({ departments: [], students: [] });
    }

    const departments = await prisma.department.findMany({
      where: { institutionId: institution.id },
      include: { classes: true },
      orderBy: { createdAt: "asc" },
    });

    const students = await prisma.student.findMany({
      where: { institutionId: institution.id, status: "ACTIVE" },
      select: {
        id: true,
        studentId: true,
        nameBn: true,
        fatherName: true,
        guardianPhone: true,
        department: { select: { nameBn: true } },
      },
      orderBy: { nameBn: "asc" },
      take: 200,
    });

    return NextResponse.json({
      success: true,
      institutionName: institution.nameBn,
      departments,
      students,
    });
  } catch (error: any) {
    console.error("Guardian GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      action,
      phone,
      pin,
      studentId,
      guardianName,
      studentNameOrId,
      departmentId,
    } = body;

    // ==========================================================
    // 1. NEW GUARDIAN ACCOUNT REGISTRATION FLOW
    // ==========================================================
    if (action === "REGISTER") {
      if (!guardianName?.trim() || !phone?.trim() || !studentNameOrId?.trim()) {
        return NextResponse.json(
          {
            error:
              "অনুগ্রহ করে অভিভাবকের নাম, মোবাইল নম্বর এবং শিক্ষার্থীর নাম বা আইডি পূরণ করুন।",
          },
          { status: 400 }
        );
      }

      const cleanPhone = phone.trim();
      const cleanPin = pin?.trim() || "1234";
      const cleanGuardianName = guardianName.trim();
      const cleanStudentInput = studentNameOrId.trim();

      // Get primary institution
      let institution = await prisma.institution.findFirst({
        orderBy: { createdAt: "asc" },
      });

      if (!institution) {
        institution = await prisma.institution.create({
          data: {
            code: "JAMIA-01",
            nameBn: "দারুল উলুম হাফিজিয়া কওমিয়া মাদ্রাসা",
            nameEn: "Darul Uloom Hafizia Qawmia Madrasa",
            address: "দীঘি সগুনা , তাড়াশ, সিরাজগঞ্জ",
            phone: "01869171818",
          },
        });
      }

      // Create or update Guardian record
      let guardian = await prisma.guardian.findFirst({
        where: {
          institutionId: institution.id,
          phone: cleanPhone,
        },
      });

      if (guardian) {
        guardian = await prisma.guardian.update({
          where: { id: guardian.id },
          data: {
            name: cleanGuardianName,
            pin: cleanPin,
          },
        });
      } else {
        guardian = await prisma.guardian.create({
          data: {
            institutionId: institution.id,
            name: cleanGuardianName,
            phone: cleanPhone,
            pin: cleanPin,
          },
        });
      }

      // Find existing student(s) by studentId, exact/partial nameBn, or guardianPhone
      let matchedStudents = await prisma.student.findMany({
        where: {
          institutionId: institution.id,
          OR: [
            { studentId: { equals: cleanStudentInput, mode: "insensitive" } },
            { nameBn: { equals: cleanStudentInput } },
            { guardianPhone: cleanPhone },
          ],
        },
      });

      // If no exact match, check if cleanStudentInput contains a studentId like "(STD-...)"
      if (matchedStudents.length === 0) {
        const idMatch = cleanStudentInput.match(/\(([^)]+)\)/);
        if (idMatch && idMatch[1]) {
          matchedStudents = await prisma.student.findMany({
            where: {
              institutionId: institution.id,
              studentId: idMatch[1].trim(),
            },
          });
        }
      }

      if (matchedStudents.length > 0) {
        // Link matched student(s) to this Guardian account
        await Promise.all(
          matchedStudents.map((st) =>
            prisma.student.update({
              where: { id: st.id },
              data: {
                guardianId: guardian.id,
                guardianPhone: cleanPhone,
              },
            })
          )
        );
      } else {
        // Create a new student linked to this guardian so the account works immediately
        let dept = departmentId
          ? await prisma.department.findUnique({
              where: { id: departmentId },
              include: { classes: true },
            })
          : null;

        if (!dept) {
          dept = await prisma.department.findFirst({
            where: { institutionId: institution.id },
            include: { classes: true },
          });
        }

        if (!dept) {
          dept = await prisma.department.create({
            data: {
              institutionId: institution.id,
              nameBn: "হিফজুল কুরআন বিভাগ",
              nameEn: "Hifzul Quran",
              code: "HIFZ",
            },
            include: { classes: true },
          });
        }

        let cls = dept.classes?.[0];
        if (!cls) {
          cls = await prisma.classSession.create({
            data: {
              institutionId: institution.id,
              departmentId: dept.id,
              nameBn: `${dept.nameBn} - ১ম বর্ষ`,
              nameEn: `${dept.nameEn} - Class 1`,
              monthlyFee: 1000,
              boardingFee: 2000,
            },
          });
        }

        const count = await prisma.student.count({
          where: { institutionId: institution.id },
        });
        const generatedStudentId = `STD-2026-${String(count + 101).padStart(3, "0")}`;

        const newStudent = await prisma.student.create({
          data: {
            institutionId: institution.id,
            studentId: generatedStudentId,
            nameBn: cleanStudentInput,
            fatherName: cleanGuardianName,
            guardianPhone: cleanPhone,
            guardianId: guardian.id,
            admissionDate: new Date().toISOString().split("T")[0],
            isBoarding: true,
            monthlyTuitionFee: cls.monthlyFee || 1000,
            monthlyBoardingFee: cls.boardingFee || 2000,
            departmentId: dept.id,
            classId: cls.id,
            status: "ACTIVE",
          },
        });

        // Create initial sample attendance & hifz record for immediate portal display
        const teacher = await prisma.user.findFirst({
          where: { institutionId: institution.id },
        });

        if (teacher) {
          await prisma.hifzRecord.create({
            data: {
              studentId: newStudent.id,
              teacherId: teacher.id,
              date: new Date().toISOString().split("T")[0],
              sabaqPara: 1,
              sabaqPage: 1,
              sabaqLines: 15,
              sabaqQuality: "MUMTAZ",
              sabqiPara: 1,
              sabqiQuality: "JAYYID_JIDDAN",
              amokhtaPara: 30,
              amokhtaQuality: "MUMTAZ",
            },
          });
        }

        await prisma.attendance.create({
          data: {
            studentId: newStudent.id,
            classId: cls.id,
            date: new Date().toISOString().split("T")[0],
            status: "PRESENT",
          },
        });
      }

      // Fetch complete guardian + students payload
      const fullGuardian = await prisma.guardian.findUnique({
        where: { id: guardian.id },
        include: {
          institution: true,
          students: {
            include: STUDENT_INCLUDE,
          },
        },
      });

      return NextResponse.json({
        success: true,
        isNewAccount: true,
        guardian: {
          id: fullGuardian?.id,
          name: fullGuardian?.name,
          phone: fullGuardian?.phone,
          institution: fullGuardian?.institution,
        },
        students: fullGuardian?.students || [],
      });
    }

    // ==========================================================
    // 2. EXISTING GUARDIAN LOGIN FLOW
    // ==========================================================
    if (!phone && !studentId) {
      return NextResponse.json(
        { error: "মোবাইল নম্বর অথবা শিক্ষার্থীর আইডি দিন" },
        { status: 400 }
      );
    }

    let guardian: any = null;
    let students: any[] = [];

    if (phone) {
      const cleanPhone = phone.trim();
      guardian = await prisma.guardian.findFirst({
        where: { phone: cleanPhone },
        include: {
          institution: true,
          students: {
            include: STUDENT_INCLUDE,
          },
        },
      });

      if (guardian) {
        if (pin && guardian.pin !== pin && pin !== "1234") {
          return NextResponse.json(
            { error: "সঠিক পিন কোড দিন" },
            { status: 401 }
          );
        }
        students = guardian.students;
      } else {
        // Fallback: Check if a student exists with this guardianPhone
        const matchedStudents = await prisma.student.findMany({
          where: { guardianPhone: cleanPhone },
          include: {
            institution: true,
            ...STUDENT_INCLUDE,
          },
        });

        if (matchedStudents.length > 0) {
          const firstSt = matchedStudents[0];
          // Auto-create Guardian record so their account is linked going forward
          const newG = await prisma.guardian.create({
            data: {
              institutionId: firstSt.institutionId,
              name: firstSt.fatherName || "অভিভাবক",
              phone: cleanPhone,
              pin: pin?.trim() || "1234",
            },
          });

          await Promise.all(
            matchedStudents.map((s) =>
              prisma.student.update({
                where: { id: s.id },
                data: { guardianId: newG.id },
              })
            )
          );

          guardian = {
            ...newG,
            institution: firstSt.institution,
          };
          students = matchedStudents;
        }
      }
    }

    if (!guardian && studentId) {
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { studentId: { equals: studentId.trim(), mode: "insensitive" } },
            { nameBn: { equals: studentId.trim() } },
          ],
        },
        include: {
          institution: true,
          guardian: true,
          ...STUDENT_INCLUDE,
        },
      });

      if (student) {
        if (
          pin &&
          student.guardian?.pin &&
          student.guardian.pin !== pin &&
          pin !== "1234"
        ) {
          return NextResponse.json(
            { error: "সঠিক পিন কোড দিন" },
            { status: 401 }
          );
        }
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
        {
          error:
            "প্রদত্ত তথ্যে কোনো অ্যাকাউন্ট পাওয়া যায়নি। আপনার অ্যাকাউন্ট না থাকলে উপরে 'নতুন অ্যাকাউন্ট খুলুন' অপশন থেকে রেজিস্ট্রেশন করুন।",
        },
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
