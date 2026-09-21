const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const logoBuffer = fs.readFileSync(path.join(__dirname, 'public', 'logo.png'));
const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>মাদ্রাসা ম্যানেজমেন্ট ও অটোমেশন সিস্টেম - প্রেজেন্টেশন ও প্রস্তাবনা</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
    
    @page {
      size: A4 portrait;
      margin: 14mm 14mm 14mm 14mm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Hind Siliguri', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 13px;
    }

    .page {
      page-break-after: always;
      position: relative;
      min-height: 260mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Cover Page */
    .cover-container {
      background: linear-gradient(145deg, #022c22 0%, #064e3b 50%, #042f2e 100%);
      color: #ffffff;
      border-radius: 20px;
      padding: 40px 30px;
      text-align: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      min-height: 255mm;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border: 3px solid #fbbf24;
    }

    .cover-header {
      border-bottom: 2px solid rgba(251, 191, 36, 0.4);
      padding-bottom: 20px;
    }

    .arabic-bismillah {
      font-size: 24px;
      color: #fbbf24;
      font-weight: bold;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .cover-logo-wrapper {
      margin: 25px auto;
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 4px solid #fbbf24;
      padding: 4px;
      background: #022c22;
      box-shadow: 0 10px 20px rgba(0,0,0,0.4);
    }

    .cover-logo {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }

    .cover-title {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      margin: 10px 0 5px 0;
      text-shadow: 0 2px 8px rgba(0,0,0,0.5);
    }

    .cover-subtitle {
      font-size: 16px;
      color: #fde68a;
      margin-bottom: 25px;
      font-weight: 500;
    }

    .cover-badge-container {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 15px 0;
    }

    .cover-badge {
      background: rgba(6, 95, 70, 0.8);
      border: 1px solid #fbbf24;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      color: #ffffff;
      font-weight: 600;
    }

    .cover-footer-box {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(251, 191, 36, 0.3);
      border-radius: 14px;
      padding: 16px;
      margin-top: 20px;
      text-align: left;
    }

    /* Inner Pages Header */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #065f46;
      padding-bottom: 8px;
      margin-bottom: 18px;
    }

    .section-header h2 {
      color: #064e3b;
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .section-header .sub {
      color: #64748b;
      font-size: 12px;
    }

    /* Table Styles */
    .compare-table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0 20px 0;
      font-size: 12px;
    }

    .compare-table th {
      background: #064e3b;
      color: #ffffff;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
    }

    .compare-table td {
      padding: 9px 12px;
      border-bottom: 1px solid #e2e8f0;
    }

    .compare-table tr:nth-child(even) {
      background: #f8fafc;
    }

    /* Grid of Pillars */
    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 15px;
    }

    .card {
      border: 1px solid #cbd5e1;
      border-left: 4px solid #059669;
      border-radius: 10px;
      padding: 12px 14px;
      background: #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .card h3 {
      margin: 0 0 4px 0;
      color: #065f46;
      font-size: 14px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .card p {
      margin: 0;
      color: #475569;
      font-size: 11.5px;
      line-height: 1.45;
    }

    .tag {
      font-size: 9.5px;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      padding: 2px 6px;
      border-radius: 6px;
      font-weight: 600;
    }

    /* Script Box */
    .script-box {
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 12px;
      padding: 14px 16px;
      margin: 12px 0;
      font-style: italic;
      color: #14532d;
      font-size: 12px;
      line-height: 1.6;
    }

    /* Step flow */
    .step-box {
      display: flex;
      gap: 12px;
      margin-bottom: 10px;
      background: #f8fafc;
      padding: 10px;
      border-radius: 8px;
      border-left: 3px solid #3b82f6;
    }

    .step-num {
      width: 24px;
      height: 24px;
      background: #2563eb;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 11px;
      shrink: 0;
    }

    .step-text h4 {
      margin: 0 0 2px 0;
      font-size: 12.5px;
      color: #1e293b;
    }

    .step-text p {
      margin: 0;
      font-size: 11px;
      color: #64748b;
    }

    /* Footer */
    .page-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      font-size: 10px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: COVER PAGE -->
  <div class="page">
    <div class="cover-container">
      <div class="cover-header">
        <div class="arabic-bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        <div style="font-size: 13px; color: #a7f3d0; text-transform: uppercase; letter-spacing: 1.5px;">
          Comprehensive Islamic Education & Modern Automation Platform
        </div>
      </div>

      <div>
        <div class="cover-logo-wrapper">
          <img src="${logoBase64}" alt="মাদ্রাসা লোগো" class="cover-logo">
        </div>
        <div class="cover-title">মাদ্রাসা ম্যানেজমেন্ট ও অটোমেশন সিস্টেম</div>
        <div class="cover-subtitle">দ্বীনি শিক্ষার ঐতিহ্য রক্ষা করে সম্পূর্ণ আধুনিক, স্বচ্ছ ও স্মার্ট মাদ্রাসা পরিচালনা</div>

        <div class="cover-badge-container">
          <span class="cover-badge">⚡ ২৪/৭ ক্লাউড অটোমেশন</span>
          <span class="cover-badge">📱 অ্যান্ড্রয়েড মোবাইল অ্যাপ</span>
          <span class="cover-badge">🧾 অটোমেটিক ডিজিটাল রসিদ</span>
          <span class="cover-badge">👨‍👩‍👧 অভিভাবক পোর্টাল</span>
        </div>
      </div>

      <div class="cover-footer-box">
        <table style="width: 100%; font-size: 11.5px; color: #e2e8f0;">
          <tr>
            <td style="width: 50%;">
              <strong style="color: #fbbf24;">উপস্থাপনায়:</strong> মাদ্রাসা টেকনোলজি টিম<br>
              <strong style="color: #fbbf24;">উদ্দেশ্য:</strong> পরিচালনা কমিটি, মুহতামিম ও শিক্ষকবৃন্দের পর্যালোচনা
            </td>
            <td style="width: 50%; text-align: right;">
              <strong style="color: #fbbf24;">লাইভ অ্যাপ লিঙ্ক:</strong> madrasa-management-mlo9.onrender.com<br>
              <strong style="color: #fbbf24;">সংস্করণ:</strong> ২০২৬ প্রোডাকশন এডিশন (PWA/APK)
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>

  <!-- PAGE 2: EXECUTIVE SUMMARY & PROBLEM VS SOLUTION -->
  <div class="page">
    <div>
      <div class="section-header">
        <h2>📌 ১. পটভূমি, বর্তমান সমস্যা ও আমাদের ডিজিটাল সমাধান</h2>
        <span class="sub">মাদ্রাসা ম্যানেজমেন্ট প্রেজেন্টেশন</span>
      </div>

      <p style="font-size: 12.5px; color: #334155; text-align: justify; margin-bottom: 16px;">
        মাদ্রাসার কার্যক্রম অত্যন্ত বরকতময় ও আমানতদারিতার বিষয়। ছাত্র সংখ্যা বৃদ্ধি পাওয়ার সাথে সাথে শিক্ষা, হিফজ, বোর্ডিং এবং কোটি টাকার বার্ষিক লেনদেনের খতিয়ান কাগজের রেজিস্টার খাতায় রাখা দিন দিন অসম্ভব ও ঝুঁকিপূর্ণ হয়ে পড়ছে। এই বাস্তবতায় আমাদের তৈরি <strong>'মাদ্রাসা ম্যানেজমেন্ট সিস্টেম'</strong> একটি স্বয়ংসম্পূর্ণ প্ল্যাটফর্ম, যা মাদ্রাসার প্রতিটি শাখাকে সুশৃঙ্খল ও স্বচ্ছ করে তোলে।
      </p>

      <table class="compare-table">
        <thead>
          <tr>
            <th style="width: 48%;">❌ সনাতন খাতা-কলমের সমস্যা ও ঝুঁকি</th>
            <th style="width: 52%; background: #047857;">✅ আমাদের ডিজিটাল অ্যাপের সমাধান</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>কাগজের রসিদ হারানো:</strong> রসিদ ছিঁড়ে গেলে বা ভিজে গেলে বকেয়া ফি যাচাইয়ের কোনো নিশ্চিত উপায় থাকে না।</td>
            <td><strong>ক্লাউড ডাটাবেজ:</strong> প্রতিটি রসিদ আজীবনের জন্য সংরক্ষিত। নাম লিখলেই সঙ্গে সঙ্গে বকেয়া ও পরিশোধিত হিসাব স্পষ্ট।</td>
          </tr>
          <tr>
            <td><strong>হিসাব নিরীক্ষায় সময় অপচয়:</strong> মাস বা বছর শেষে সাধারণ ফান্ড ও লিল্লাহ ফান্ডের ক্যাশ হিসাব মেলাতে দিন পার হয়।</td>
            <td><strong>এক ক্লিকে জমা-খরচ:</strong> সাধারণ তহবিল, যাকাত/ফিতরা ও মেহমানদারি ফান্ডের দৈনিক ব্যালেন্স অটোমেটিক তৈরি হয়।</td>
          </tr>
          <tr>
            <td><strong>অভিভাবকদের দূরত্ব:</strong> সন্তান ক্লাসে উপস্থিত আছে কি না বা হিফজের ছবক কেমন পড়ছে তা অভিভাবক জানতে পারেন না।</td>
            <td><strong>অভিভাবক পোর্টাল:</strong> মোবাইল নম্বর ও ৪ ডিজিটের পিন দিয়েই অভিভাবক নিজ সন্তানের দৈনিক হাজিরা, ছবক ও ফি দেখতে পান।</td>
          </tr>
          <tr>
            <td><strong>কম্পিউটার নির্ভরতা:</strong> শুধুমাত্র মাদ্রাসার পিসিতে ফাইল থাকলে ছুটিতে বা সফরে গেলে হিসাব দেখা যায় না।</td>
            <td><strong>২৪/৭ মোবাইল অ্যাক্সেস:</strong> মুহতামিম সাহেব দেশ-বিদেশের যেকোনো প্রান্ত থেকে মোবাইলে পুরো মাদ্রাসা পরিচালনা করতে পারেন।</td>
          </tr>
        </tbody>
      </table>

      <div class="section-header" style="margin-top: 25px;">
        <h2>🎯 আমাদের মূল লক্ষ্য ও ভিশন</h2>
      </div>
      <div class="grid-2">
        <div class="card">
          <h3>১. আর্থিক আমানত রক্ষা <span class="tag">স্বচ্ছতা</span></h3>
          <p>ছাত্রদের ফি এবং দানশীলদের দেওয়া লিল্লাহ-যাকাত তহবিলের প্রতিটি পয়সার ডিজিটাল ভাউচার তৈরি ও ক্যাশ বুক অটোমেশন।</p>
        </div>
        <div class="card">
          <h3>২. হিফজ ও তারবিয়াহ মানোন্নয়ন <span class="tag">তা'লীম</span></h3>
          <p>ছবক, সবকি এবং আমুখতা (দোর) রিভিশনের মান প্রতিদিন রেকর্ড রাখা যাতে কোনো ছাত্র পেছনের পারা ভুলে না যায়।</p>
        </div>
        <div class="card">
          <h3>৩. অভিভাবকের সন্তুষ্টি ও আস্থা <span class="tag">সম্পর্ক</span></h3>
          <p>অভিভাবকদের সাথে সার্বক্ষণিক প্রযুক্তিনির্ভর স্বচ্ছ যোগাযোগ বৃদ্ধি করে মাদ্রাসার সুনাম বহুগুণ বৃদ্ধি করা।</p>
        </div>
        <div class="card">
          <h3>৪. সময় সাশ্রয় ও আধুনিকায়ন <span class="tag">অটোমেশন</span></h3>
          <p>হিসাবরক্ষক ও শিক্ষকদের ঘণ্টার পর ঘণ্টা খাতা টানার কাজ মাত্র কয়েক সেকেন্ডে সম্পন্ন করা।</p>
        </div>
      </div>
    </div>

    <div class="page-footer">
      <span>মাদ্রাসা ম্যানেজমেন্ট ও অটোমেশন সিস্টেম | প্রেজেন্টেশন হ্যান্ডআউট</span>
      <span>পৃষ্ঠা ২</span>
    </div>
  </div>

  <!-- PAGE 3: THE 8 CORE MODULES -->
  <div class="page">
    <div>
      <div class="section-header">
        <h2>🏛️ ২. সিস্টেমের ৮টি মূল স্তম্ভ ও মডিউলসমূহ</h2>
        <span class="sub">সম্পূর্ণ প্রশাসনিক পরিধি</span>
      </div>

      <div class="grid-2">
        <div class="card" style="border-left-color: #10b981;">
          <h3>১. শিক্ষার্থী ও ভর্তি মডিউল <span class="tag">ছাত্র তথ্য</span></h3>
          <p>নাম, রোল/আইডি, বিভাগ (নূরানী, নাজেরা, হিফজ, কিতাব), শ্রেণি, অভিভাবকের মোবাইল, রক্ত, জন্মতারিখ এবং আবাসিক/লিল্লাহ ফান্ড স্ট্যাটাস সংরক্ষণ।</p>
        </div>

        <div class="card" style="border-left-color: #059669;">
          <h3>২. ফি আদায় ও ক্যাশ রশিদ <span class="tag">ইনস্ট্যান্ট রসিদ</span></h3>
          <p>শিক্ষার্থীর নাম টাইপ করলেই অটো-সাজেশন। মাসিক টিউশন ফি, বোর্ডিং ফি, ভর্তি ও পরীক্ষার ফি আদায় এবং এক ক্লিকে থার্মাল পিওএস বা A4 রসিদ প্রিন্ট।</p>
        </div>

        <div class="card" style="border-left-color: #047857;">
          <h3>৩. হিফজ, তাজবীদ ও আমল ট্র্যাকার <span class="tag">দৈনিক ছবক</span></h3>
          <p>প্রতিটি ছাত্রের দৈনিক নতুন ছবক (পারা ও পৃষ্ঠা নম্বর), সবকি, আমুখতা রিভিশন গুণমান (মুমতাজ, জায়্যিদ) এবং ৫ ওয়াক্ত জামাতে নামাজ ট্র্যাকিং।</p>
        </div>

        <div class="card" style="border-left-color: #0d9488;">
          <h3>৪. অভিভাবক ডিজিটাল পোর্টাল <span class="tag">অভিভাবক লগইন</span></h3>
          <p>কোনো পাসওয়ার্ডের জটিলতা ছাড়াই শুধু মোবাইল নম্বর ও পিন দিয়ে অভিভাবক তার সন্তানের ফলাফল, ফি রশিদ, বকেয়া ও হাজিরা ঘরে বসেই দেখতে পান।</p>
        </div>

        <div class="card" style="border-left-color: #d97706;">
          <h3>৫. তহবিল ও ফান্ড অ্যাকাউন্টিং <span class="tag">সম্পূর্ণ খতিয়ান</span></h3>
          <p>সাধারণ তহবিল, লিল্লাহ ও যাকাত ফান্ড, মেহমানদারি তহবিল ও মসজিদের আলাদা হিসাব। প্রতিটি লেনদেনের অটো-ভাউচার জেনারেট ও ব্যালেন্স ট্র্যাকিং।</p>
        </div>

        <div class="card" style="border-left-color: #2563eb;">
          <h3>৬. শিক্ষক বেতন ও স্টাফ পেরোল <span class="tag">বেতন শিট</span></h3>
          <p>উস্তাদ ও খাদেমগণের মূল বেতন, আবাসন ভাতা, খোরাকি এবং কর্তন সহ মাসিক বেতন স্লিপ তৈরি এবং পরিশোধের হিসাব পরিচালনা।</p>
        </div>

        <div class="card" style="border-left-color: #7c3aed;">
          <h3>৭. আবাসিক ছাত্রাবাস ও মিল মেস <span class="tag">হোস্টেল</span></h3>
          <p>বিল্ডিং, রুম নম্বর ও বেড বণ্টন। দৈনিক সকাল, দুপুর ও রাতের মিল গণনা এবং মেহমানদের খাবারের হিসাব নিরবচ্ছিন্ন রাখা।</p>
        </div>

        <div class="card" style="border-left-color: #db2777;">
          <h3>৮. কিতাবখানা ও মাদ্রাসা সম্পদ <span class="tag">লাইব্রেরি</span></h3>
          <p>হাদিস, ফিকহ ও তাফসির কিতাব ইস্যু ও ফেরত রেজিস্টার। মাদ্রাসার কম্পিউটার, সাউন্ড সিস্টেম, ফ্যান ইত্যাদির সম্পদ ট্র্যাকিং।</p>
        </div>
      </div>

      <div class="section-header" style="margin-top: 20px;">
        <h2>📱 প্রযুক্তিগত বিশেষত্ব ও মোবাইল অ্যাপ (APK)</h2>
      </div>

      <table class="compare-table">
        <tr style="background: #f1f5f9;">
          <td style="font-weight: bold; width: 30%;">মোবাইল অ্যাপ (.apk)</td>
          <td>প্লে-স্টোর মানের সরাসরি অ্যান্ড্রয়েড অ্যাপ্লিকেশন। ফোনে একবার ইনস্টল করলেই শিক্ষক ও অভিভাবক ফুল-স্ক্রিনে এক ক্লিকে ঢুকতে পারেন।</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">২৪/৭ ক্লাউড সুবিধা</td>
          <td>মাদ্রাসার কোনো কম্পিউটার চালু রাখা বাধ্যতামূলক নয়। ক্লাউড রোবট সার্ভারকে সারাক্ষণ লাইভ রাখে, যেকোনো স্থান থেকে নিরবচ্ছিন্ন সচল।</td>
        </tr>
        <tr style="background: #f1f5f9;">
          <td style="font-weight: bold;">স্বয়ংক্রিয় ক্লাউড আপডেট</td>
          <td>ওয়েবসাইটে বা সিস্টেমে কোনো আপডেট হলে ব্যবহারকারীকে বারবার নতুন অ্যাপ ডাউনলোড করতে হয় না; নিজে থেকেই ফোন আপডেট হয়ে যায়।</td>
        </tr>
      </table>
    </div>

    <div class="page-footer">
      <span>মাদ্রাসা ম্যানেজমেন্ট ও অটোমেশন সিস্টেম | প্রেজেন্টেশন হ্যান্ডআউট</span>
      <span>পৃষ্ঠা ৩</span>
    </div>
  </div>

  <!-- PAGE 4: PRESENTATION SCRIPT & LIVE DEMO GUIDE -->
  <div class="page">
    <div>
      <div class="section-header">
        <h2>🎤 ৩. কমিটির সামনে উপস্থাপনের বক্তব্য ও লাইভ ডেমো গাইড</h2>
        <span class="sub">প্রেজেন্টেশন নির্দেশিকা</span>
      </div>

      <p style="font-size: 12px; color: #475569; margin-bottom: 8px;">
        মুহতামিম সাহেব ও পরিচালনা কমিটির সামনে ৫ মিনিটে যেভাবে লাইভ ডেমো প্রদর্শন করবেন:
      </p>

      <div class="step-box">
        <div class="step-num">১</div>
        <div class="step-text">
          <h4>ফোনে আসল মোবাইল অ্যাপটি দেখানো</h4>
          <p>আপনার ফোনের ডিসপ্লেতে মাদ্রাসার লোগো ও নামসহ <strong>'মাদ্রাসা ম্যানেজমেন্ট অ্যাপ'</strong> ওপেন করে প্রজেক্টরে বা কমিটির সামনে দেখান। এটি প্রমাণ করে যে সিস্টেমটি ১০০% আধুনিক ও রিয়েল অ্যাপ।</p>
        </div>
      </div>

      <div class="step-box">
        <div class="step-num">২</div>
        <div class="step-text">
          <h4>শিক্ষার্থীর নাম টাইপ করে তাৎক্ষণিক ফি আদায় ও রসিদ প্রিন্ট</h4>
          <p>ফি কালেকশনে গিয়ে যেকোনো ছাত্রের নাম টাইপ করুন, ১ ক্লিকে জমা এন্ট্রি দিন এবং সুন্দর থার্মাল/A4 রসিদের প্রিন্ট প্রিভিউ দেখান। সবাই রসিদের পেশাদারিত্ব দেখে আশ্বস্ত হবেন।</p>
        </div>
      </div>

      <div class="step-box">
        <div class="step-num">৩</div>
        <div class="step-text">
          <h4>হিফজ ডায়েরি ও ছবক এন্ট্রি</h4>
          <p>হিফজ মডিউলে গিয়ে দেখান কীভাবে একজন উস্তাদ কয়েক সেকেন্ডের মধ্যে ছাত্রের দৈনিক ছবকের পারা ও মান এন্ট্রি করতে পারছেন।</p>
        </div>
      </div>

      <div class="step-box">
        <div class="step-num">৪</div>
        <div class="step-text">
          <h4>অভিভাবক পোর্টালে লগইন প্রদর্শন</h4>
          <p>লগআউট করে অভিভাবক পোর্টালে মোবাইল ও পিন দিয়ে ঢুকে দেখান যে কোনো অভিভাবক ঘরে বসেই তার ছেলের লেখাপড়া ও বকেয়ার বিবরণ দেখতে পাচ্ছেন।</p>
        </div>
      </div>

      <div class="section-header" style="margin-top: 18px;">
        <h2>📢 প্রেজেন্টেশনে বলার জন্য নমুনা স্ক্রিপ্ট (Speaking Script)</h2>
      </div>

      <div class="script-box">
        &quot;আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহি ওয়া বারাকাতুহু।<br>
        মুহতারাম মুহতামিম সাহেব ও সম্মানিত পরিচালনা কমিটির সদস্যবৃন্দ,<br><br>
        আমাদের দ্বীনি মাদ্রাসার সুনাম, ছাত্রদের আমানতদারিতা এবং দানশীলদের দানের প্রতিটি পয়সার হিসাব সংরক্ষণ আমাদের ওপর অত্যন্ত পবিত্র দায়িত্ব। আজ আমি আপনাদের সামনে উপস্থাপন করছি সম্পূর্ণ নিজস্ব <strong>'মাদ্রাসা ম্যানেজমেন্ট অ্যাপ'</strong>।<br><br>
        এই সিস্টেমের সাহায্যে এখন থেকে ছাত্রদের মাসিক বেতন, খোরাকি বা বোর্ডিং ফি জমা হওয়ার সাথে সাথেই অটোমেটিক পাকা রসিদ তৈরি হবে। হিফজের শিক্ষকরা ছাত্রদের দৈনিক ছবক ও নামাজ লিখে রাখতে পারবেন এবং অভিভাবকরাও মোবাইল থেকেই তাদের সন্তানের পড়ালেখার খোঁজ রাখতে পারবেন। সবচেয়ে বড় সুবিধা হলো, কম্পিউটার বন্ধ থাকলেও এটি মোবাইল থেকে ২৪ ঘণ্টা চালু থাকবে এবং মাদ্রাসার সকল গোপন তথ্য সম্পূর্ণ নিরাপদ থাকবে। আসুন, আমাদের প্রতিষ্ঠানকে একটি আদর্শ ও আধুনিক দ্বীনি মডেল হিসেবে গড়ে তুলি। জাযাকুমুল্লাহু খাইরান।&quot;
      </div>
    </div>

    <div class="page-footer">
      <span>মাদ্রাসা ম্যানেজমেন্ট ও অটোমেশন সিস্টেম | প্রেজেন্টেশন হ্যান্ডআউট</span>
      <span>পৃষ্ঠা ৪</span>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'presentation.html'), htmlContent);
console.log('presentation.html created successfully!');

// Generate PDF using headless Edge
const htmlPath = path.join(__dirname, 'presentation.html');
const pdfPath = path.join(__dirname, 'Madrasa_Management_Presentation.pdf');

const edgeCmd = `"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" "${htmlPath}"`;

try {
  execSync(edgeCmd);
  console.log(`PDF generated successfully at: ${pdfPath}`);
  const stats = fs.statSync(pdfPath);
  console.log(`PDF File Size: ${(stats.size / 1024).toFixed(2)} KB`);
} catch (err) {
  console.error('Edge conversion failed, trying Chrome:', err.message);
  const chromeCmd = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
  execSync(chromeCmd);
  console.log(`PDF generated via Chrome at: ${pdfPath}`);
}
