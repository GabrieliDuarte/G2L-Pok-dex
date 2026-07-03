import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { estaLogado, getUsuarioLogado, useAuth } from "../hooks/useAuth";

function Header() {
  const navigate = useNavigate();
  const { deslogar } = useAuth();
  const [temaEscuro, setTemaEscuro] = useState(false);
  const [usuario] = useState(() => getUsuarioLogado());

  useEffect(() => {
    if (temaEscuro) {
      document.body.classList.add("tema-escuro");
    } else {
      document.body.classList.remove("tema-escuro");
    }
  }, [temaEscuro]);

  function irParaHome() {
    if (estaLogado()) navigate("/");
    else navigate("/login");
  }

  function handlePerfil() {
    if (estaLogado()) deslogar();
    else navigate("/login");
  }

  return (
    <header className="app-header">
      <div className="header-logo">
        <img
          src="/icones/Poké_Ball_icon.svg"
          alt="Pokédex"
          className="header-pokeball"
          onClick={irParaHome}
        />
        <span className="header-titulo" onClick={irParaHome}>
          Pokédex G2L
        </span>
      </div>

      <div className="header-icones">
        {usuario && (
          <span className="header-usuario" title={usuario.email}>
            {usuario.nome_treinador}
          </span>
        )}

        {estaLogado() && (
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              padding: 0,
            }}
            title="Ir para o Dashboard"
          >
            <img
              src="/icones/mage--chart-fill.svg"
              alt="Dashboard"
              style={{
                width: "25px",
                height: "25px",
                filter: "brightness(0) invert(1)",
              }}
            />
          </button>
        )}

        <button
          onClick={() => setTemaEscuro(!temaEscuro)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: 0,
          }}
          title={temaEscuro ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
        >
          <img
            src={temaEscuro ? "/icones/Solcheio.svg" : "/icones/Sol.svg"}
            alt="Tema"
            style={{
              width: "30px",
              height: "30px",
              filter: "brightness(0) invert(1)",
            }}
          />
        </button>

        <img
          src="/icones/Boneco.svg"
          alt={estaLogado() ? "Sair" : "Entrar"}
          onClick={handlePerfil}
          style={{
            cursor: "pointer",
            width: "25px",
            height: "25px",
            filter: "brightness(0) invert(1)",
          }}
          title={estaLogado() ? "Sair da conta" : "Entrar"}
        />

        {estaLogado() && (
          <button
            className="btn-meus-times-mobile"
            onClick={() =>
              document.querySelector(".meus-times")?.classList.toggle("aberto")
            }
          >
            Meus Times
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
