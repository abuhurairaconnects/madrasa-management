import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);

    const [books, issues, students] = await Promise.all([
      prisma.book.findMany({
        where: { institutionId },
        orderBy: { createdAt: "desc" },
      }),
      prisma.bookIssue.findMany({
        where: { institutionId },
        include: {
          book: true,
          student: { include: { classSession: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.findMany({
        where: { institutionId },
        select: { id: true, studentId: true, nameBn: true, guardianPhone: true },
        orderBy: { studentId: "asc" },
      }),
    ]);

    const activeIssues = issues.filter((i) => i.status === "ISSUED");

    return NextResponse.json({
      success: true,
      books,
      issues,
      students,
      stats: {
        totalTitles: books.length,
        totalCopies: books.reduce((acc, b) => acc + b.totalCopies, 0),
        issuedCopies: activeIssues.length,
      },
    });
  } catch (error: any) {
    console.error("Library GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load library data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const { action } = body;

    if (action === "ADD_BOOK") {
      const { titleBn, titleEn, author, category, shelfNumber, isbn, totalCopies } = body;
      const copies = Number(totalCopies) || 1;
      const book = await prisma.book.create({
        data: {
          institutionId,
          titleBn,
          titleEn,
          author,
          category: category || "HADITH",
          shelfNumber,
          isbn,
          totalCopies: copies,
          availableCopies: copies,
        },
      });
      return NextResponse.json({ success: true, book });
    }

    if (action === "ISSUE_BOOK") {
      const { bookId, studentId, issuedToName, phone, issueDate, dueDate } = body;
      const [issue, _] = await prisma.$transaction([
        prisma.bookIssue.create({
          data: {
            institutionId,
            bookId,
            studentId: studentId || null,
            issuedToName,
            phone,
            issueDate: issueDate || new Date().toISOString().split("T")[0],
            dueDate,
            status: "ISSUED",
          },
        }),
        prisma.book.update({
          where: { id: bookId },
          data: { availableCopies: { decrement: 1 } },
        }),
      ]);
      return NextResponse.json({ success: true, issue });
    }

    if (action === "RETURN_BOOK") {
      const { issueId, fineAmount } = body;
      const issue = await prisma.bookIssue.findUnique({
        where: { id: issueId },
      });
      if (!issue) {
        return NextResponse.json({ success: false, error: "Issue not found" }, { status: 404 });
      }

      const [updatedIssue, _] = await prisma.$transaction([
        prisma.bookIssue.update({
          where: { id: issueId },
          data: {
            status: "RETURNED",
            returnDate: new Date().toISOString().split("T")[0],
            fineAmount: Number(fineAmount) || 0,
          },
        }),
        prisma.book.update({
          where: { id: issue.bookId },
          data: { availableCopies: { increment: 1 } },
        }),
      ]);

      return NextResponse.json({ success: true, issue: updatedIssue });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Library POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save library record" },
      { status: 500 }
    );
  }
}
