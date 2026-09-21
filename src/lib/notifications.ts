import { prisma } from "./prisma";

export interface NotificationPayload {
  institutionId: string;
  recipientPhone: string;
  recipientName: string;
  message: string;
  smsType: "ATTENDANCE" | "DUE_ALERT" | "HIFZ_UPDATE" | "GENERAL_NOTICE";
}

/**
 * Dispatch SMS Notification (Simulated or Live Gateway) and log to database
 */
export async function sendNotification(payload: NotificationPayload) {
  const provider = process.env.SMS_GATEWAY_PROVIDER || "SIMULATED";
  let status = "SIMULATED";

  try {
    if (provider === "SIMULATED") {
      console.log(`[SMS SIMULATION to ${payload.recipientPhone}]: ${payload.message}`);
      status = "SIMULATED";
    } else if (provider === "GREENWEB" && process.env.SMS_API_KEY) {
      // Live Greenweb SMS Gateway integration
      const params = new URLSearchParams({
        token: process.env.SMS_API_KEY,
        to: payload.recipientPhone,
        message: payload.message,
      });
      const response = await fetch(`http://api.greenweb.com.bd/api.php?${params.toString()}`);
      const text = await response.text();
      status = text.includes("Ok") ? "SENT" : "FAILED";
    } else {
      console.log(`[SMS Gateway ${provider} (mock sent)]: ${payload.message}`);
      status = "SENT";
    }

    // Record in SmsLog
    const log = await prisma.smsLog.create({
      data: {
        institutionId: payload.institutionId,
        recipientPhone: payload.recipientPhone,
        recipientName: payload.recipientName,
        message: payload.message,
        smsType: payload.smsType,
        status: status,
      },
    });

    // Deduct SMS credit from Institution if sent
    if (status === "SENT" || status === "SIMULATED") {
      await prisma.institution.update({
        where: { id: payload.institutionId },
        data: {
          smsBalance: { decrement: 1 },
        },
      }).catch(() => {
        // Ignore if decrement fails
      });
    }

    return { success: true, logId: log.id, status };
  } catch (error: any) {
    console.error("SMS notification dispatch failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Trigger Student Attendance Notification
 */
export async function sendAttendanceAlert(
  institutionId: string,
  institutionName: string,
  studentName: string,
  guardianPhone: string,
  status: "ABSENT" | "LATE" | "LEAVE"
) {
  if (!guardianPhone) return;
  const statusBn = status === "ABSENT" ? "অনুপস্থিত" : status === "LATE" ? "দেরিতে উপস্থিত" : "ছুটিতে";
  const message = `মুহতারাম অভিভাবক, আপনার সন্তান ${studentName} আজকের ক্লাসে ${statusBn} রয়েছে। - ${institutionName}`;

  return sendNotification({
    institutionId,
    recipientPhone: guardianPhone,
    recipientName: studentName,
    message,
    smsType: "ATTENDANCE",
  });
}

/**
 * Trigger Monthly Due Fee Reminder
 */
export async function sendDueFeeReminder(
  institutionId: string,
  institutionName: string,
  studentName: string,
  guardianPhone: string,
  dueAmount: number,
  month: string
) {
  if (!guardianPhone) return;
  const message = `মুহতারাম অভিভাবক, ${studentName}-এর ${month} মাসের বকেয়া ফি ৳${dueAmount} পরিশোধের জন্য অনুরোধ করা হলো। - ${institutionName}`;

  return sendNotification({
    institutionId,
    recipientPhone: guardianPhone,
    recipientName: studentName,
    message,
    smsType: "DUE_ALERT",
  });
}

/**
 * Trigger Daily Hifz Progress Update
 */
export async function sendHifzProgressAlert(
  institutionId: string,
  institutionName: string,
  studentName: string,
  guardianPhone: string,
  paraNo: number,
  pageNo: number,
  qualityBn: string
) {
  if (!guardianPhone) return;
  const message = `মাশাআল্লাহ! ${studentName} আজ হিফজের পারা ${paraNo}, পৃষ্ঠা ${pageNo} (${qualityBn}) সম্পন্ন করেছে। - ${institutionName}`;

  return sendNotification({
    institutionId,
    recipientPhone: guardianPhone,
    recipientName: studentName,
    message,
    smsType: "HIFZ_UPDATE",
  });
}
