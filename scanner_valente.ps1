$Base = "C:\valente_conecta"
$Relatorio = "$Base\RELATORIO_CIRURGICO_COMPLETO.txt"

Remove-Item $Relatorio -Force -ErrorAction SilentlyContinue

function Add($t){
    Add-Content $Relatorio $t
}

Add "==========================================================="
Add "VALENTE CONECTA - SCANNER CIRÚRGICO"
Add "==========================================================="
Add "Data: $(Get-Date)"
Add ""

$Arquivos = Get-ChildItem $Base -Recurse -File -Include *.tsx,*.ts,*.jsx,*.js,*.css,*.json,*.prisma |
Where-Object{
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.next\\" -and
    $_.FullName -notmatch "\\dist\\" -and
    $_.FullName -notmatch "\\build\\" -and
    $_.FullName -notmatch "\\coverage\\" -and
    $_.FullName -notmatch "\\.git\\"
}

foreach($f in $Arquivos){

    $txt = Get-Content $f.FullName -Raw

    Add ""
    Add "=================================================="
    Add $f.FullName
    Add "=================================================="

    $linhas=(Get-Content $f.FullName).Count
    Add "Linhas : $linhas"

    if($linhas -gt 500){
        Add "⚠ ARQUIVO MUITO GRANDE"
    }

    if($txt.Trim().Length -eq 0){
        Add "⚠ ARQUIVO VAZIO"
    }

    $a=($txt.ToCharArray()|?{$_ -eq "{"}).Count
    $b=($txt.ToCharArray()|?{$_ -eq "}"}).Count
    if($a -ne $b){
        Add "❌ CHAVES { } -> $a / $b"
    }

    $a=($txt.ToCharArray()|?{$_ -eq "("}).Count
    $b=($txt.ToCharArray()|?{$_ -eq ")"}).Count
    if($a -ne $b){
        Add "❌ PARÊNTESES ( ) -> $a / $b"
    }

    $a=($txt.ToCharArray()|?{$_ -eq "["}).Count
    $b=($txt.ToCharArray()|?{$_ -eq "]"}).Count
    if($a -ne $b){
        Add "❌ COLCHETES [ ] -> $a / $b"
    }

    if($txt -match "<table"){
        Add "table encontrada"
    }

    if($txt -match "<tbody"){
        Add "tbody encontrado"
    }

    if($txt -match "<tr"){
        Add "tr encontrado"
    }

    if($txt -match "<td"){
        Add "td encontrado"
    }

    if($txt -match "<div"){
        Add "div encontrado"
    }

    if($txt -match "next/font/google"){
        Add "⚠ Google Font"
    }

    if($txt -match "Inter"){
        Add "⚠ Fonte Inter"
    }

    if($txt -match "``r``n"){
        Add "❌ Possui caracteres `r`n literais"
    }

    if($txt -match "return \("){
        Add "return JSX"
    }

    if($txt -match "export default"){
        Add "export default OK"
    }
}

Add ""
Add "==========================================================="
Add "ARQUIVOS IMPORTANTES"
Add "==========================================================="

$Importantes=@(
"package.json",
"tsconfig.json",
"tailwind.config.js",
"tailwind.config.ts",
"postcss.config.js",
"postcss.config.mjs",
"next.config.js",
"next.config.mjs",
"next.config.ts",
"prisma\schema.prisma"
)

foreach($i in $Importantes){

    $p="$Base\$i"

    if(Test-Path $p){
        Add "[OK] $i"
    }
    else{
        Add "[FALTANDO] $i"
    }

}

Add ""
Add "==========================================================="
Add "ROTAS"
Add "==========================================================="

if(Test-Path "$Base\app"){
Get-ChildItem "$Base\app" -Directory -Recurse | ForEach-Object{
Add $_.FullName
}
}

Add ""
Add "==========================================================="
Add "APIS"
Add "==========================================================="

if(Test-Path "$Base\app\api"){
Get-ChildItem "$Base\app\api" -Recurse | ForEach-Object{
Add $_.FullName
}
}

Add ""
Add "==========================================================="
Add "FIM"
Add "==========================================================="

Write-Host ""
Write-Host "Scanner concluído."
Write-Host ""
Write-Host $Relatorio

notepad $Relatorio