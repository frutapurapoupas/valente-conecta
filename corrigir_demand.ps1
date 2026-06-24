# Corrigir todos os arquivos DemandView.tsx
$files = @(
    "app/admin-master/cozinha-chef/components/DemandView.tsx",
    "app/admin-master/financeiro/components/DemandView.tsx",
    "app/admin-master/pdv-unificado/components/DemandView.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Corrigindo: $file" -ForegroundColor Yellow
        $content = Get-Content $file -Raw
        
        # Remover caracteres inválidos e corrigir
        $content = $content -replace "`u{00A0}", " "  # Remover espaços não quebráveis
        $content = $content -replace "[`u{2018}`u{2019}]", "'"  # Corrigir aspas curvas
        $content = $content -replace "[`u{201C}`u{201D}]", '"'  # Corrigir aspas duplas curvas
        
        # Salvar
        $content | Out-File -FilePath $file -Encoding UTF8
        Write-Host "✅ Corrigido: $file" -ForegroundColor Green
    }
}
