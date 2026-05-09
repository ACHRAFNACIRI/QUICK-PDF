# QuickPDF Background Auto-Sync Script
# This script watches for any file changes and pushes them to GitHub automatically.

$path = "C:\Users\ACHRAF PC\Desktop\PDF"
$filter = "*.*"

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $path
$watcher.Filter = $filter
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   QuickPDF Real-time Sync Active!" -ForegroundColor Green
Write-Host "   Watching: $path"
Write-Host "   (Keep this window open to sync automatically)"
Write-Host "========================================" -ForegroundColor Cyan

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType
    
    # Ignore git internal files
    if ($path -like "*\.git\*") { return }
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Change detected in: $(Split-Path $path -Leaf)" -ForegroundColor Yellow
    
    # Wait a bit to ensure file is saved and not locked
    Start-Sleep -Seconds 2
    
    Write-Host "Syncing to GitHub..." -ForegroundColor Gray
    git add .
    git commit -m "Real-time update: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git push origin main
    
    Write-Host "Done! Site updated." -ForegroundColor Green
    Write-Host "----------------------------------------"
}

# Register events
Register-ObjectEvent $watcher "Changed" -Action $action
Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Deleted" -Action $action
Register-ObjectEvent $watcher "Renamed" -Action $action

while ($true) { Start-Sleep -Seconds 1 }
