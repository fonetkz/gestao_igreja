$ErrorActionPreference = 'Stop'
$proc = Start-Process -FilePath "python" -ArgumentList "main.py" -WorkingDirectory "backend" -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 3
if ($proc.HasExited) {
    Write-Error "Server failed to start"
} else {
    Write-Output "Server started with PID $($proc.Id)"
}