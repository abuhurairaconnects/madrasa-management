import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";

const MONTH_ORDER: Record<string, number> = {
  "জানুয়ারি": 1,
  "ফেব্রুয়ারি": 2,
  "মার্চ": 3,
  "এপ্রিল": 4,
  "মে": 5,
  "জুন": 6,
  "জুলাই": 7,
  "আগস্ট": 8,
  "সেপ্টেম্বর": 9,
  "অক্টোবর": 10,
  "নভেম্বর": 11,
  "ডিসেম্বর": 12,
};

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || "সেপ্টেম্বর";
    const year = Number(searchParams.get("year")) || 2026;

    const [institution, salaries, staffUsers, allSalaries] = await Promise.all([
      prisma.institution.findUnique({
        where: { id: institutionId },
        select: {
          id: true,
          nameBn: true,
          nameEn: true,
          arabicName: true,
          address: true,
          phone: true,
          muhtamimName: true,
          logo: true,
        },
      }),
      prisma.staffSalary.findMany({
        where: { institutionId, month, year },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: {
          institutionId,
          role: { in: ["TEACHER", "MUHTAMIM", "NAZIM_E_TALIMAT", "ACCOUNTANT", "HOSTEL_SUPER"] },
        },
        select: { id: true, name: true, role: true, phone: true, username: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.staffSalary.findMany({
        where: { institutionId },
        select: {
          id: true,
          month: true,
          year: true,
          basicSalary: true,
          housingAllowance: true,
          foodAllowance: true,
          bonus: true,
          deduction: true,
          totalAmount: true,
          paymentStatus: true,
          paymentDate: true,
        },
        orderBy: [{ year: "desc" }],
      }),
    ]);

    // Current selected month sums
    const totalDisbursed = salaries
      .filter((s) => s.paymentStatus === "PAID")
      .reduce((acc, s) => acc + s.totalAmount, 0);

    const pendingDisbursed = salaries
      .filter((s) => s.paymentStatus !== "PAID")
      .reduce((acc, s) => acc + s.totalAmount, 0);

    const totalSalaryExpense = salaries.reduce((acc, s) => acc + s.totalAmount, 0);
    const totalBasicSalary = salaries.reduce((acc, s) => acc + s.basicSalary, 0);
    const totalAllowances = salaries.reduce(
      (acc, s) => acc + s.housingAllowance + s.foodAllowance + s.bonus,
      0
    );
    const totalDeduction = salaries.reduce((acc, s) => acc + s.deduction, 0);

    // Group allSalaries by month & year for Full History Tab
    const historyMap = new Map<string, any>();

    for (const item of allSalaries) {
      const key = `${item.year}-${item.month}`;
      if (!historyMap.has(key)) {
        historyMap.set(key, {
          month: item.month,
          year: item.year,
          monthOrder: MONTH_ORDER[item.month] || 0,
          staffCount: 0,
          totalBasic: 0,
          totalAllowances: 0,
          totalBonus: 0,
          totalDeduction: 0,
          totalAmount: 0,
          paidAmount: 0,
          pendingAmount: 0,
          lastPaymentDate: item.paymentDate,
        });
      }

      const h = historyMap.get(key);
      h.staffCount += 1;
      h.totalBasic += item.basicSalary;
      h.totalAllowances += item.housingAllowance + item.foodAllowance;
      h.totalBonus += item.bonus;
      h.totalDeduction += item.deduction;
      h.totalAmount += item.totalAmount;

      if (item.paymentStatus === "PAID") {
        h.paidAmount += item.totalAmount;
      } else {
        h.pendingAmount += item.totalAmount;
      }

      if (item.paymentDate && (!h.lastPaymentDate || item.paymentDate > h.lastPaymentDate)) {
        h.lastPaymentDate = item.paymentDate;
      }
    }

    const history = Array.from(historyMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.monthOrder - a.monthOrder;
    });

    return NextResponse.json({
      success: true,
      institution: institution || {
        nameBn: "দারুল উলুম হাফিজিয়া কওমিয়া মাদ্রাসা",
        address: "দীঘি সগুনা , তাড়াশ, সিরাজগঞ্জ",
        phone: "01869171818",
        muhtamimName: "মাওলানা মোহাম্মদ আবু হুরায়রা",
      },
      month,
      year,
      salaries,
      staffUsers,
      totalDisbursed,
      pendingDisbursed,
      totalSalaryExpense,
      totalBasicSalary,
      totalAllowances,
      totalDeduction,
      history,
    });
  } catch (error: any) {
    console.error("Payroll GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load payroll data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const { action } = body;

    // 1. Single Salary Create / Update
    if (action === "CREATE_SALARY") {
      const {
        userId,
        month,
        year,
        basicSalary,
        housingAllowance,
        foodAllowance,
        bonus,
        deduction,
        paymentStatus,
        paymentMethod,
        paymentDate,
        notes,
      } = body;

      const basic = Number(basicSalary) || 0;
      const housing = Number(housingAllowance) || 0;
      const food = Number(foodAllowance) || 0;
      const bns = Number(bonus) || 0;
      const ded = Number(deduction) || 0;
      const total = basic + housing + food + bns - ded;

      const salary = await prisma.staffSalary.upsert({
        where: {
          institutionId_userId_month_year: {
            institutionId,
            userId,
            month,
            year: Number(year),
          },
        },
        update: {
          basicSalary: basic,
          housingAllowance: housing,
          foodAllowance: food,
          bonus: bns,
          deduction: ded,
          totalAmount: total,
          paymentStatus: paymentStatus || "PAID",
          paymentMethod: paymentMethod || "CASH",
          paymentDate: paymentDate || (paymentStatus === "PAID" ? new Date().toISOString().split("T")[0] : null),
          notes,
        },
        create: {
          institutionId,
          userId,
          month,
          year: Number(year),
          basicSalary: basic,
          housingAllowance: housing,
          foodAllowance: food,
          bonus: bns,
          deduction: ded,
          totalAmount: total,
          paymentStatus: paymentStatus || "PAID",
          paymentMethod: paymentMethod || "CASH",
          paymentDate: paymentDate || (paymentStatus === "PAID" ? new Date().toISOString().split("T")[0] : null),
          notes,
        },
        include: { user: true },
      });

      return NextResponse.json({ success: true, salary });
    }

    // 2. Mark specific salary as PAID
    if (action === "MARK_PAID") {
      const { salaryId, paymentMethod, paymentDate } = body;
      const updated = await prisma.staffSalary.update({
        where: { id: salaryId },
        data: {
          paymentStatus: "PAID",
          paymentMethod: paymentMethod || "CASH",
          paymentDate: paymentDate || new Date().toISOString().split("T")[0],
        },
        include: { user: true },
      });
      return NextResponse.json({ success: true, salary: updated });
    }

    // 3. Bulk Generate Payroll for all staff members for the selected month/year
    if (action === "BULK_GENERATE") {
      const { month, year, defaultStatus = "PAID", paymentMethod = "CASH" } = body;
      const staffUsers = await prisma.user.findMany({
        where: {
          institutionId,
          role: { in: ["TEACHER", "MUHTAMIM", "NAZIM_E_TALIMAT", "ACCOUNTANT", "HOSTEL_SUPER"] },
        },
      });

      const todayStr = new Date().toISOString().split("T")[0];
      let createdCount = 0;

      for (const staff of staffUsers) {
        // Find existing or last salary to carry over basic & allowances
        const lastSalary = await prisma.staffSalary.findFirst({
          where: { institutionId, userId: staff.id },
          orderBy: { createdAt: "desc" },
        });

        const basic = lastSalary?.basicSalary ?? (staff.role === "MUHTAMIM" ? 35000 : staff.role === "NAZIM_E_TALIMAT" ? 22000 : staff.role === "ACCOUNTANT" ? 16000 : 15000);
        const housing = lastSalary?.housingAllowance ?? (basic >= 20000 ? 3000 : 2000);
        const food = lastSalary?.foodAllowance ?? 2000;
        const total = basic + housing + food;

        await prisma.staffSalary.upsert({
          where: {
            institutionId_userId_month_year: {
              institutionId,
              userId: staff.id,
              month,
              year: Number(year),
            },
          },
          update: {}, // don't overwrite if already exists
          create: {
            institutionId,
            userId: staff.id,
            month,
            year: Number(year),
            basicSalary: basic,
            housingAllowance: housing,
            foodAllowance: food,
            bonus: 0,
            deduction: 0,
            totalAmount: total,
            paymentStatus: defaultStatus,
            paymentMethod: paymentMethod,
            paymentDate: defaultStatus === "PAID" ? todayStr : null,
            notes: `${month} ${year} নিয়মিত বেতন শিট`,
          },
        });
        createdCount++;
      }

      return NextResponse.json({ success: true, count: createdCount });
    }

    // 4. Add a new Staff Member / Employee into Madrasa
    if (action === "ADD_STAFF") {
      const { name, role, phone, basicSalary, housingAllowance, foodAllowance } = body;
      if (!name || !role) {
        return NextResponse.json({ success: false, error: "নাম ও পদবী আবশ্যক" }, { status: 400 });
      }

      const count = await prisma.user.count({ where: { institutionId } });
      const username = phone?.trim() || `staff_${institutionId.slice(0, 5)}_${count + 1}`;

      const user = await prisma.user.create({
        data: {
          institutionId,
          name,
          role,
          phone: phone || null,
          username,
          password: "password123",
        },
      });

      // Also create initial salary record if current month/year provided
      if (body.currentMonth && body.currentYear && basicSalary) {
        const basic = Number(basicSalary) || 15000;
        const housing = Number(housingAllowance) || 0;
        const food = Number(foodAllowance) || 0;
        await prisma.staffSalary.create({
          data: {
            institutionId,
            userId: user.id,
            month: body.currentMonth,
            year: Number(body.currentYear),
            basicSalary: basic,
            housingAllowance: housing,
            foodAllowance: food,
            bonus: 0,
            deduction: 0,
            totalAmount: basic + housing + food,
            paymentStatus: "PAID",
            paymentMethod: "CASH",
            paymentDate: new Date().toISOString().split("T")[0],
            notes: "নতুন জয়েনিং ও নিয়মিত বেতন",
          },
        });
      }

      return NextResponse.json({ success: true, user });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Payroll POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payroll request" },
      { status: 500 }
    );
  }
}
