import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentInstitutionId } from "@/lib/tenant";

export async function GET(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const [buildings, boardingStudents, mealRecords] = await Promise.all([
      prisma.hostelBuilding.findMany({
        where: { institutionId },
        include: {
          rooms: {
            include: {
              beds: {
                include: {
                  student: {
                    include: { classSession: true },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.student.findMany({
        where: { institutionId, isBoarding: true },
        include: { classSession: true, hostelBeds: true },
      }),
      prisma.mealRecord.findMany({
        where: { institutionId, date },
        include: { student: { include: { classSession: true } } },
      }),
    ]);

    // Calculate totals
    let totalBeds = 0;
    let occupiedBeds = 0;
    buildings.forEach((b) => {
      b.rooms.forEach((r) => {
        totalBeds += r.beds.length;
        occupiedBeds += r.beds.filter((bed) => bed.isOccupied).length;
      });
    });

    const totalBreakfast = mealRecords.filter((m) => m.breakfast).length;
    const totalLunch = mealRecords.filter((m) => m.lunch).length;
    const totalDinner = mealRecords.filter((m) => m.dinner).length;
    const totalGuest = mealRecords.reduce((acc, m) => acc + (m.guestMeals || 0), 0);

    return NextResponse.json({
      success: true,
      date,
      buildings,
      boardingStudents,
      mealRecords,
      stats: {
        totalBeds,
        occupiedBeds,
        freeBeds: totalBeds - occupiedBeds,
        totalBoardingStudents: boardingStudents.length,
        totalBreakfast,
        totalLunch,
        totalDinner,
        totalGuest,
      },
    });
  } catch (error: any) {
    console.error("Hostel GET Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load hostel data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const institutionId = await getCurrentInstitutionId(request);
    const body = await request.json();
    const { action } = body;

    if (action === "ALLOCATE_BED") {
      const { bedId, studentId } = body;
      const bed = await prisma.hostelBed.update({
        where: { id: bedId },
        data: {
          studentId,
          isOccupied: true,
        },
      });
      return NextResponse.json({ success: true, bed });
    }

    if (action === "VACATE_BED") {
      const { bedId } = body;
      const bed = await prisma.hostelBed.update({
        where: { id: bedId },
        data: {
          studentId: null,
          isOccupied: false,
        },
      });
      return NextResponse.json({ success: true, bed });
    }

    if (action === "TOGGLE_MEAL") {
      const { studentId, date, mealType, currentVal } = body;
      const existing = await prisma.mealRecord.findFirst({
        where: { institutionId, studentId, date },
      });

      if (existing) {
        const updated = await prisma.mealRecord.update({
          where: { id: existing.id },
          data: {
            [mealType]: !currentVal,
          },
        });
        return NextResponse.json({ success: true, record: updated });
      } else {
        const created = await prisma.mealRecord.create({
          data: {
            institutionId,
            studentId,
            date,
            breakfast: mealType === "breakfast" ? true : false,
            lunch: mealType === "lunch" ? true : false,
            dinner: mealType === "dinner" ? true : false,
            guestMeals: 0,
          },
        });
        return NextResponse.json({ success: true, record: created });
      }
    }

    if (action === "RECORD_GUEST_MEAL") {
      const { date, count, notes } = body;
      const record = await prisma.mealRecord.create({
        data: {
          institutionId,
          date,
          breakfast: false,
          lunch: false,
          dinner: false,
          guestMeals: Number(count) || 1,
          notes,
        },
      });
      return NextResponse.json({ success: true, record });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Hostel POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save hostel record" },
      { status: 500 }
    );
  }
}
