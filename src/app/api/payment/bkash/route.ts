import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const { invoiceId, payerPhone, paymentMethod = "BKASH" } = await request.json();

    if (!invoiceId) {
      return NextResponse.json({ error: "ইনভয়েস আইডি প্রয়োজন" }, { status: 400 });
    }

    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        student: true,
        institution: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "ইনভয়েস পাওয়া যায়নি" }, { status: 404 });
    }

    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "এই ফি ইতোমধ্যে পরিশোধিত" }, { status: 400 });
    }

    const generatedTrxId = `TRX-${paymentMethod}-${Date.now().toString().slice(-8)}`;

    // 1. Create Payment Transaction
    const transaction = await prisma.paymentTransaction.create({
      data: {
        institutionId: invoice.institutionId,
        invoiceId: invoice.id,
        amount: invoice.dueAmount,
        gateway: paymentMethod,
        transactionId: generatedTrxId,
        status: "COMPLETED",
        payerPhone: payerPhone || invoice.student.guardianPhone,
      },
    });

    // 2. Mark Invoice as PAID
    const updatedInvoice = await prisma.feeInvoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: invoice.totalAmount,
        dueAmount: 0,
        status: "PAID",
        paymentMethod: paymentMethod,
        receivedDate: new Date().toISOString().split("T")[0],
        notes: `অনলাইন পেমেন্ট (${paymentMethod}) TrxID: ${generatedTrxId}`,
      },
    });

    // 3. Credit General Fund of this Institution
    const generalFund = await prisma.fund.findFirst({
      where: { institutionId: invoice.institutionId, code: "GENERAL" },
    });

    if (generalFund) {
      await prisma.fund.update({
        where: { id: generalFund.id },
        data: { currentBalance: { increment: invoice.dueAmount } },
      });

      await prisma.transaction.create({
        data: {
          institutionId: invoice.institutionId,
          voucherNo: `VOUCH-DIGI-${Date.now().toString().slice(-6)}`,
          fundId: generalFund.id,
          type: "INCOME",
          category: "ছাত্র ফি (ডিজিটাল)",
          amount: invoice.dueAmount,
          description: `${invoice.student.nameBn}-এর ${invoice.month} মাসের ফি (${paymentMethod})`,
          donorName: invoice.student.nameBn,
          donorPhone: payerPhone || invoice.student.guardianPhone,
          paymentMethod: paymentMethod,
          date: new Date().toISOString().split("T")[0],
          performedBy: "Digital Payment Gateway",
        },
      });
    }

    // 4. Send Instant Payment Confirmation SMS to Guardian
    const confirmMessage = `ধন্যবাদ! ${invoice.student.nameBn}-এর ${invoice.month} মাসের ফি ৳${invoice.dueAmount} সফলভাবে পরিশোধ হয়েছে। TrxID: ${generatedTrxId} - ${invoice.institution.nameBn}`;

    await sendNotification({
      institutionId: invoice.institutionId,
      recipientPhone: payerPhone || invoice.student.guardianPhone,
      recipientName: invoice.student.nameBn,
      message: confirmMessage,
      smsType: "DUE_ALERT",
    });

    return NextResponse.json({
      success: true,
      transactionId: generatedTrxId,
      invoice: updatedInvoice,
      message: "ফি সফলভাবে পরিশোধ হয়েছে এবং রশিদ তৈরি হয়েছে।",
    });
  } catch (error: any) {
    console.error("Payment Processing Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
