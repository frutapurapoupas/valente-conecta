$Relatorio = "C:\valente_conecta\RADIOGRAFIA_COZINHA.txt"

Remove-Item $Relatorio -ErrorAction SilentlyContinue

function Add($t){
    Add-Content $Relatorio $t
}

Add "========================================================="
Add "RADIOGRAFIA DO MÓDULO COZINHA"
Add "========================================================="
Add ""

$Arquivos = Get-ChildItem . -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx `
| Where-Object{
    $_.FullName -notmatch "node_modules|\.next|dist|build"
}

###########################################################
Add ""
Add "===================="
Add "1 - ARQUIVOS COZINHA"
Add "===================="

Get-ChildItem . -Recurse |
Where-Object{
    $_.FullName -match "cozinha|receita|ingred|estoque|cardapio|produto"
} |
ForEach-Object{

    Add $_.FullName

}

###########################################################

Add ""
Add "===================="
Add "2 - PAGES"
Add "===================="

$Arquivos |
Where-Object{
    $_.Name -eq "page.tsx"
} |
ForEach-Object{

    Add $_.FullName

}

###########################################################

Add ""
Add "===================="
Add "3 - APIs"
Add "===================="

Get-ChildItem . -Recurse -Filter route.ts |
ForEach-Object{

    Add $_.FullName

}

###########################################################

Add ""
Add "===================="
Add "4 - SUPABASE"
Add "===================="

$Padroes=@(

"supabase.from",

"select(",

"insert(",

"update(",

"delete(",

"rpc(",

"storage"

)

foreach($p in $Padroes){

Add ""
Add "######## $p ########"

Select-String `
-Path $Arquivos.FullName `
-Pattern $p `
-SimpleMatch |
ForEach-Object{

Add ""
Add $_.Path
Add ("Linha "+$_.LineNumber)
Add $_.Line.Trim()

}

}

###########################################################

Add ""
Add "===================="
Add "5 - FETCH"
Add "===================="

$Busca=@(

"fetch(",

"axios",

"/api/",

"useEffect(",

"useState(",

"useReducer(",

"useMemo(",

"useCallback("

)

foreach($b in $Busca){

Add ""
Add "######## $b ########"

Select-String `
-Path $Arquivos.FullName `
-Pattern $b `
-SimpleMatch |
ForEach-Object{

Add ""
Add $_.Path
Add ("Linha "+$_.LineNumber)
Add $_.Line.Trim()

}

}

###########################################################

Add ""
Add "===================="
Add "6 - COMPONENTES"
Add "===================="

Get-ChildItem . -Recurse -Directory |
Where-Object{

$_.Name -match "component"

} |
ForEach-Object{

Add $_.FullName

}

###########################################################

Add ""
Add "===================="
Add "7 - SERVICES"
Add "===================="

Get-ChildItem . -Recurse |
Where-Object{

$_.FullName -match "service|services|hook|hooks|context"

} |
ForEach-Object{

Add $_.FullName

}

###########################################################

Add ""
Add "===================="
Add "8 - TAMANHO DOS ARQUIVOS"
Add "===================="

$Arquivos |
Sort Length -Descending |
Select -First 80 |
ForEach-Object{

$linhas=(Get-Content $_.FullName).Count

Add ("{0} linhas ---- {1}" -f $linhas,$_.FullName)

}

###########################################################

Add ""
Add "===================="
Add "9 - COMPONENTES GIGANTES"
Add "===================="

$Arquivos |
ForEach-Object{

$l=(Get-Content $_.FullName).Count

if($l -gt 500){

Add ("$l linhas")
Add $_.FullName
Add ""

}

}

###########################################################

Write-Host ""
Write-Host "RELATÓRIO GERADO:"
Write-Host $Relatorio