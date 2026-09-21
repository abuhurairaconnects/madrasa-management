import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";
import { sendNotification } from "@/lib/notifications";
import { cacheDel } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const status = searchParams.get("status");

    const whereClause: Record<string, unknown> = {
      institutionId,
    };
    if (studentId) whereClause.studentId = studentId;
    if (status && status !== "ALL") whereClause.status = status;

    const invoices = await prisma.feeInvoice.findMany({
      where: whereClause,
      include: {
        student: {
          include: { department: true, classSession: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const institution =
      (await prisma.institution.findUnique({
        where: { id: institutionId },
      })) || (await prisma.institution.findFirst());

    return NextResponse.json({ invoices, institution });
  } catch (error) {
    console.error("Fees GET error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const {
      studentId,
      studentName,
      studentRoll,
      className,
      fatherName,
      guardianPhone,
      month,
      year,
      tuitionFee,
      boardingFee,
      admissionFee,
      examFee,
      otherFee,
      discount,
      paidAmount,
      paymentMethod,
      collectedBy,
      notes,
    } = body;

    let student: any = null;

    // 1. Try to find by UUID if passed
    if (studentId && typeof studentId === "string" && studentId.length > 10) {
      student = await prisma.student.findFirst({
        where: { id: studentId, institutionId },
        include: { institution: true, department: true, classSession: true },
      });
    }

    // 2. If not found by UUID, try to find by Roll/ID or Name in this institution
    const trimmedName = studentName?.trim();
    const trimmedRoll = studentRoll?.trim();

    if (!student && trimmedRoll) {
      student = await prisma.student.findFirst({
        where: { institutionId, studentId: trimmedRoll },
        include: { institution: true, department: true, classSession: true },
      });
    }

    if (!student && trimmedName) {
      student = await prisma.student.findFirst({
        where: { institutionId, nameBn: trimmedName },
        include: { institution: true, department: true, classSession: true },
      });
    }

    // 3. If still not found and a studentName was provided, create student record dynamically
    if (!student && (trimmedName || trimmedRoll)) {
      const finalName = trimmedName || `শিক্ষার্থী ${trimmedRoll || ""}`;

      let dept = await prisma.department.findFirst({
        where: { institutionId },
      });
      if (!dept) {
        dept = await prisma.department.create({
          data: {
            institutionId,
            nameBn: "সাধারণ বিভাগ",
            nameEn: "General Department",
            code: "GEN",
          },
        });
      }

      let classSession = await prisma.classSession.findFirst({
        where: { institutionId, departmentId: dept.id },
      });
      if (!classSession) {
        classSession = await prisma.classSession.create({
          data: {
            institutionId,
            departmentId: dept.id,
            nameBn: className?.trim() || "সাধারণ জামাত",
            nameEn: "General Class",
          },
        });
      }

      const count = await prisma.student.count({ where: { institutionId } });
      const inst =
        (await prisma.institution.findUnique({ where: { id: institutionId } })) ||
        (await prisma.institution.findFirst());
      const generatedRoll =
        trimmedRoll ||
        `${inst?.code || "JAMIA"}-M${String(count + 1).padStart(3, "0")}`;

      student = await prisma.student.create({
        data: {
          institutionId,
          studentId: generatedRoll,
          nameBn: finalName,
          fatherName: fatherName?.trim() || "অভিভাবক",
          guardianPhone: guardianPhone?.trim() || "01700000000",
          departmentId: dept.id,
          classId: classSession.id,
          monthlyTuitionFee: Number(tuitionFee || 0),
          monthlyBoardingFee: Number(boardingFee || 0),
          admissionDate: new Date().toISOString().split("T")[0],
        },
        include: { institution: true, department: true, classSession: true },
      });
    }

    if (!student) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে শিক্ষার্থীর নাম লিখুন বা তালিকা থেকে নির্বাচন করুন" },
        { status: 400 }
      );
    }

    const subTotal =
      Number(tuitionFee || 0) +
      Number(boardingFee || 0) +
      Number(admissionFee || 0) +
      Number(examFee || 0) +
      Number(otherFee || 0);
    const disc = Number(discount || 0);
    const totalAmount = Math.max(0, subTotal - disc);
    const paid = Number(paidAmount || 0);
    const dueAmount = Math.max(0, totalAmount - paid);

    let status = "PAID";
    if (dueAmount > 0 && paid > 0) {
      status = "PARTIAL";
    } else if (paid === 0 && totalAmount > 0) {
      status = "UNPAID";
    }

    const count = await prisma.feeInvoice.count({
      where: { institutionId: student.institutionId },
    });
    const invoiceNo = `INV-${student.institution?.code || "JAMIA"}-${year || new Date().getFullYear()}-${String(count + 101).padStart(4, "0")}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const newInvoice = await prisma.feeInvoice.create({
      data: {
        institutionId: student.institutionId,
        invoiceNo,
        studentId: student.id,
        month: month || "সেপ্টেম্বর",
        year: Number(year || new Date().getFullYear()),
        tuitionFee: Number(tuitionFee || 0),
        boardingFee: Number(boardingFee || 0),
        admissionFee: Number(admissionFee || 0),
        examFee: Number(examFee || 0),
        otherFee: Number(otherFee || 0),
        discount: disc,
        totalAmount,
        paidAmount: paid,
        dueAmount,
        status,
        paymentMethod: paymentMethod || "CASH",
        collectedBy: collectedBy || "হিসাব সহকারী",
        receivedDate: todayStr,
        notes: notes || null,
      },
      include: {
        student: {
          include: { department: true, classSession: true },
        },
      },
    });

    // Sync into General Fund if paid > 0
    if (paid > 0) {
      const genFund = await prisma.fund.findFirst({
        where: { institutionId: student.institutionId, code: "GENERAL" },
      });
      if (genFund) {
        await prisma.transaction.create({
          data: {
            institutionId: student.institutionId,
            voucherNo: `V-AUTO-${Date.now().toString().slice(-6)}`,
            fundId: genFund.id,
            type: "INCOME",
            category: "ছাত্রদের মাসিক ফি ও বোর্ডিং",
            amount: paid,
            description: `রশিদ নং ${invoiceNo} এর মাধ্যমে ${newInvoice.student.nameBn}-এর ফি আদায়`,
            paymentMethod: paymentMethod || "CASH",
            date: todayStr,
            performedBy: collectedBy || "হিসাবরক্ষক",
          },
        });

        await prisma.fund.update({
          where: { id: genFund.id },
          data: { currentBalance: { increment: paid } },
        });
      }
    }

    // Invalidate dashboard cache
    await cacheDel(`institution:${student.institutionId}:dashboard`);

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("Fees POST error:", error);
    return NextResponse.json({ error: "Failed to collect fee" }, { status: 500 });
  }
}
