$url = "https://madrasa-management-mlo9.onrender.com/login"
while ($true) {
    try {
        Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 15 | Out-Null
    } catch {}
    Start-Sleep -Seconds 600
}
