import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Multi-Tenant Database Seeding...");

  // 1. Super Admin User
  await prisma.user.upsert({
    where: { username: "superadmin" },
    update: {},
    create: {
      name: "সেন্ট্রাল সিস্টেম এডমিন",
      username: "superadmin",
      password: "adminpassword",
      phone: "01700000000",
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Super Admin created (username: superadmin)");

  // 2. Institution 1: Jamia Islamia
  const inst1 = await prisma.institution.upsert({
    where: { code: "JAMIA-01" },
    update: {},
    create: {
      code: "JAMIA-01",
      nameBn: "জামিয়া ইসলামিয়া দারুল উলূম ও হিফজখানা",
      nameEn: "Jamia Islamia Darul Uloom & Hifz Madrasah",
      arabicName: "الجامعة الإسلامية دار العلوم وتحفيظ القرآن",
      address: "জামিয়া রোড, সেকশন-২, মিরপুর, ঢাকা-১২১৬",
      phone: "০১৭১২-৩৪৫৬৭৮, ০১৮১৯-৮৭৬৫৪৩",
      email: "darululoom.mirpur@gmail.com",
      muhtamimName: "মাওলানা মুফতি আবু বকর সিদ্দিক",
      establishedYear: "১৯৯৮",
      receiptFooter: "আল্লাহ পাক আপনার দান ও অর্থ কবুল করুন। জাযাকুমুল্লাহু খাইরান।",
      studentLimit: 2000,
      smsBalance: 1450,
      storageUsedBytes: 52428800, // ~50MB
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "ENTERPRISE",
      subscriptionExpiresAt: new Date("2027-12-31"),
    },
  });

  // 3. Institution 2: Darul Quran
  const inst2 = await prisma.institution.upsert({
    where: { code: "DARUL-02" },
    update: {},
    create: {
      code: "DARUL-02",
      nameBn: "দারুল কুরআন কওমি মাদ্রাসা ও এতিমখানা",
      nameEn: "Darul Quran Qawmi Madrasa & Orphanage",
      arabicName: "دار القرآن الكريم والميتم الإسلامي",
      address: "উত্তরা মডেল টাউন, সেক্টর-৭, ঢাকা",
      phone: "০১৯১১-২২৩৩৪৪",
      email: "darulquran.uttara@gmail.com",
      muhtamimName: "মাওলানা আব্দুল করিম কাসেমী",
      establishedYear: "২০০৮",
      receiptFooter: "এতিম ও অসহায় শিক্ষার্থীদের পাশে দাঁড়ানোর জন্য ধন্যবাদ।",
      studentLimit: 1000,
      smsBalance: 780,
      storageUsedBytes: 26214400, // ~25MB
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "STANDARD",
      subscriptionExpiresAt: new Date("2027-06-30"),
    },
  });

  console.log(`✅ Institutions created: ${inst1.nameBn} (${inst1.code}) and ${inst2.nameBn} (${inst2.code})`);

  // Helper to seed an institution
  async function seedInstitutionData(inst: typeof inst1) {
    // Users
    const muhtamim = await prisma.user.upsert({
      where: { username: `muhtamim_${inst.code.toLowerCase()}` },
      update: {},
      create: {
        institutionId: inst.id,
        name: inst.muhtamimName || "প্রধান মুহতামিম",
        username: `muhtamim_${inst.code.toLowerCase()}`,
        password: "password123",
        role: "MUHTAMIM",
        phone: inst.phone.split(",")[0].trim(),
      },
    });

    const accountant = await prisma.user.upsert({
      where: { username: `accountant_${inst.code.toLowerCase()}` },
      update: {},
      create: {
        institutionId: inst.id,
        name: "হাফেজ এনামুল হক (হিসাবরক্ষক)",
        username: `accountant_${inst.code.toLowerCase()}`,
        password: "password123",
        role: "ACCOUNTANT",
        phone: "01733987654",
      },
    });

    const teacher = await prisma.user.upsert({
      where: { username: `teacher_${inst.code.toLowerCase()}` },
      update: {},
      create: {
        institutionId: inst.id,
        name: "মাওলানা মোকাররম হোসেন (শিক্ষক)",
        username: `teacher_${inst.code.toLowerCase()}`,
        password: "password123",
        role: "TEACHER",
        phone: "01812112233",
      },
    });

    // Departments
    const deptNoorani = await prisma.department.upsert({
      where: {
        institutionId_code: {
          institutionId: inst.id,
          code: "NOORANI",
        },
      },
      update: {},
      create: {
        institutionId: inst.id,
        nameBn: "নূরানী ও নাজেরা বিভাগ",
        nameEn: "Noorani & Nazera Department",
        code: "NOORANI",
      },
    });

    const deptHifz = await prisma.department.upsert({
      where: {
        institutionId_code: {
          institutionId: inst.id,
          code: "HIFZ",
        },
      },
      update: {},
      create: {
        institutionId: inst.id,
        nameBn: "হিফজুল কুরআন বিভাগ",
        nameEn: "Hifzul Quran Department",
        code: "HIFZ",
      },
    });

    // Classes
    const classNoorani1 = await prisma.classSession.create({
      data: {
        institutionId: inst.id,
        departmentId: deptNoorani.id,
        nameBn: "নূরানী ১ম জামাত (গ্রুপ-ক)",
        nameEn: "Noorani 1st Year (Group A)",
        monthlyFee: 1200,
        boardingFee: 2500,
      },
    });

    const classHifz = await prisma.classSession.create({
      data: {
        institutionId: inst.id,
        departmentId: deptHifz.id,
        nameBn: "হিফজ বিভাগ (গ্রুপ-১)",
        nameEn: "Hifz Section A",
        monthlyFee: 1500,
        boardingFee: 3000,
      },
    });

    // Funds
    const fundGeneral = await prisma.fund.upsert({
      where: {
        institutionId_code: {
          institutionId: inst.id,
          code: "GENERAL",
        },
      },
      update: { currentBalance: 125000 },
      create: {
        institutionId: inst.id,
        nameBn: "সাধারণ তহবিল",
        nameEn: "General Fund",
        code: "GENERAL",
        currentBalance: 125000,
      },
    });

    const fundLillah = await prisma.fund.upsert({
      where: {
        institutionId_code: {
          institutionId: inst.id,
          code: "LILLAH_ZAKAT",
        },
      },
      update: { currentBalance: 85000 },
      create: {
        institutionId: inst.id,
        nameBn: "লিল্লাহ ও যাকাত ফান্ড",
        nameEn: "Lillah & Zakat Fund",
        code: "LILLAH_ZAKAT",
        currentBalance: 85000,
      },
    });

    // Guardians & Students Sample
    const studentData = [
      {
        id: `${inst.code}-S001`,
        name: "মোহাম্মদ আব্দুল্লাহ",
        father: "মোঃ রফিকুল ইসলাম",
        phone: "01711223344",
        isBoarding: true,
        classId: classHifz.id,
        deptId: deptHifz.id,
        sabaqPara: 5,
        sabaqPage: 12,
        due: 1500,
      },
      {
        id: `${inst.code}-S002`,
        name: "মুহাম্মদ উমর ফারুক",
        father: "হাফেজ মাওলানা জাহিদুল হক",
        phone: "01822334455",
        isBoarding: true,
        classId: classHifz.id,
        deptId: deptHifz.id,
        sabaqPara: 14,
        sabaqPage: 8,
        due: 0,
      },
      {
        id: `${inst.code}-S003`,
        name: "আব্দুর রহমান শাকিল",
        father: "মোঃ কবির হোসেন",
        phone: "01933445566",
        isBoarding: false,
        classId: classNoorani1.id,
        deptId: deptNoorani.id,
        sabaqPara: 1,
        sabaqPage: 3,
        due: 1200,
      },
      {
        id: `${inst.code}-S004`,
        name: "মুহাম্মদ হাসান মাহমুদ",
        father: "মরহুম আব্দুল খালেক",
        phone: "01744556677",
        isBoarding: true,
        isOrphan: true,
        classId: classHifz.id,
        deptId: deptHifz.id,
        sabaqPara: 22,
        sabaqPage: 15,
        due: 0,
      },
    ];

    for (const s of studentData) {
      // Guardian
      const guardian = await prisma.guardian.upsert({
        where: {
          institutionId_phone: {
            institutionId: inst.id,
            phone: s.phone,
          },
        },
        update: {},
        create: {
          institutionId: inst.id,
          name: s.father,
          phone: s.phone,
          pin: "1234",
        },
      });

      // Student
      const student = await prisma.student.upsert({
        where: {
          institutionId_studentId: {
            institutionId: inst.id,
            studentId: s.id,
          },
        },
        update: {},
        create: {
          institutionId: inst.id,
          studentId: s.id,
          nameBn: s.name,
          fatherName: s.father,
          guardianPhone: s.phone,
          guardianId: guardian.id,
          admissionDate: "2026-01-10",
          isBoarding: s.isBoarding,
          isOrphan: s.isOrphan || false,
          monthlyTuitionFee: 1200,
          monthlyBoardingFee: s.isBoarding ? 2500 : 0,
          departmentId: s.deptId,
          classId: s.classId,
          status: "ACTIVE",
        },
      });

      // Attendance record
      await prisma.attendance.create({
        data: {
          institutionId: inst.id,
          date: new Date().toISOString().split("T")[0],
          studentId: student.id,
          classId: s.classId,
          status: "PRESENT",
        },
      });

      // Hifz record if in Hifz dept
      if (s.deptId === deptHifz.id) {
        await prisma.hifzRecord.create({
          data: {
            institutionId: inst.id,
            studentId: student.id,
            date: new Date().toISOString().split("T")[0],
            sabaqPara: s.sabaqPara,
            sabaqSurah: "আল-বাক্বারাহ",
            sabaqPage: s.sabaqPage,
            sabaqQuality: "MUMTAZ",
            sabaqiPages: "হাফ পারা",
            sabaqiQuality: "JAYYID_JIDDAN",
            amukhtaParas: "পারা ১-২",
            totalParasMemorized: s.sabaqPara,
            teacherId: teacher.id,
            notes: "মাশাআল্লাহ খুবই মনোযোগী ও সুন্দর তেলাওয়াত।",
          },
        });
      }

      // Invoice
      const invoiceNo = `INV-${inst.code}-${Math.floor(1000 + Math.random() * 9000)}`;
      await prisma.feeInvoice.create({
        data: {
          institutionId: inst.id,
          invoiceNo,
          studentId: student.id,
          month: "সেপ্টেম্বর",
          year: 2026,
          tuitionFee: 1200,
          boardingFee: s.isBoarding ? 2500 : 0,
          totalAmount: s.isBoarding ? 3700 : 1200,
          paidAmount: s.due === 0 ? (s.isBoarding ? 3700 : 1200) : 0,
          dueAmount: s.due,
          status: s.due === 0 ? "PAID" : "UNPAID",
          paymentMethod: s.due === 0 ? "CASH" : "ONLINE",
          receivedDate: new Date().toISOString().split("T")[0],
        },
      });
    }

    // Notice
    await prisma.notice.create({
      data: {
        institutionId: inst.id,
        title: "আসন্ন সাময়িক পরীক্ষা ও বকেয়া ফি পরিশোধ প্রসঙ্গে",
        content: "সকল অভিভাবক ও শিক্ষার্থীদের জানানো যাচ্ছে যে, আগামী মাসের প্রথম সপ্তাহ থেকে সাময়িক পরীক্ষা শুরু হবে। অনুগ্রহ করে পরীক্ষার পূর্বেই সকল বকেয়া পরিশোধ করুন।",
        category: "EXAM",
        isUrgent: true,
        publishedDate: new Date().toISOString().split("T")[0],
      },
    });

    // ------------------------------------------------------------------------
    // NEW: Module 3 - Academic (Subjects, Routine, Exams, Marks)
    // ------------------------------------------------------------------------
    const allClasses = await prisma.classSession.findMany({
      where: { institutionId: inst.id },
    });

    const createdSubjects: any[] = [];
    for (const cls of allClasses) {
      const s1 = await prisma.subject.upsert({
        where: { classId_nameBn: { classId: cls.id, nameBn: "কুরআন মাজীদ ও তাজবীদ" } },
        update: {},
        create: {
          institutionId: inst.id,
          classId: cls.id,
          nameBn: "কুরআন মাজীদ ও তাজবীদ",
          nameEn: "Holy Quran & Tajweed",
          code: "QRN-101",
          totalMarks: 100,
          passMarks: 40,
          teacherId: teacher.id,
        },
      });
      const s2 = await prisma.subject.upsert({
        where: { classId_nameBn: { classId: cls.id, nameBn: "ইসলামিক ফিকহ ও মাসায়েল" } },
        update: {},
        create: {
          institutionId: inst.id,
          classId: cls.id,
          nameBn: "ইসলামিক ফিকহ ও মাসায়েল",
          nameEn: "Islamic Fiqh & Masa'il",
          code: "FQH-102",
          totalMarks: 100,
          passMarks: 40,
          teacherId: teacher.id,
        },
      });
      const s3 = await prisma.subject.upsert({
        where: { classId_nameBn: { classId: cls.id, nameBn: "আরবি ব্যাকরণ ও ভাষা" } },
        update: {},
        create: {
          institutionId: inst.id,
          classId: cls.id,
          nameBn: "আরবি ব্যাকরণ ও ভাষা",
          nameEn: "Arabic Grammar & Language",
          code: "ARB-103",
          totalMarks: 100,
          passMarks: 40,
          teacherId: teacher.id,
        },
      });
      createdSubjects.push(s1, s2, s3);

      // Routines
      await prisma.classRoutine.createMany({
        data: [
          {
            institutionId: inst.id,
            classId: cls.id,
            subjectId: s1.id,
            teacherId: teacher.id,
            dayOfWeek: "SATURDAY",
            periodNumber: 1,
            startTime: "০৮:০০ AM",
            endTime: "০৮:৪৫ AM",
            roomNo: "১০১",
          },
          {
            institutionId: inst.id,
            classId: cls.id,
            subjectId: s2.id,
            teacherId: teacher.id,
            dayOfWeek: "SATURDAY",
            periodNumber: 2,
            startTime: "০৮:৫০ AM",
            endTime: "০৯:৩৫ AM",
            roomNo: "১০১",
          },
        ],
      });
    }

    // Exam
    const exam1 = await prisma.exam.create({
      data: {
        institutionId: inst.id,
        titleBn: "প্রথম সাময়িক পরীক্ষা ২০২৬",
        titleEn: "1st Term Examination 2026",
        term: "FIRST_TERM",
        year: 2026,
        startDate: "2026-04-10",
        endDate: "2026-04-22",
        status: "PUBLISHED",
      },
    });

    const instStudents = await prisma.student.findMany({
      where: { institutionId: inst.id },
      include: { classSession: { include: { subjects: true } } },
    });

    for (const st of instStudents) {
      for (const subj of st.classSession.subjects) {
        await prisma.examMark.upsert({
          where: {
            examId_studentId_subjectId: {
              examId: exam1.id,
              studentId: st.id,
              subjectId: subj.id,
            },
          },
          update: {},
          create: {
            institutionId: inst.id,
            examId: exam1.id,
            studentId: st.id,
            subjectId: subj.id,
            writtenMarks: 72,
            vivaMarks: 18,
            totalMarks: 90,
            grade: "MUMTAZ",
            remarks: "মাশাআল্লাহ অত্যন্ত চমৎকার ফলাফল",
          },
        });
      }

      // ------------------------------------------------------------------------
      // NEW: Module 4 - Islamic Education (Tajweed, Namaz, Amal)
      // ------------------------------------------------------------------------
      const todayStr = new Date().toISOString().split("T")[0];
      await prisma.namazRecord.upsert({
        where: {
          institutionId_studentId_date: {
            institutionId: inst.id,
            studentId: st.id,
            date: todayStr,
          },
        },
        update: {},
        create: {
          institutionId: inst.id,
          studentId: st.id,
          date: todayStr,
          fajr: "JAMAAT",
          dhuhr: "JAMAAT",
          asr: "JAMAAT",
          maghrib: "JAMAAT",
          isha: "JAMAAT",
          tahajjud: true,
          notes: "নিয়মিত জামাতে হাজির ছিল",
        },
      });

      await prisma.amalRecord.upsert({
        where: {
          institutionId_studentId_date: {
            institutionId: inst.id,
            studentId: st.id,
            date: todayStr,
          },
        },
        update: {},
        create: {
          institutionId: inst.id,
          studentId: st.id,
          date: todayStr,
          morningAdhkar: true,
          eveningAdhkar: true,
          tilawatPages: 8,
          akhlaqRating: "MUMTAZ",
          remark: "উত্তম চরিত্র ও শালীন আচরণ",
        },
      });

      await prisma.tajweedRecord.create({
        data: {
          institutionId: inst.id,
          studentId: st.id,
          date: todayStr,
          makhrajScore: 5,
          sifatScore: 5,
          tartilQuality: "MUMTAZ",
          surahOrPara: "পারা ৩০ (আম্মাপারা)",
          notes: "মাখরাজ ও গুন্নাহ খুবই নির্ভুল",
        },
      });
    }

    // ------------------------------------------------------------------------
    // NEW: Module 5 - Staff Salary & Payroll
    // ------------------------------------------------------------------------
    const instUsers = await prisma.user.findMany({
      where: { institutionId: inst.id },
    });

    for (const u of instUsers) {
      const basic = u.role === "MUHTAMIM" ? 30000 : u.role === "ACCOUNTANT" ? 20000 : 16000;
      await prisma.staffSalary.upsert({
        where: {
          institutionId_userId_month_year: {
            institutionId: inst.id,
            userId: u.id,
            month: "আগস্ট",
            year: 2026,
          },
        },
        update: {},
        create: {
          institutionId: inst.id,
          userId: u.id,
          month: "আগস্ট",
          year: 2026,
          basicSalary: basic,
          housingAllowance: 3000,
          foodAllowance: 2000,
          bonus: 1000,
          deduction: 0,
          totalAmount: basic + 3000 + 2000 + 1000,
          paymentStatus: "PAID",
          paymentDate: "2026-09-02",
          paymentMethod: "BANK",
          notes: "অফিসিয়াল ব্যাংক একাউন্টে ট্রান্সফার সম্পন্ন",
        },
      });
    }

    // ------------------------------------------------------------------------
    // NEW: Module 6 - Hostel & Mess Management
    // ------------------------------------------------------------------------
    const building = await prisma.hostelBuilding.upsert({
      where: { institutionId_code: { institutionId: inst.id, code: "BLD-01" } },
      update: {},
      create: {
        institutionId: inst.id,
        nameBn: "উসমান বিন আফফান (রা.) ছাত্রাবাস ভবন",
        code: "BLD-01",
        totalFloors: 3,
      },
    });

    const room101 = await prisma.hostelRoom.upsert({
      where: { buildingId_roomNumber: { buildingId: building.id, roomNumber: "১০১" } },
      update: {},
      create: {
        institutionId: inst.id,
        buildingId: building.id,
        roomNumber: "১০১",
        floorNumber: 1,
        capacity: 4,
      },
    });

    const boardingStudents = instStudents.filter((s) => s.isBoarding);
    let bedIdx = 1;
    for (const bs of boardingStudents) {
      const bedNo = `Bed-${bedIdx}`;
      await prisma.hostelBed.upsert({
        where: { roomId_bedNumber: { roomId: room101.id, bedNumber: bedNo } },
        update: {},
        create: {
          institutionId: inst.id,
          roomId: room101.id,
          bedNumber: bedNo,
          studentId: bs.id,
          isOccupied: true,
        },
      });
      bedIdx++;

      // Meal record for today
      await prisma.mealRecord.create({
        data: {
          institutionId: inst.id,
          date: new Date().toISOString().split("T")[0],
          studentId: bs.id,
          breakfast: true,
          lunch: true,
          dinner: true,
          guestMeals: 0,
          notes: "নিয়মিত খানা গ্রহণ করেছে",
        },
      });
    }

    // ------------------------------------------------------------------------
    // NEW: Module 7 - Library & Inventory
    // ------------------------------------------------------------------------
    const b1 = await prisma.book.create({
      data: {
        institutionId: inst.id,
        titleBn: "সহীহুল বুখারী (১ম খণ্ড)",
        titleEn: "Sahih Al-Bukhari Vol 1",
        author: "ইমাম বুখারী (রহ.)",
        category: "HADITH",
        shelfNumber: "র‌্যাক-A, সেলফ-১",
        totalCopies: 5,
        availableCopies: 4,
      },
    });

    await prisma.book.create({
      data: {
        institutionId: inst.id,
        titleBn: "রিয়াদুস সালিহীন",
        titleEn: "Riyadus Saliheen",
        author: "ইমাম নববী (রহ.)",
        category: "HADITH",
        shelfNumber: "র‌্যাক-A, সেলফ-২",
        totalCopies: 8,
        availableCopies: 8,
      },
    });

    await prisma.book.create({
      data: {
        institutionId: inst.id,
        titleBn: "আল-হিদায়া (১ম খণ্ড)",
        titleEn: "Al-Hidayah Vol 1",
        author: "আল্লামা আল-মারগীনানী (রহ.)",
        category: "FIQH",
        shelfNumber: "র‌্যাক-B, সেলফ-১",
        totalCopies: 6,
        availableCopies: 6,
      },
    });

    if (instStudents.length > 0) {
      await prisma.bookIssue.create({
        data: {
          institutionId: inst.id,
          bookId: b1.id,
          studentId: instStudents[0].id,
          issuedToName: instStudents[0].nameBn,
          phone: instStudents[0].guardianPhone,
          issueDate: "2026-09-10",
          dueDate: "2026-09-25",
          status: "ISSUED",
        },
      });
    }

    // Assets & Inventory Items
    await prisma.madrasaAsset.createMany({
      data: [
        {
          institutionId: inst.id,
          name: "অফিস ডেস্কটপ কম্পিউটার ও প্রিন্টার",
          category: "ELECTRONICS",
          quantity: 2,
          location: "হিসাব বিভাগ ও অফিস",
          condition: "GOOD",
          estimatedCost: 75000,
        },
        {
          institutionId: inst.id,
          name: "হলরুম সাউন্ড সিস্টেম ও অয়্যারলেস মাইক",
          category: "ELECTRONICS",
          quantity: 1,
          location: "প্রধান জামাতখানা",
          condition: "GOOD",
          estimatedCost: 35000,
        },
        {
          institutionId: inst.id,
          name: "সিলিং ফ্যান (GFC/BRB 56 Inch)",
          category: "ELECTRICAL",
          quantity: 24,
          location: "সকল শ্রেণিকক্ষ ও ছাত্রাবাস",
          condition: "GOOD",
          estimatedCost: 84000,
        },
      ],
    });

    await prisma.inventoryItem.createMany({
      data: [
        {
          institutionId: inst.id,
          name: "হিফজ দৈনিক ডায়েরি ও খাতা",
          category: "STATIONERY",
          unit: "পিস",
          currentStock: 150,
          reorderLevel: 30,
        },
        {
          institutionId: inst.id,
          name: "হোয়াইটবোর্ড মার্কার পেন",
          category: "STATIONERY",
          unit: "ডজন",
          currentStock: 12,
          reorderLevel: 3,
        },
        {
          institutionId: inst.id,
          name: "ফ্লোর ক্লিনিং ফিনাইল ও হারপিক",
          category: "CLEANING",
          unit: "বোতল",
          currentStock: 25,
          reorderLevel: 5,
        },
      ],
    });

    console.log(`✅ Seeded complete initial dataset for ${inst.nameBn}`);
  }

  await seedInstitutionData(inst1);
  await seedInstitutionData(inst2);

  console.log("🎉 Multi-Tenant Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
