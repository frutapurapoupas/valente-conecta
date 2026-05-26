interface ButtonProps { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "secondary" | "danger"; className?: string; disabled?: boolean; }
export function Button({ children, onClick, variant = "primary", className = "", disabled = false }: ButtonProps) {
  const variants = { primary: "bg-blue-500 hover:bg-blue-600", secondary: "bg-gray-500 hover:bg-gray-600", danger: "bg-red-500 hover:bg-red-600" };
  return <button onClick={onClick} disabled={disabled} className={`${variants[variant]} text-white px-4 py-2 rounded-xl font-medium transition-all disabled:opacity-50 ${className}`}>{children}</button>;
}
