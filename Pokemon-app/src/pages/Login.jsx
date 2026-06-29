import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { estaLogado, useAuth } from "../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { logar, loading, erro } = useAuth();

  const [form, setForm] = useState({
    email: "",
    senha: "",
  });

  useEffect(() => {
    if (estaLogado()) navigate("/", { replace: true });
  }, [navigate]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await logar(form);
  }

  return (
    <div className="cadastro-page">
      <Header />

      <main className="cadastro-container">
        <div className="cadastro-card">
          <div className="cadastro-header">
            <h1>Entrar</h1>
            <p>Acesse sua conta e continue montando seus times!</p>
          </div>

          <form className="cadastro-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>E-mail</label>
              <input
                type="email"
                name="email"
                placeholder="treinador@poke.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <input
                type="password"
                name="senha"
                placeholder="••••••••"
                value={form.senha}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>

            {erro && <p className="erro-form">{erro}</p>}

            <button
              className="btn-finalizar-cadastro"
              type="submit"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="link-login">
            Ainda não tem conta?{" "}
            <span onClick={() => navigate("/cadastro")}>Criar conta</span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
