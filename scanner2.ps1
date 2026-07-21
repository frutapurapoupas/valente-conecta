$Base = "C:\valente_conecta"
$Relatorio = "$Base\RELATORIO_PROFISSIONAL.txt"

Remove-Item $Relatorio -ErrorAction SilentlyContinue

function Add($t){
    Add-Content -Path $Relatorio -Value $t
}

Add "==================================================="
Add "VALENTE CONECTA - SCANNER PROFISSIONAL"
Add "==================================================="
Add "Data: $(Get-Date)"
Add ""

Write-Host "Analisando arquivos..."

$Arquivos = Get-ChildItem $Base -Recurse -Include *.tsx,*.ts,*.js,*.jsx |
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
    Add "---------------------------------------------"
    Add $f.FullName

    $linhas=(Get-Content $f.FullName).Count

    if($linhas -gt 500){
        Add "[ALTA] Arquivo muito grande ($linhas linhas)"
    }

    if($txt -match "next/font/google"){
        Add "[MEDIA] Usa Google Fonts"
    }

    if($txt -match "``r``n"){
        Add "[CRITICO] Possui caracteres literais `r`n"
    }

    if($txt -match "import .* from ['""](.+)['""]"){

        $imports = Select-String -Path $f.FullName -Pattern "import .* from ['""](.+)['""]"

        foreach($i in $imports){

            $linha = $i.Line.Trim()

            Add "IMPORT -> $linha"

        }

    }

    if($txt -match "export default"){
        Add "Export Default OK"
    }
    else{
        Add "[MEDIA] Sem export default"
    }

}
Add ""
Add "======================================="
Add "TYPESCRIPT"
Add "======================================="

$ts = npx tsc --noEmit 2>&1

$ts | ForEach-Object{
    Add $_
}

Add ""
Add "======================================="
Add "ESLINT"
Add "======================================="

$eslint = npx next lint 2>&1

$eslint | ForEach-Object{
    Add $_
}

Add ""
Add "======================================="
Add "FIM"
Add "======================================="

notepad $Relatorio