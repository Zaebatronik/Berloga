# Скрипт для удаления всех деплоев Cloudflare Pages проекта kupyprodai

Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  УДАЛЕНИЕ ВСЕХ ДЕПЛОЕВ CLOUDFLARE PAGES" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Шаг 1: Получить API Token
Write-Host "📋 ШАГ 1: Получи Cloudflare API Token" -ForegroundColor Green
Write-Host ""
Write-Host "1. Открой: https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Gray
Write-Host "2. Нажми: Create Token" -ForegroundColor Gray
Write-Host "3. Выбери шаблон: Edit Cloudflare Workers" -ForegroundColor Gray
Write-Host "4. Нажми: Continue to summary → Create Token" -ForegroundColor Gray
Write-Host "5. Скопируй токен" -ForegroundColor Gray
Write-Host ""

$API_TOKEN = Read-Host "Вставь API Token сюда"

if ([string]::IsNullOrWhiteSpace($API_TOKEN)) {
    Write-Host "❌ Токен не введён!" -ForegroundColor Red
    exit 1
}

# Шаг 2: Получить Account ID
Write-Host ""
Write-Host "📋 ШАГ 2: Получи Account ID" -ForegroundColor Green
Write-Host ""
Write-Host "1. Открой: https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host "2. Справа внизу найди: Account ID" -ForegroundColor Gray
Write-Host "3. Скопируй его" -ForegroundColor Gray
Write-Host ""

$ACCOUNT_ID = Read-Host "Вставь Account ID сюда"

if ([string]::IsNullOrWhiteSpace($ACCOUNT_ID)) {
    Write-Host "❌ Account ID не введён!" -ForegroundColor Red
    exit 1
}

$PROJECT_NAME = "kupyprodai"

Write-Host ""
Write-Host "🔍 Получаю список всех деплоев..." -ForegroundColor Cyan

# Получаем список всех деплоев
$headers = @{
    "Authorization" = "Bearer $API_TOKEN"
    "Content-Type" = "application/json"
}

$url = "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments"

try {
    $response = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
    $deployments = $response.result
    $total = $deployments.Count
    
    Write-Host "✅ Найдено деплоев: $total" -ForegroundColor Green
    Write-Host ""
    
    if ($total -eq 0) {
        Write-Host "Нет деплоев для удаления" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "⚠️  ВНИМАНИЕ: Будет удалено $total деплоев!" -ForegroundColor Red
    $confirm = Read-Host "Продолжить? (yes/no)"
    
    if ($confirm -ne "yes") {
        Write-Host "❌ Отменено" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "🗑️  Удаляю деплои..." -ForegroundColor Cyan
    
    $deleted = 0
    $failed = 0
    
    foreach ($deployment in $deployments) {
        $deploymentId = $deployment.id
        $deleteUrl = "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT_NAME/deployments/$deploymentId"
        
        try {
            Invoke-RestMethod -Uri $deleteUrl -Headers $headers -Method DELETE | Out-Null
            $deleted++
            Write-Host "✅ Удалён: $deploymentId ($deleted/$total)" -ForegroundColor Green
        } catch {
            $failed++
            Write-Host "❌ Ошибка: $deploymentId" -ForegroundColor Red
        }
        
        # Пауза между запросами чтобы не превысить rate limit
        Start-Sleep -Milliseconds 100
    }
    
    Write-Host ""
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "✅ Удалено: $deleted" -ForegroundColor Green
    Write-Host "❌ Ошибок: $failed" -ForegroundColor Red
    Write-Host "════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎉 Теперь можешь удалить проект kupyprodai в Cloudflare UI!" -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "❌ ОШИБКА: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "1. Invalid API Token" -ForegroundColor Gray
    Write-Host "2. Invalid Account ID" -ForegroundColor Gray
    Write-Host "3. Insufficient token permissions" -ForegroundColor Gray
}
