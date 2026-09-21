Option Explicit
Dim WshShell
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c ""d:\madrasa managment\run_madrasa_and_tunnel.bat""", 0, False
Set WshShell = Nothing
