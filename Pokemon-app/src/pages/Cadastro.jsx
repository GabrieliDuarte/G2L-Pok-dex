import React from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

function Cadastro() {
  const navigate = useNavigate();

  return (
    <div className="cadastro-page">
      <Header />
      
      <main className="cadastro-container">
        <div className="cadastro-card">
          <div className="cadastro-header">
            <h1>Criar Conta</h1>
            <p>Junte-se à Pokédex G2L e salve seus times!</p>
          </div>

          <form className="cadastro-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <label>Nome de Treinador</label>
              <input type="text" placeholder="Ex: Ash Ketchum" />
            </div>

            <div className="input-group">
              <label>E-mail</label>
              <input type="email" placeholder="treinador@poke.com" />
            </div>

            <div className="input-group">
              <label>Senha</label>
              <input type="password" placeholder="••••••••" />
            </div>

            <button className="btn-finalizar-cadastro">
              Começar Jornada
            </button>
          </form>

          <p className="link-login">
            Já tem uma conta? <span onClick={() => navigate("/")}>Fazer Login</span>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Cadastro;