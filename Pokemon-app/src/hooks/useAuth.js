import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function cadastrar({ nome_treinador, email, senha }) {
    setLoading(true);
    setErro("");
    try {
      const { data } = await api.post("/auth/cadastro", { nome_treinador, email, senha });
      salvarSessao(data);
      navigate("/");
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  }

  async function logar({ email, senha }) {
    setLoading(true);
    setErro("");
    try {
      const { data } = await api.post("/auth/login", { email, senha });
      salvarSessao(data);
      navigate("/");
    } catch (err) {
      setErro(err.response?.data?.erro || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  function deslogar() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  }

  return { cadastrar, logar, deslogar, loading, erro };
}

function salvarSessao({ token, usuario }) {
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(usuario));
}

export function getUsuarioLogado() {
  const raw = localStorage.getItem("usuario");
  return raw ? JSON.parse(raw) : null;
}

export function estaLogado() {
  return !!localStorage.getItem("token");
}
