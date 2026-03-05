"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Msg = { type: "ok" | "err"; text: string } | null;

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [cidade, setCidade] = useState("Valente");
  const [whatsapp, setWhatsapp] = useState("");
  const [endereco, setEndereco] = useState("");
  const [descricao, setDescricao] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<Msg>(null);

  const canSubmit = useMemo(() => {
    return (
      nome.trim().length >= 2 &&
      categoria.trim().length >= 2 &&
      cidade.trim().length >= 2 &&
      whatsapp.replace(/\D/g, "").length >= 10
    );
  }, [nome, categoria, cidade, whatsapp]);

  function onlyDigits(v: string) {
    return v.replace(/\D/g, "");
  }

  function formatBRPhone(v: string) {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    return v;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!canSubmit) {
      setMsg({
        type: "err",
        text: "Preencha corretamente: Nome, Categoria, Cidade e WhatsApp (com DDD).",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: nome.trim(),
        categoria: categoria.trim(),
        cidade: cidade.trim(),
        whatsapp: onlyDigits(whatsapp),
        endereco: endereco.trim() || null,
        descricao: descricao.trim() || null,
      };

      const { error } = await supabase.from("empresas").insert([payload]);
      if (error) throw error;

      setMsg({ type: "ok", text: "Cadastro salvo com sucesso ✅" });

      // limpa formulário
      setNome("");
      setCategoria("");
      setCidade("Valente");
      setWhatsapp("");
      setEndereco("");
      setDescricao("");
    } catch (err: any) {
      setMsg({
        type: "err",
        text: `Erro ao salvar: ${err?.message || "Falha desconhecida"}`,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vc-shell">
      {/* Fundo premium */}
      <div className="vc-bg" aria-hidden="true" />

      {/* Topbar mobile (quando sidebar some) */}
      <header className="vc-topbar">
        <div className="vc-brand">
          <div className="vc-logoMark" aria-hidden="true" />
          <div>
            <div className="vc-brandTitle">Valente Conecta</div>
            <div className="vc-brandSub">Painel do Parceiro</div>
          </div>
        </div>

        <nav className="vc-topLinks">
          <Link className="vc-link" href="/">Início</Link>
          <Link className="vc-link" href="/servicos">Serviços</Link>
          <Link className="vc-link" href="/ofertas">Ofertas</Link>
          <Link className="vc-link" href="/classificados">Classificados</Link>
        </nav>
      </header>

      <div className="vc-layout">
        {/* Sidebar (estilo “painel”) */}
        <aside className="vc-sidebar">
          <div className="vc-sideBrand">
            <div className="vc-sideLogo">
              {/* Se quiser sua logo real, coloque /public/logo.png e troque por <img .../> */}
              <div className="vc-logoMark big" />
            </div>
            <div className="vc-sideBrandText">
              <div className="vc-sideTitle">VALENTE</div>
              <div className="vc-sideTitle2">CONECTA</div>
              <div className="vc-sideTag">PAINEL DO PARCEIRO</div>
            </div>
          </div>

          <div className="vc-profile">
            <div className="vc-avatar" aria-hidden="true" />
            <div>
              <div className="vc-profileName">Parceiro</div>
              <div className="vc-profileRole">Cadastro de empresa</div>
            </div>
          </div>

          <div className="vc-menu">
            <Link className="vc-menuItem" href="/">🏠 Dashboard</Link>
            <Link className="vc-menuItem" href="/servicos">🛠️ Serviços</Link>
            <Link className="vc-menuItem" href="/ofertas">🔥 Ofertas</Link>
            <Link className="vc-menuItem" href="/classificados">🧾 Classificados</Link>

            <div className="vc-menuSep" />

            <Link className="vc-menuItem active" href="/cadastro">➕ Cadastrar empresa</Link>
          </div>

          <div className="vc-sideFooter">
            <div className="vc-footTiny">© {new Date().getFullYear()} Valente Conecta</div>
            <div className="vc-footTiny muted">Gerencie seus serviços locais.</div>
          </div>
        </aside>

        {/* Conteúdo */}
        <main className="vc-main">
          <div className="vc-card">
            <div className="vc-cardHeader">
              <div>
                <h1 className="vc-h1">Cadastro de Empresa</h1>
                <p className="vc-p">Cadastre sua empresa para aparecer no Valente Conecta.</p>
              </div>

              <div className="vc-badges">
                <span className="vc-badge">Parceiro</span>
                <span className="vc-badge outline">Valente • BA</span>
              </div>
            </div>

            <form className="vc-form" onSubmit={onSubmit}>
              <div className="vc-grid">
                <div className="vc-field">
                  <label className="vc-label">Nome</label>
                  <input
                    className="vc-input"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Padaria Central"
                    autoComplete="organization"
                  />
                </div>

                <div className="vc-field">
                  <label className="vc-label">Categoria</label>
                  <input
                    className="vc-input"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    placeholder="Ex: Padaria, Mercado, Oficina..."
                  />
                </div>

                <div className="vc-field">
                  <label className="vc-label">Cidade</label>
                  <input
                    className="vc-input"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Ex: Valente"
                  />
                </div>

                <div className="vc-field">
                  <label className="vc-label">WhatsApp</label>
                  <input
                    className="vc-input"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatBRPhone(e.target.value))}
                    placeholder="(75) 99999-9999"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                  <div className="vc-help">Use DDD. Ex: (75) 99999-9999</div>
                </div>

                <div className="vc-field vc-span2">
                  <label className="vc-label">Endereço</label>
                  <input
                    className="vc-input"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Ex: Rua Denerval Simões, 38 - Centro"
                    autoComplete="street-address"
                  />
                </div>

                <div className="vc-field vc-span2">
                  <label className="vc-label">Descrição</label>
                  <textarea
                    className="vc-textarea"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Conte o que você faz, horário, diferenciais..."
                    rows={4}
                  />
                </div>
              </div>

              {msg && (
                <div className={`vc-msg ${msg.type === "ok" ? "ok" : "err"}`}>
                  {msg.text}
                </div>
              )}

              <div className="vc-actions">
                <Link className="vc-secondary" href="/">
                  Voltar
                </Link>

                <button className="vc-primary" type="submit" disabled={!canSubmit || loading}>
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>

      <style jsx>{`
        .vc-shell {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          color: #0f172a;
          font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans",
            sans-serif;
        }

        .vc-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(1200px 700px at 15% 10%, rgba(0, 136, 255, 0.20), transparent 60%),
            radial-gradient(900px 600px at 80% 15%, rgba(255, 140, 0, 0.16), transparent 55%),
            radial-gradient(900px 600px at 60% 90%, rgba(59, 130, 246, 0.18), transparent 55%),
            linear-gradient(180deg, #071428 0%, #0b1b33 40%, #081227 100%);
          z-index: 0;
        }

        .vc-topbar {
          display: none;
          position: relative;
          z-index: 2;
          padding: 14px 16px;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(6, 16, 35, 0.65);
          backdrop-filter: blur(10px);
        }

        .vc-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .vc-logoMark {
          width: 28px;
          height: 28px;
          border-radius: 10px;
          background: conic-gradient(from 220deg, #0ea5e9, #2563eb, #f59e0b, #fb923c, #0ea5e9);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
        }
        .vc-logoMark.big {
          width: 44px;
          height: 44px;
          border-radius: 16px;
        }

        .vc-brandTitle {
          font-weight: 800;
          letter-spacing: 0.3px;
          color: #eaf2ff;
          font-size: 14px;
          line-height: 1.1;
        }

        .vc-brandSub {
          font-size: 12px;
          color: rgba(234, 242, 255, 0.75);
        }

        .vc-topLinks {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .vc-link {
          color: rgba(234, 242, 255, 0.85);
          text-decoration: none;
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.05);
        }
        .vc-link:hover {
          background: rgba(255, 255, 255, 0.09);
        }

        .vc-layout {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 22px;
          padding: 26px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .vc-sidebar {
          border-radius: 22px;
          padding: 18px;
          background: rgba(8, 20, 46, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.10);
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          display: flex;
          flex-direction: column;
          min-height: 640px;
        }

        .vc-sideBrand {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 6px 6px 14px;
        }

        .vc-sideBrandText {
          line-height: 1.05;
        }

        .vc-sideTitle {
          font-weight: 900;
          letter-spacing: 1px;
          color: #eaf2ff;
          font-size: 16px;
        }
        .vc-sideTitle2 {
          font-weight: 900;
          letter-spacing: 1px;
          color: #ffb14a;
          font-size: 16px;
        }
        .vc-sideTag {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(234, 242, 255, 0.75);
        }

        .vc-profile {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 14px 12px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.10);
          margin-top: 6px;
        }

        .vc-avatar {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background:
            radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.22), transparent 55%),
            linear-gradient(135deg, rgba(14, 165, 233, 0.85), rgba(245, 158, 11, 0.80));
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.35);
        }

        .vc-profileName {
          font-weight: 800;
          color: #eaf2ff;
          font-size: 13px;
        }
        .vc-profileRole {
          color: rgba(234, 242, 255, 0.75);
          font-size: 12px;
        }

        .vc-menu {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .vc-menuItem {
          text-decoration: none;
          color: rgba(234, 242, 255, 0.88);
          padding: 11px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.10);
          background: rgba(255, 255, 255, 0.05);
          font-size: 13px;
        }
        .vc-menuItem:hover {
          background: rgba(255, 255, 255, 0.09);
        }
        .vc-menuItem.active {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.95), rgba(14, 165, 233, 0.85));
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 18px 45px rgba(37, 99, 235, 0.25);
        }

        .vc-menuSep {
          height: 1px;
          background: rgba(255, 255, 255, 0.10);
          margin: 6px 2px;
        }

        .vc-sideFooter {
          margin-top: auto;
          padding: 10px 8px 4px;
        }
        .vc-footTiny {
          font-size: 12px;
          color: rgba(234, 242, 255, 0.70);
        }
        .vc-footTiny.muted {
          color: rgba(234, 242, 255, 0.55);
          margin-top: 4px;
        }

        .vc-main {
          display: flex;
          align-items: flex-start;
        }

        .vc-card {
          width: 100%;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.30);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.45);
          overflow: hidden;
        }

        .vc-cardHeader {
          padding: 18px 18px 10px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 14px;
          border-bottom: 1px solid rgba(15, 23, 42, 0.08);
          background:
            radial-gradient(900px 220px at 0% 0%, rgba(37, 99, 235, 0.12), transparent 65%),
            radial-gradient(900px 220px at 100% 0%, rgba(245, 158, 11, 0.10), transparent 60%);
        }

        .vc-h1 {
          margin: 0;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -0.2px;
          color: #0b1730;
        }

        .vc-p {
          margin: 6px 0 0;
          font-size: 13px;
          color: rgba(15, 23, 42, 0.72);
        }

        .vc-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .vc-badge {
          font-size: 12px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(37, 99, 235, 0.12);
          border: 1px solid rgba(37, 99, 235, 0.20);
          color: rgba(15, 23, 42, 0.85);
          font-weight: 700;
        }
        .vc-badge.outline {
          background: transparent;
          border: 1px solid rgba(15, 23, 42, 0.14);
          color: rgba(15, 23, 42, 0.78);
        }

        .vc-form {
          padding: 18px;
        }

        .vc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .vc-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .vc-span2 {
          grid-column: span 2;
        }

        .vc-label {
          font-size: 12px;
          font-weight: 800;
          color: rgba(15, 23, 42, 0.80);
        }

        .vc-input,
        .vc-textarea {
          border-radius: 14px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          background: rgba(255, 255, 255, 0.95);
          padding: 12px 12px;
          font-size: 14px;
          outline: none;
          transition: 150ms ease;
        }

        .vc-input:focus,
        .vc-textarea:focus {
          border-color: rgba(37, 99, 235, 0.50);
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }

        .vc-textarea {
          resize: vertical;
          min-height: 110px;
        }

        .vc-help {
          font-size: 12px;
          color: rgba(15, 23, 42, 0.55);
          margin-top: -3px;
        }

        .vc-msg {
          margin-top: 14px;
          padding: 12px 12px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 13px;
          border: 1px solid transparent;
        }
        .vc-msg.ok {
          background: rgba(34, 197, 94, 0.10);
          border-color: rgba(34, 197, 94, 0.22);
          color: #14532d;
        }
        .vc-msg.err {
          background: rgba(239, 68, 68, 0.10);
          border-color: rgba(239, 68, 68, 0.20);
          color: #7f1d1d;
        }

        .vc-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid rgba(15, 23, 42, 0.08);
        }

        .vc-secondary {
          text-decoration: none;
          padding: 12px 14px;
          border-radius: 14px;
          font-weight: 800;
          font-size: 13px;
          border: 1px solid rgba(15, 23, 42, 0.14);
          color: rgba(15, 23, 42, 0.85);
          background: rgba(255, 255, 255, 0.90);
        }
        .vc-secondary:hover {
          background: #fff;
        }

        .vc-primary {
          padding: 12px 16px;
          border-radius: 14px;
          border: 0;
          cursor: pointer;
          font-weight: 900;
          font-size: 14px;
          color: white;
          min-width: 180px;
          background: linear-gradient(135deg, #2563eb, #0ea5e9);
          box-shadow: 0 18px 50px rgba(37, 99, 235, 0.25);
        }
        .vc-primary:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Responsivo */
        @media (max-width: 980px) {
          .vc-layout {
            grid-template-columns: 1fr;
            padding: 18px;
          }
          .vc-sidebar {
            display: none;
          }
          .vc-topbar {
            display: flex;
          }
        }

        @media (max-width: 640px) {
          .vc-grid {
            grid-template-columns: 1fr;
          }
          .vc-span2 {
            grid-column: span 1;
          }
          .vc-actions {
            flex-direction: column;
            align-items: stretch;
          }
          .vc-primary {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}