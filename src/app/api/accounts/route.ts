import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";
import { cacheDel } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const fundId = searchParams.get("fundId");
    const type = searchParams.get("type");

    const whereClause: Record<string, unknown> = {
      institutionId,
    };
    if (fundId && fundId !== "ALL") whereClause.fundId = fundId;
    if (type && type !== "ALL") whereClause.type = type;

    const funds = await prisma.fund.findMany({
      where: { institutionId },
      include: {
        transactions: {
          take: 5,
          orderBy: { date: "desc" },
        },
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: { fund: true },
      orderBy: { createdAt: "desc" },
    });

    const totalBalance = funds.reduce((acc, f) => acc + f.currentBalance, 0);

    return NextResponse.json({ funds, transactions, totalBalance });
  } catch (error) {
    console.error("Accounts GET error:", error);
    return NextResponse.json({ error: "Failed to fetch accounts data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const {
      fundId,
      type, // INCOME or EXPENSE
      category,
      amount,
      description,
      donorName,
      donorPhone,
      paymentMethod,
      date,
      performedBy,
    } = body;

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: "সঠিক টাকার পরিমাণ দিন" }, { status: 400 });
    }

    const fund = await prisma.fund.findFirst({
      where: { id: fundId, institutionId },
    });
    if (!fund) {
      return NextResponse.json({ error: "তহবিল পাওয়া যায়নি" }, { status: 404 });
    }

    if (type === "EXPENSE" && fund.currentBalance < parsedAmount) {
      return NextResponse.json(
        { error: `তহবিলে পর্যাপ্ত ব্যালেন্স নেই। বর্তমান স্থিতি: ৳${fund.currentBalance}` },
        { status: 400 }
      );
    }

    const count = await prisma.transaction.count({ where: { institutionId } });
    const prefix =
      fund.code === "LILLAH_ZAKAT"
        ? "LIL"
        : fund.code === "GENERAL"
        ? "GEN"
        : fund.code === "HOSPITALITY"
        ? "HOS"
        : "WQF";
    const voucherNo = `V-${prefix}-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

    const newTransaction = await prisma.transaction.create({
      data: {
        institutionId,
        voucherNo,
        fundId,
        type,
        category,
        amount: parsedAmount,
        description,
        donorName: donorName || null,
        donorPhone: donorPhone || null,
        paymentMethod: paymentMethod || "CASH",
        date: date || new Date().toISOString().split("T")[0],
        performedBy: performedBy || "ক্যাশিয়ার",
      },
      include: { fund: true },
    });

    // Update fund balance
    const balanceChange = type === "INCOME" ? parsedAmount : -parsedAmount;
    await prisma.fund.update({
      where: { id: fundId },
      data: { currentBalance: { increment: balanceChange } },
    });

    await cacheDel(`institution:${institutionId}:dashboard`);

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("Accounts POST error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}
