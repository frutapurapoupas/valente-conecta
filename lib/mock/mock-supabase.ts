/**
 * MOCK SUPABASE CLIENT
 * Simula o comportamento do cliente Supabase para desenvolvimento
 * Usa dados do mock-data.ts em vez do banco real
 */

import { MOCK_DATA, mockHelpers } from './mock-data'

// Tipos para resposta do Supabase
interface SupabaseResponse<T> {
  data: T | T[] | null
  error: Error | null
  count: number | null
}

interface SupabaseTable<T> {
  select: (columns?: string) => SupabaseTable<T>
  insert: (data: Partial<T>) => Promise<SupabaseResponse<T>>
  update: (data: Partial<T>) => SupabaseTable<T>
  delete: () => SupabaseTable<T>
  eq: (column: string, value: any) => SupabaseTable<T>
  order: (column: string, options?: { ascending: boolean }) => SupabaseTable<T>
  limit: (count: number) => SupabaseTable<T>
  single: () => Promise<SupabaseResponse<T>>
  then: (onFulfilled: (value: SupabaseResponse<T>) => any) => Promise<any>
}

class MockSupabaseTable<T> implements SupabaseTable<T> {
  private tableName: string
  private query: any = {}
  private data: T[] = []

  constructor(tableName: string) {
    this.tableName = tableName
    this.data = (MOCK_DATA as any)[tableName] || []
  }

  select(columns?: string): SupabaseTable<T> {
    this.query.columns = columns || '*'
    return this
  }

  insert(data: Partial<T>): Promise<SupabaseResponse<T>> {
    return new Promise(async (resolve) => {
      await mockHelpers.delay(100)
      const { error } = mockHelpers.randomError()
      if (error) {
        resolve({ data: null, error, count: null })
        return
      }

      const newItem = { ...data, id: mockHelpers.generateId(), created_at: new Date().toISOString() }
      this.data.push(newItem as T)
      resolve({ data: newItem as T, error: null, count: 1 })
    })
  }

  update(data: Partial<T>): SupabaseTable<T> {
    this.query.update = data
    return this
  }

  delete(): SupabaseTable<T> {
    this.query.delete = true
    return this
  }

  eq(column: string, value: any): SupabaseTable<T> {
    this.query.eq = { column, value }
    return this
  }

  order(column: string, options?: { ascending: boolean }): SupabaseTable<T> {
    this.query.order = { column, ascending: options?.ascending ?? true }
    return this
  }

  limit(count: number): SupabaseTable<T> {
    this.query.limit = count
    return this
  }

  single(): Promise<SupabaseResponse<T>> {
    return new Promise(async (resolve) => {
      await mockHelpers.delay(50)
      const { error } = mockHelpers.randomError()
      if (error) {
        resolve({ data: null, error, count: null })
        return
      }

      let result = [...this.data]

      // Aplicar filtros
      if (this.query.eq) {
        result = result.filter((item: any) => item[this.query.eq.column] === this.query.eq.value)
      }

      // Aplicar ordenação
      if (this.query.order) {
        result = mockHelpers.orderBy(result, this.query.order.column, this.query.order.ascending)
      }

      // Aplicar limite
      if (this.query.limit) {
        result = result.slice(0, this.query.limit)
      }

      if (result.length === 0) {
        resolve({ data: null, error: new Error('No rows found'), count: 0 })
        return
      }

      resolve({ data: result[0], error: null, count: 1 })
    })
  }

  then(onFulfilled: (value: SupabaseResponse<T>) => any): Promise<any> {
    return new Promise(async (resolve) => {
      await mockHelpers.delay(100)
      const { error } = mockHelpers.randomError()
      if (error) {
        resolve(onFulfilled({ data: null, error, count: null }))
        return
      }

      let result = [...this.data]

      // Aplicar filtros
      if (this.query.eq) {
        result = result.filter((item: any) => item[this.query.eq.column] === this.query.eq.value)
      }

      // Aplicar ordenação
      if (this.query.order) {
        result = mockHelpers.orderBy(result, this.query.order.column, this.query.order.ascending)
      }

      // Aplicar limite
      if (this.query.limit) {
        result = result.slice(0, this.query.limit)
      }

      // Aplicar update
      if (this.query.update) {
        result = result.map((item: any) => ({ ...item, ...this.query.update }))
      }

      // Aplicar delete
      if (this.query.delete) {
        const originalLength = this.data.length
        this.data = result.filter((item: any) => item[this.query.eq.column] !== this.query.eq.value)
        resolve(onFulfilled({ data: null, error: null, count: originalLength - this.data.length }))
        return
      }

      resolve(onFulfilled({ data: result, error: null, count: result.length }))
    })
  }
}

// Mock Auth
class MockAuth {
  async getUser() {
    await mockHelpers.delay(50)
    return {
      data: {
        user: {
          id: '1',
          email: 'mock@user.com',
          created_at: new Date().toISOString()
        }
      },
      error: null
    }
  }

  async signInWithPassword(credentials: { email: string; password: string }) {
    await mockHelpers.delay(100)
    if (credentials.email === 'mock@user.com' && credentials.password === 'password') {
      return {
        data: {
          user: { id: '1', email: 'mock@user.com' },
          session: { access_token: 'mock-token' }
        },
        error: null
      }
    }
    return {
      data: { user: null, session: null },
      error: new Error('Invalid credentials')
    }
  }

  async signOut() {
    await mockHelpers.delay(50)
    return { error: null }
  }
}

// Mock Storage
class MockStorage {
  from(bucket: string) {
    return {
      upload: (path: string, file: File) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
            data: { path: `mock/${path}` },
            error: null
          })
        }, 200)
        })
      },
      getPublicUrl: (path: string) => ({
        data: { publicUrl: `https://mock-storage.com/${path}` }
      })
    }
  }
}

// Mock Supabase Client
class MockSupabaseClient {
  auth = new MockAuth()
  storage = new MockStorage()

  from<T>(tableName: string): SupabaseTable<T> {
    return new MockSupabaseTable<T>(tableName)
  }
}

// Exportar instância mock
export const mockSupabase = new MockSupabaseClient()

// Função para verificar se deve usar mock
export const shouldUseMock = (): boolean => {
  return process.env.USE_MOCK === 'true' || process.env.NODE_ENV === 'development'
}
