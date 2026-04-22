import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const catalogosPath = path.join(process.cwd(), 'catalogos.json')

function initFile() {
  if (!fs.existsSync(catalogosPath)) {
    fs.writeFileSync(catalogosPath, JSON.stringify([], null, 2))
  }
}

export async function GET() {
  try {
    initFile()
    const data = fs.readFileSync(catalogosPath, 'utf-8')
    const catalogos = JSON.parse(data)
    return NextResponse.json({ catalogos })
  } catch (error) {
    return NextResponse.json({ catalogos: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    initFile()
    const data = fs.readFileSync(catalogosPath, 'utf-8')
    const catalogos = JSON.parse(data)
    
    const novoCatalogo = {
      id: Date.now().toString(),
      ...body
    }
    
    catalogos.push(novoCatalogo)
    fs.writeFileSync(catalogosPath, JSON.stringify(catalogos, null, 2))
    
    return NextResponse.json({ success: true, catalogo: novoCatalogo })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar' }, { status: 500 })
  }
}