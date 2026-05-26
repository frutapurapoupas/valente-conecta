interface CardProps { children: React.ReactNode; className?: string; onClick?: () => void; }
export function Card({ children, className = "", onClick }: CardProps) {
  return <div onClick={onClick} className={`bg-white/10 rounded-2xl p-4 transition-all hover:-translate-y-1 ${className}`}>{children}</div>;
}
