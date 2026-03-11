import Link from "next/link";

export default function AppHeader() {
  return (
    <div className="topbar">
      <Link href="/" className="brand">
        <img src="/logo-valente-conecta.png" alt="Valente Conecta" />
        <div>
          <div className="brand-title">Valente Conecta</div>
          <div className="brand-subtitle">Super app da cidade</div>
        </div>
      </Link>
    </div>
  );
}