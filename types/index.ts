export interface User { id: string; name: string; email: string; wallet: number; role: "user" | "admin"; plan?: string; createdAt?: Date; }
export interface Product { id: number; nome: string; preco: number; descricao?: string; imagem?: string; categoria?: string; disponivel?: boolean; }
export interface Order { id: string; items: CartItem[]; total: number; status: "pending" | "confirmed" | "delivered" | "cancelled"; createdAt: Date; }
export interface CartItem { id: number; nome: string; preco: number; quantidade: number; }
export interface Professional { id: number; nome: string; especialidade: string; avaliacao: number; preco: number; disponivel: boolean; imagem?: string; }
export interface Motorista { id: number; nome: string; veiculo: string; avaliacao: number; placa: string; status: "ativo" | "inativo"; }
