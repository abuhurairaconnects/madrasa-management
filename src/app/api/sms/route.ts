import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";
import { sendNotification } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);

    const logs = await prisma.smsLog.findMany({
      where: { institutionId },
      take: 20,
      orderBy: { sentAt: "desc" },
    });

    const dueStudents = await prisma.feeInvoice.findMany({
      where: { institutionId, dueAmount: { gt: 0 } },
      include: { student: true },
      take: 10,
    });

    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      select: { smsBalance: true, nameBn: true },
    });

    return NextResponse.json({ logs, dueStudents, institution });
  } catch (error) {
    console.error("SMS GET error:", error);
    return NextResponse.json({ error: "Failed to fetch SMS data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const { recipientPhone, recipientName, message, smsType } = body;

    if (!recipientPhone || !message) {
      return NextResponse.json({ error: "মোবাইল নম্বর ও বার্তা আবশ্যক" }, { status: 400 });
    }

    const result = await sendNotification({
      institutionId,
      recipientPhone,
      recipientName: recipientName || "অভিভাবক",
      message,
      smsType: smsType || "GENERAL_NOTICE",
    });

    return NextResponse.json({
      success: result.success,
      status: result.status,
      message: "বার্তাটি সফলভাবে সিমুলেট/প্রেরণ করা হয়েছে!",
    });
  } catch (error) {
    console.error("SMS POST error:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
