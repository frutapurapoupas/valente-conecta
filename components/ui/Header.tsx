import { useRouter } from "next/navigation";
interface HeaderProps { title: string; showBack?: boolean; }
export function Header({ title, showBack = true }: HeaderProps) {
  const router = useRouter();
  return <header className="gradient-primary p-4 flex items-center gap-3 sticky top-0 z-40">{showBack && <button onClick={() => router.back()}><i className="fas fa-arrow-left text-white"></i></button>}<h1 className="text-white font-bold text-xl">{title}</h1></header>;
}
