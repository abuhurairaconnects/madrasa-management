import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cacheDel } from "@/lib/redis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      code,
      nameBn,
      nameEn,
      address,
      phone,
      muhtamimName,
      studentLimit = 2000,
      smsBalance = 1000,
      subscriptionPlan = "STANDARD",
    } = body;

    if (!code || !nameBn || !phone) {
      return NextResponse.json(
        { error: "মাদ্রাসার কোড, বাংলা নাম এবং ফোন নম্বর আবশ্যক" },
        { status: 400 }
      );
    }

    const existing = await prisma.institution.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: "এই কোডের মাদ্রাসা ইতিমধ্যে নিবন্ধিত আছে" },
        { status: 400 }
      );
    }

    const institution = await prisma.institution.create({
      data: {
        code: code.toUpperCase(),
        nameBn,
        nameEn: nameEn || nameBn,
        address: address || "বাংলাদেশ",
        phone,
        muhtamimName,
        studentLimit: Number(studentLimit),
        smsBalance: Number(smsBalance),
        subscriptionPlan,
        subscriptionStatus: "ACTIVE",
        subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      },
    });

    // Create default Muhtamim user
    await prisma.user.create({
      data: {
        institutionId: institution.id,
        name: muhtamimName || "মাদ্রাসা মুহতামিম",
        username: `admin_${code.toLowerCase()}`,
        password: "password123",
        phone,
        role: "MUHTAMIM",
      },
    });

    // Invalidate superadmin cache
    await cacheDel("superadmin:overview");

    return NextResponse.json({ success: true, institution }, { status: 201 });
  } catch (error: any) {
    console.error("Institution registration failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, value } = body;

    if (!id || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    let updateData: any = {};

    if (action === "TOGGLE_STATUS") {
      updateData.subscriptionStatus = value; // ACTIVE or SUSPENDED
    } else if (action === "ADD_SMS") {
      updateData.smsBalance = { increment: Number(value) };
    } else if (action === "UPDATE_STUDENT_LIMIT") {
      updateData.studentLimit = Number(value);
    }

    const updated = await prisma.institution.update({
      where: { id },
      data: updateData,
    });

    await cacheDel("superadmin:overview");

    return NextResponse.json({ success: true, institution: updated });
  } catch (error: any) {
    console.error("Institution update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
