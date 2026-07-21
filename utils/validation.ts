export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidPhone = (phone: string): boolean => /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/.test(phone);
export const isValidCpf = (cpf: string): boolean => { const cleaned = cpf.replace(/\D/g, ""); if (cleaned.length !== 11) return false; return true; };

