import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Return suggested/registered institutions for quick demo login
export async function GET() {
  try {
    const institutions = await prisma.institution.findMany({
      select: {
        id: true,
        code: true,
        nameBn: true,
        nameEn: true,
        arabicName: true,
        address: true,
        phone: true,
        muhtamimName: true,
        users: {
          select: {
            id: true,
            username: true,
            role: true,
          },
          take: 1,
        },
        _count: {
          select: {
            students: true,
            funds: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 6,
    });

    return NextResponse.json({ institutions });
  } catch (error) {
    console.error("Failed to list institutions:", error);
    return NextResponse.json(
      { error: "মাদ্রাসার তালিকা লোড করা সম্ভব হয়নি" },
      { status: 500 }
    );
  }
}

// POST: Handle login, registration, demo-login, and logout
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // ==========================================================
    // 1. LOGOUT
    // ==========================================================
    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        message: "সফলভাবে লগআউট সম্পন্ন হয়েছে",
      });

      // Clear all tenant cookies
      response.cookies.set("madrasa_institution_id", "", {
        path: "/",
        maxAge: 0,
      });
      response.cookies.set("madrasa_user_id", "", {
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    // ==========================================================
    // 2. EXISTING USER LOGIN (By Phone or Username + Password)
    // ==========================================================
    if (action === "login") {
      const { phoneOrUsername, password } = body;

      if (!phoneOrUsername || !phoneOrUsername.trim()) {
        return NextResponse.json(
          { error: "মোবাইল নম্বর অথবা ইউজারনেম দিন" },
          { status: 400 }
        );
      }

      const input = phoneOrUsername.trim();

      // Find user by phone, username, or institution code
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { phone: input },
            { username: input },
            { institution: { code: input } },
            { institution: { phone: { contains: input } } },
          ],
        },
        include: {
          institution: true,
        },
      });

      // If user not directly found, check if institution exists with this phone or code
      if (!user) {
        const institution = await prisma.institution.findFirst({
          where: {
            OR: [
              { code: input },
              { phone: { contains: input } },
            ],
          },
          include: {
            users: {
              include: { institution: true },
            },
          },
        });

        if (institution) {
          // If institution found, find or create admin user for it
          user = institution.users[0] || null;
          if (!user) {
            user = await prisma.user.create({
              data: {
                name: institution.muhtamimName || "মুহতামিম",
                username: institution.code.toLowerCase(),
                password: password?.trim() || "123456",
                phone: institution.phone,
                role: "MUHTAMIM",
                institutionId: institution.id,
              },
              include: { institution: true },
            });
          }
        }
      }

      if (!user || !user.institution) {
        return NextResponse.json(
          { error: "এই মোবাইল নম্বর বা আইডিতে কোনো মাদ্রাসা অ্যাকাউন্ট পাওয়া যায়নি" },
          { status: 404 }
        );
      }

      // Check password if provided (for demo, accept matching password or default 123456)
      if (password && user.password && user.password !== password.trim() && password.trim() !== "123456") {
        return NextResponse.json(
          { error: "পাসওয়ার্ড সঠিক নয়, আবার চেষ্টা করুন" },
          { status: 401 }
        );
      }

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          phone: user.phone,
          role: user.role,
        },
        institution: user.institution,
        message: `${user.institution.nameBn} এ সফলভাবে লগইন হয়েছে`,
      });

      // Set cookies for 1 year
      response.cookies.set("madrasa_institution_id", user.institution.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      response.cookies.set("madrasa_user_id", user.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });

      return response;
    }

    // ==========================================================
    // 3. DEMO QUICK LOGIN (Select from suggested list)
    // ==========================================================
    if (action === "demo-login" || action === "select") {
      const { institutionId } = body;
      if (!institutionId) {
        return NextResponse.json({ error: "মাদ্রাসা নির্বাচন করুন" }, { status: 400 });
      }

      const inst = await prisma.institution.findUnique({
        where: { id: institutionId },
        include: { users: true },
      });

      if (!inst) {
        return NextResponse.json({ error: "মাদ্রাসাটি পাওয়া যায়নি" }, { status: 404 });
      }

      let user = inst.users[0] || null;
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: inst.muhtamimName || "মুহতামিম",
            username: inst.code.toLowerCase(),
            password: "123456",
            phone: inst.phone,
            role: "MUHTAMIM",
            institutionId: inst.id,
          },
        });
      }

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          phone: user.phone,
          role: user.role,
        },
        institution: inst,
        message: `${inst.nameBn} (ডেমো) এ প্রবেশ করা হয়েছে`,
      });

      response.cookies.set("madrasa_institution_id", inst.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      response.cookies.set("madrasa_user_id", user.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });

      return response;
    }

    // ==========================================================
    // 4. CREATE NEW MADRASA & ACCOUNT (Registration)
    // ==========================================================
    if (action === "register") {
      const { nameBn, nameEn, address, phone, muhtamimName, password } = body;

      if (!nameBn || !nameBn.trim()) {
        return NextResponse.json({ error: "মাদ্রাসার বাংলা নাম আবশ্যক" }, { status: 400 });
      }
      if (!phone || !phone.trim()) {
        return NextResponse.json({ error: "মোবাইল নম্বর আবশ্যক (এটি লগইন আইডি হিসেবে কাজ করবে)" }, { status: 400 });
      }

      const cleanPhone = phone.trim();
      const userPassword = password?.trim() || "123456";

      // Check if this phone is already registered to another user
      const existingUser = await prisma.user.findFirst({
        where: { phone: cleanPhone },
        include: { institution: true },
      });

      if (existingUser && existingUser.institution) {
        return NextResponse.json({
          error: `এই মোবাইল নম্বর (${cleanPhone}) দিয়ে পূর্বেই "${existingUser.institution.nameBn}" মাদ্রাসা নিবন্ধিত আছে। অনুগ্রহ করে সরাসরি লগইন করুন।`,
        }, { status: 400 });
      }

      // Generate a unique code
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const code = `MADRASA-${randomSuffix}`;
      const enName = nameEn?.trim() || `Madrasa ${randomSuffix}`;

      // Create new Institution
      const createdInst = await prisma.institution.create({
        data: {
          code,
          nameBn: nameBn.trim(),
          nameEn: enName,
          address: address?.trim() || "ঠিকানা উল্লেখ নেই",
          phone: cleanPhone,
          muhtamimName: muhtamimName?.trim() || "মুহতামিম",
          studentLimit: 2000,
          smsBalance: 500,
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: "STANDARD",
        },
      });

      // Create admin user for this new institution
      const newUser = await prisma.user.create({
        data: {
          name: muhtamimName?.trim() || "মুহতামিম",
          username: cleanPhone,
          phone: cleanPhone,
          password: userPassword,
          role: "MUHTAMIM",
          institutionId: createdInst.id,
        },
      });

      // Auto-provision 4 Shariah Funds
      await prisma.fund.createMany({
        data: [
          {
            code: "GENERAL",
            nameBn: "সাধারণ তহবিল (General Fund)",
            nameEn: "General Fund",
            description: "মাদ্রাসার সাধারণ খরচ ও টিউশন ফি",
            currentBalance: 0,
            institutionId: createdInst.id,
          },
          {
            code: "LILLAH",
            nameBn: "লিল্লাহ ও যাকাত ফান্ড (Lillah/Zakat)",
            nameEn: "Lillah and Zakat Fund",
            description: "এতিম ও দরিদ্র শিক্ষার্থীদের খোরাকি ও কিতাব",
            currentBalance: 0,
            institutionId: createdInst.id,
          },
          {
            code: "MEHMANDARI",
            nameBn: "মেহমানদারি তহবিল (Guest Welfare)",
            nameEn: "Hospitality Fund",
            description: "আগত মেহমান ও বিশেষ আপ্যায়ন",
            currentBalance: 0,
            institutionId: createdInst.id,
          },
          {
            code: "WAQF",
            nameBn: "মসজিদ ও ওয়াকফ ফান্ড (Waqf)",
            nameEn: "Waqf and Mosque Fund",
            description: "মসজিদ ও মাদ্রাসার স্থায়ী অবকাঠামো উন্নয়ন",
            currentBalance: 0,
            institutionId: createdInst.id,
          },
        ],
      });

      // Auto-provision 3 departments
      const hifzDept = await prisma.department.create({
        data: {
          code: "HIFZ",
          nameBn: "হিফজুল কুরআন বিভাগ",
          nameEn: "Hifz Department",
          institutionId: createdInst.id,
        },
      });

      const kitabDept = await prisma.department.create({
        data: {
          code: "KITAB",
          nameBn: "কিতাব বিভাগ",
          nameEn: "Kitab Department",
          institutionId: createdInst.id,
        },
      });

      const nuraniDept = await prisma.department.create({
        data: {
          code: "NURANI",
          nameBn: "নূরানী ও নাজেরা বিভাগ",
          nameEn: "Nurani Department",
          institutionId: createdInst.id,
        },
      });

      // Auto-provision class sessions
      await prisma.classSession.createMany({
        data: [
          {
            nameBn: "হিফজ ১ম জামাত",
            nameEn: "Hifz Class 1",
            monthlyFee: 1500,
            boardingFee: 3000,
            departmentId: hifzDept.id,
            institutionId: createdInst.id,
          },
          {
            nameBn: "নূরানী ১ম শ্রেণি",
            nameEn: "Nurani Class 1",
            monthlyFee: 800,
            boardingFee: 2500,
            departmentId: nuraniDept.id,
            institutionId: createdInst.id,
          },
          {
            nameBn: "মিযান জামাত",
            nameEn: "Mizan Class",
            monthlyFee: 1200,
            boardingFee: 3000,
            departmentId: kitabDept.id,
            institutionId: createdInst.id,
          },
        ],
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
          phone: newUser.phone,
          role: newUser.role,
        },
        institution: createdInst,
        message: `অভিনন্দন! আপনার মাদ্রাসার আইডি সফলভাবে তৈরি হয়েছে`,
      });

      // Set cookies for 1 year
      response.cookies.set("madrasa_institution_id", createdInst.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });
      response.cookies.set("madrasa_user_id", newUser.id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Auth action error:", error);
    return NextResponse.json(
      { error: error?.message || "সার্ভারে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
