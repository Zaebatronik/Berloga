Write-Host "CLOUDFLARE DEPLOYMENTS CLEANUP" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Get API Token from https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Yellow
$API_TOKEN = Read-Host "Enter API Token"
Write-Host ""
Write-Host "Step 2: Get Account ID from https://dash.cloudflare.com" -ForegroundColor Yellow
$ACCOUNT_ID = Read-Host "Enter Account ID"
$PROJECT = "kupyprodai"
Write-Host ""
Write-Host "Fetching deployments..." -ForegroundColor Cyan
$headers = @{"Authorization"="Bearer $API_TOKEN"}
$url = "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT/deployments"
$response = Invoke-RestMethod -Uri $url -Headers $headers
$total = $response.result.Count
Write-Host "Found: $total deployments" -ForegroundColor Green
$confirm = Read-Host "Delete all? (yes/no)"
if($confirm -eq "yes"){
  $deleted=0
  foreach($d in $response.result){
    Invoke-RestMethod -Uri "$url/$($d.id)" -Headers $headers -Method DELETE | Out-Null
    $deleted++
    Write-Host "Deleted: $deleted/$total" -ForegroundColor Green
    Start-Sleep -Milliseconds 100
  }
  Write-Host "Done! Deleted: $deleted" -ForegroundColor Green
}
