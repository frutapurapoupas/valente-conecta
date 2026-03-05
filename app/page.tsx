import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "Arial"
    }}>

      <h1 style={{fontSize: "40px", color:"#2563eb"}}>
        Valente Conecta
      </h1>

      <p style={{marginTop:20, fontSize:18}}>
        Ofertas, serviços e oportunidades da nossa cidade.
      </p>

      <div style={{marginTop:40, display:"flex", gap:20}}>

        <Link href="/ofertas">
          <button style={{padding:"15px 25px", fontSize:16}}>
            Ofertas do dia
          </button>
        </Link>

        <Link href="/servicos">
          <button style={{padding:"15px 25px", fontSize:16}}>
            Serviços
          </button>
        </Link>

        <Link href="/classificados">
          <button style={{padding:"15px 25px", fontSize:16}}>
            Classificados
          </button>
        </Link>

      </div>

      <div style={{marginTop:40}}>
        <Link href="/indicar">
          <button style={{
            padding:"15px 30px",
            background:"#16a34a",
            color:"white",
            fontSize:18,
            borderRadius:8
          }}>
            Indicar app e ganhar R$1
          </button>
        </Link>
      </div>

    </main>
  )
}