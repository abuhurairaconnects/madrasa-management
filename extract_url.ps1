$logPath = "d:\madrasa managment\tunnel.log"
$desktopPath = [Environment]::GetFolderPath('Desktop')

if (Test-Path $logPath) {
    $content = Get-Content $logPath -Raw
    if ($content -match '(https://[a-zA-Z0-9-]+\.trycloudflare\.com)') {
        $url = $matches[1]
        
        # Write to desktop text file
        $txtContent = @"
=====================================================
    মাদ্রাসা ম্যানেজমেন্ট ২৪/৭ মোবাইল ও অনলাইন লাইভ লিংক
=====================================================

আপনার মাদ্রাসার বর্তমান অনলাইন লিংক:
$url

মোবাইলে যেভাবে চালাবেন:
১. এই লিংকটি কপি করে আপনার মোবাইলের Chrome বা Safari ব্রাউজারে খুলুন।
২. ব্রাউজারের ৩ ডটে (⋮) চাপ দিয়ে "Add to Home screen" বা "Install app" চাপ দিন।
৩. সাথে সাথে আপনার ফোনে অ্যাপের মতো আইকন চলে আসবে।

(কম্পিউটার চালু থাকলে এই লিংকে পৃথিবীর যেকোনো স্থান থেকে ২৪/৭ এক্সেস করা যাবে)
=====================================================
"@
        Set-Content -Path "$desktopPath\মোবাইল লাইভ লিংক (Phone Link).txt" -Value $txtContent -Encoding UTF8
        
        # Create internet shortcut on Desktop
        $shortcutContent = @"
[InternetShortcut]
URL=$url
"@
        Set-Content -Path "$desktopPath\মাদ্রাসা ম্যানেজমেন্ট (Online).url" -Value $shortcutContent -Encoding UTF8
        Write-Output "Live link saved: $url"
    }
}
