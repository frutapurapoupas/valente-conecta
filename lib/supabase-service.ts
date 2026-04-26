import { supabase } from './supabase'

// Interface genérica para resultados de busca
interface SupabaseResult<T> {
  data: T[] | null
  error: Error | null
  count: number | null
}

/**
 * Função genérica para buscar dados de uma tabela do Supabase
 * @param tableName - Nome da tabela
 * @param columns - Colunas a buscar (padrão: '*')
 * @param filters - Filtros opcionais (ex: { column: 'value' })
 * @param orderBy - Ordenação opcional (ex: { column: 'created_at', ascending: false })
 * @param limit - Limite de registros opcional
 * @returns Promise com dados, erro e contagem
 */
export async function fetchFromSupabase<T>(
  tableName: string,
  columns: string = '*',
  filters?: Record<string, any>,
  orderBy?: { column: string; ascending?: boolean },
  limit?: number
): Promise<SupabaseResult<T>> {
  try {
    let query = supabase
      .from(tableName)
      .select(columns)

    // Aplicar filtros se fornecidos
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })
    }

    // Aplicar ordenação se fornecida
    if (orderBy) {
      query = query.order(orderBy.column, { 
        ascending: orderBy.ascending ?? true 
      })
    }

    // Aplicar limite se fornecido
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error, count } = await query

    if (error) {
      console.error(`Erro ao buscar dados da tabela ${tableName}:`, error)
      return { data: null, error, count: null }
    }

    return { data: data as T[], error: null, count }
  } catch (error) {
    console.error(`Erro inesperado ao buscar dados da tabela ${tableName}:`, error)
    return { 
      data: null, 
      error: error as Error, 
      count: null 
    }
  }
}

/**
 * Função para buscar um único registro por ID
 * @param tableName - Nome da tabela
 * @param id - ID do registro
 * @param columns - Colunas a buscar (padrão: '*')
 * @returns Promise com o registro ou erro
 */
export async function fetchById<T>(
  tableName: string,
  id: string,
  columns: string = '*'
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select(columns)
      .eq('id', id)
      .single()

    if (error) {
      console.error(`Erro ao buscar registro ${id} da tabela ${tableName}:`, error)
      return { data: null, error }
    }

    return { data: data as T, error: null }
  } catch (error) {
    console.error(`Erro inesperado ao buscar registro ${id}:`, error)
    return { data: null, error: error as Error }
  }
}

/**
 * Função para buscar dados com busca de texto (ILIKE)
 * @param tableName - Nome da tabela
 * @param searchColumn - Coluna para buscar
 * @param searchTerm - Termo de busca
 * @param columns - Colunas a buscar (padrão: '*')
 * @returns Promise com dados, erro e contagem
 */
export async function searchInSupabase<T>(
  tableName: string,
  searchColumn: string,
  searchTerm: string,
  columns: string = '*'
): Promise<SupabaseResult<T>> {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select(columns)
      .ilike(searchColumn, `%${searchTerm}%`)

    if (error) {
      console.error(`Erro ao buscar em ${tableName}:`, error)
      return { data: null, error, count: null }
    }

    return { data: data as T[], error: null, count }
  } catch (error) {
    console.error(`Erro inesperado na busca:`, error)
    return { 
      data: null, 
      error: error as Error, 
      count: null 
    }
  }
}

/**
 * Função para inserir dados no Supabase
 * @param tableName - Nome da tabela
 * @param data - Dados a inserir
 * @returns Promise com os dados inseridos ou erro
 */
export async function insertIntoSupabase<T>(
  tableName: string,
  data: Partial<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data: insertedData, error } = await supabase
      .from(tableName)
      .insert(data)
      .select()
      .single()

    if (error) {
      console.error(`Erro ao inserir em ${tableName}:`, error)
      return { data: null, error }
    }

    return { data: insertedData as T, error: null }
  } catch (error) {
    console.error(`Erro inesperado ao inserir:`, error)
    return { data: null, error: error as Error }
  }
}

/**
 * Função para atualizar dados no Supabase
 * @param tableName - Nome da tabela
 * @param id - ID do registro
 * @param data - Dados a atualizar
 * @returns Promise com os dados atualizados ou erro
 */
export async function updateInSupabase<T>(
  tableName: string,
  id: string,
  data: Partial<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const { data: updatedData, error } = await supabase
      .from(tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error(`Erro ao atualizar em ${tableName}:`, error)
      return { data: null, error }
    }

    return { data: updatedData as T, error: null }
  } catch (error) {
    console.error(`Erro inesperado ao atualizar:`, error)
    return { data: null, error: error as Error }
  }
}

/**
 * Função para deletar dados do Supabase
 * @param tableName - Nome da tabela
 * @param id - ID do registro
 * @returns Promise com sucesso ou erro
 */
export async function deleteFromSupabase(
  tableName: string,
  id: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)

    if (error) {
      console.error(`Erro ao deletar de ${tableName}:`, error)
      return { success: false, error }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error(`Erro inesperado ao deletar:`, error)
    return { success: false, error: error as Error }
  }
}
