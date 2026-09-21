import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || "আগস্ট";
    const year = Number(searchParams.get("year")) || 2026;

    const [salaries, staffUsers] = await Promise.all([
      prisma.staffSalary.findMany({
        where: { institutionId, month, year },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { institutionId, role: { in: ["TEACHER", "MUHTAMIM", "NAZIM_E_TALIMAT", "ACCOUNTANT", "HOSTEL_SUPER"] } },
        select: { id: true, name: true, role: true, phone: true },
      }),
    ]);

    const totalDisbursed = salaries
      .filter((s) => s.paymentStatus === "PAID")
      .reduce((acc, s) => acc + s.totalAmount, 0);

    const pendingDisbursed = salaries
      .filter((s) => s.paymentStatus !== "PAID")
      .reduce((acc, s) => acc + s.totalAmount, 0);

    return NextResponse.json({
      success: true,
      month,
      year,
      salaries,
      staffUsers,
      totalDisbursed,
      pendingDisbursed,
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
          paymentDate: paymentDate || new Date().toISOString().split("T")[0],
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
          paymentDate: paymentDate || new Date().toISOString().split("T")[0],
          notes,
        },
      });

      return NextResponse.json({ success: true, salary });
    }

    if (action === "MARK_PAID") {
      const { salaryId, paymentMethod, paymentDate } = body;
      const updated = await prisma.staffSalary.update({
        where: { id: salaryId },
        data: {
          paymentStatus: "PAID",
          paymentMethod: paymentMethod || "CASH",
          paymentDate: paymentDate || new Date().toISOString().split("T")[0],
        },
      });
      return NextResponse.json({ success: true, salary: updated });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Payroll POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save payroll record" },
      { status: 500 }
    );
  }
}
