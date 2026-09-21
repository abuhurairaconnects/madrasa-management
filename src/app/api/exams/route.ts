import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";

export function calculateGrade(total: number, max: number = 100): string {
  const percentage = (total / max) * 100;
  if (percentage >= 80) return "MUMTAZ";
  if (percentage >= 65) return "JAYYID_JIDDAN";
  if (percentage >= 50) return "JAYYID";
  if (percentage >= 40) return "MAKBUL";
  return "RASIB";
}

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const examId = searchParams.get("examId");
    const classId = searchParams.get("classId");

    const [exams, classes] = await Promise.all([
      prisma.exam.findMany({
        where: { institutionId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.classSession.findMany({
        where: { institutionId },
        include: { subjects: true },
      }),
    ]);

    const activeExamId = examId || exams[0]?.id;
    let studentsWithMarks: any[] = [];
    let selectedExam = null;

    if (activeExamId) {
      selectedExam = exams.find((e) => e.id === activeExamId) || null;

      const studentWhere: any = { institutionId };
      if (classId && classId !== "ALL") {
        studentWhere.classId = classId;
      }

      const students = await prisma.student.findMany({
        where: studentWhere,
        include: {
          classSession: {
            include: { subjects: true },
          },
          examMarks: {
            where: { examId: activeExamId },
            include: { subject: true },
          },
        },
        orderBy: { studentId: "asc" },
      });

      studentsWithMarks = students;
    }

    return NextResponse.json({
      success: true,
      exams,
      selectedExam,
      classes,
      students: studentsWithMarks,
    });
  } catch (error: any) {
    console.error("Exams GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load exam data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const { action } = body;

    if (action === "CREATE_EXAM") {
      const { titleBn, titleEn, term, year, startDate, endDate } = body;
      const exam = await prisma.exam.create({
        data: {
          institutionId,
          titleBn,
          titleEn,
          term: term || "FIRST_TERM",
          year: Number(year) || new Date().getFullYear(),
          startDate,
          endDate,
          status: "PUBLISHED",
        },
      });
      return NextResponse.json({ success: true, exam });
    }

    if (action === "SAVE_MARK") {
      const { examId, studentId, subjectId, writtenMarks, vivaMarks, remarks } = body;
      const written = Number(writtenMarks) || 0;
      const viva = Number(vivaMarks) || 0;
      const total = written + viva;
      const grade = calculateGrade(total, 100);

      const mark = await prisma.examMark.upsert({
        where: {
          examId_studentId_subjectId: {
            examId,
            studentId,
            subjectId,
          },
        },
        update: {
          writtenMarks: written,
          vivaMarks: viva,
          totalMarks: total,
          grade,
          remarks,
        },
        create: {
          institutionId,
          examId,
          studentId,
          subjectId,
          writtenMarks: written,
          vivaMarks: viva,
          totalMarks: total,
          grade,
          remarks,
        },
      });
      return NextResponse.json({ success: true, mark });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Exams POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save exam data" },
      { status: 500 }
    );
  }
}
