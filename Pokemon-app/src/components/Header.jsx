import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  
  const [temaEscuro, setTemaEscuro] = useState(false);

  useEffect(() => {
    if (temaEscuro) {
      document.body.classList.add("tema-escuro");
    } else {
      document.body.classList.remove("tema-escuro");
    }
  }, [temaEscuro]);

  return (
    <header className="app-header">
      <div className="header-logo">
        <img
          src="/icones/Poké_Ball_icon.svg"
          alt="Pokédex"
          className="header-pokeball"
          onClick={() => {navigate("/")}}
        />
        <span className="header-titulo" onClick={() => {navigate("/")}}>
          Pokédex G2L
        </span>
      </div>
      
      <div className="header-icones">
        <button 
          onClick={() => {navigate("/dashboard")}}
          style={{ 
            background: "transparent", 
            border: "none", 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 0
          }}
          title="Ir para o Dashboard"
        >
          <img 
            src="/icones/EstrelaPreenchida.svg" 
            alt="Dashboard" 
            style={{ width: "25px", height: "25px", filter: "brightness(0) invert(1)" }} 
          />
        </button>

        <button 
          onClick={() => setTemaEscuro(!temaEscuro)}
          style={{ 
            background: "transparent", 
            border: "none", 
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 0
          }}
          title={temaEscuro ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
        >
          <img 
            src={temaEscuro ? "/icones/Solcheio.svg" : "/icones/Sol.svg"} 
            alt="Tema" 
            style={{ width: "30px", height: "30px", filter: "brightness(0) invert(1)" }} 
          />
        </button>

        <img 
          src="/icones/Boneco.svg" 
          alt="Login" 
          onClick={() => {navigate("/cadastro")}}
          style={{ cursor: "pointer", width: "25px", height: "25px", filter: "brightness(0) invert(1)" }}
          title="Meu Perfil"
        />

        <button
          className="btn-meus-times-mobile"
          onClick={() => document.querySelector(".meus-times").classList.toggle("aberto")}
        >
          Meus Times
        </button>

      </div>
    </header>
  );
}

export default Header;