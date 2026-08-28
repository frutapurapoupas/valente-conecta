import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fromDbToCanonical, fromPayloadToCanonical, toDbPayload } from "../canonical";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {

        const supabase = createClient();

        const { data, error } = await supabase
            .from("receitas")
            .select("*")
            .eq("id", params.id)
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            data: fromDbToCanonical(data)
        });

    } catch {

        return NextResponse.json(
            {
                success: false,
                error: "Receita não encontrada"
            },
            {
                status:404
            }
        );

    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params:{id:string} }
){

    try{

        const body = await request.json();
        const bodyObj = body && typeof body === 'object' ? body : {};

        const supabase = createClient();

        const { data: atual, error: erroAtual } = await supabase
            .from("receitas")
            .select("*")
            .eq("id", params.id)
            .single();

        if (erroAtual || !atual) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Receita não encontrada"
                },
                {
                    status: 404
                }
            );
        }

        const atualCanonica = fromDbToCanonical(atual);
        const canonical = fromPayloadToCanonical({ ...bodyObj, id: params.id }, atualCanonica);
        const updateData = toDbPayload(canonical, atual.instrucoes, atual.tempo_preparo);

        const { data,error } = await supabase
            .from("receitas")
            .update(updateData)
            .eq("id",params.id)
            .select()
            .single();

        if(error) {
            console.error('Erro Supabase:', error);
            throw error;
        }

        return NextResponse.json({
            success:true,
            data: fromDbToCanonical(data)
        });

    }catch(error){

        console.error('Erro ao atualizar receita:', error);
        return NextResponse.json(
            {
                success:false,
                error: error instanceof Error ? error.message : "Erro ao atualizar receita"
            },
            {
                status:500
            }
        );

    }

}

export async function DELETE(
    request: NextRequest,
    { params }: { params:{id:string} }
){

    try{

        const supabase=createClient();

        const { error } = await supabase
            .from("receitas")
            .delete()
            .eq("id",params.id);

        if(error) throw error;

        return NextResponse.json({
            success:true
        });

    }catch{

        return NextResponse.json(
            {
                success:false,
                error:"Erro ao excluir receita"
            },
            {
                status:500
            }
        );

    }

}