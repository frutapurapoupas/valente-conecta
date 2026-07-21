import { useApp } from "@/app/context/AppContext";
export function useAuth() { const { user, isAdmin, login, logout, register, loading } = useApp(); return { user, isAdmin, login, logout, register, loading }; }

