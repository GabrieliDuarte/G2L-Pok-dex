import { useState } from "react";
import api from "../services/api"

const fraquezasPorTipo = {
  fire:     ["water", "rock", "ground"],
  water:    ["electric", "grass"],
  grass:    ["fire", "ice", "poison", "flying", "bug"],
  electric: ["ground"],
  ice:      ["fire", "fighting", "rock", "steel"],
  fighting: ["flying", "psychic", "fairy"],
  poison:   ["ground", "psychic"],
  ground:   ["water", "grass", "ice"],
  flying:   ["electric", "ice", "rock"],
  psychic:  ["bug", "ghost", "dark"],
  bug:      ["fire", "flying", "rock"],
  rock:     ["water", "grass", "fighting", "ground", "steel"],
  ghost:    ["ghost", "dark"],
  dragon:   ["ice", "dragon", "fairy"],
  dark:     ["fighting", "bug", "fairy"],
  steel:    ["fire", "fighting", "ground"],
  fairy:    ["poison", "steel"],
  normal:   ["fighting"],
};

function calcularFraquezas(pokemons) {
  const contagem = {};
  pokemons.forEach((pokemon) => {
    pokemon.types.map((t) => t.type.name).forEach((tipo) => {
      (fraquezasPorTipo[tipo] || []).forEach((f) => {
        contagem[f] = (contagem[f] || 0) + 1;
      });
    });
  });
  return Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tipo]) => tipo);
}

function SlotPokemon({ pokemon, onRemover, carregando }) {
  return (
    <div
      className={`slot-pokemon ${pokemon ? "preenchido" : "vazio"} ${carregando ? "carregando" : ""}`}
      onClick={() => pokemon && !carregando && onRemover(pokemon)}
      title={pokemon ? `Remover ${pokemon.name}` : ""}
    >
      {pokemon ? (
        <>
          <img
            src={pokemon.sprites.other["official-artwork"].front_default}
            alt={pokemon.name}
          />
          <span className="slot-nome">
            {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
          </span>
        </>
      ) : (
        <span className="slot-mais">+</span>
      )}
    </div>
  );
}

export default function MeusTime({ times, setTimes, timeAtualId, setTimeAtualId }) {
  const [editandoNome, setEditandoNome]   = useState(false);
  const [novoNome,     setNovoNome]       = useState("");
  const [carregando,   setCarregando]     = useState(false);
  const [erroLocal,    setErroLocal]      = useState("");

  const timeAtual = times.find((t) => t.id === timeAtualId);

  if (!timeAtual) {
    return (
      <aside className="meus-times">
        <p className="time-atual-label">Nenhum time disponível.</p>
      </aside>
    );
  }

  // ── Criar novo time ──────────────────────────────────────────
  async function criarNovoTime() {
    if (times.length >= 10) { alert("Você já tem 10 times!"); return; }
    setCarregando(true);
    setErroLocal("");
    try {
      const { data } = await api.post("/times", {
        nome: `Time ${times.length + 1}`,
      });
      // data já vem no formato { id (UUID), nome, pokemons: [] }
      setTimes((prev) => [...prev, data]);
      setTimeAtualId(data.id);
    } catch (err) {
      setErroLocal(err.response?.data?.erro || "Erro ao criar time.");
    } finally {
      setCarregando(false);
    }
  }

  // ── Excluir time ─────────────────────────────────────────────
  async function excluirTime() {
    if (times.length === 1) { alert("Você precisa ter pelo menos 1 time."); return; }
    if (!window.confirm(`Excluir "${timeAtual.nome}"?`)) return;
    setCarregando(true);
    setErroLocal("");
    try {
      await api.delete(`/times/${timeAtualId}`);
      const novos = times.filter((t) => t.id !== timeAtualId);
      setTimes(novos);
      setTimeAtualId(novos[0].id);
    } catch (err) {
      setErroLocal(err.response?.data?.erro || "Erro ao excluir time.");
    } finally {
      setCarregando(false);
    }
  }

  // ── Editar nome ───────────────────────────────────────────────
  function iniciarEdicao() {
    setNovoNome(timeAtual.nome);
    setEditandoNome(true);
  }

  async function salvarNome() {
    if (!novoNome.trim()) return;
    setCarregando(true);
    setErroLocal("");
    try {
      await api.patch(`/times/${timeAtualId}`, { nome: novoNome.trim() });
      setTimes(times.map((t) =>
        t.id === timeAtualId ? { ...t, nome: novoNome.trim() } : t
      ));
      setEditandoNome(false);
    } catch (err) {
      setErroLocal(err.response?.data?.erro || "Erro ao renomear time.");
    } finally {
      setCarregando(false);
    }
  }

  // ── Remover pokémon ───────────────────────────────────────────
  // O "pokemon" aqui é o objeto que vem do backend (tem campo "id" UUID)
  async function removerPokemon(pokemon) {
    setCarregando(true);
    setErroLocal("");
    try {
      await api.delete(`/times/${timeAtualId}/pokemons/${pokemon.id}`);
      setTimes(times.map((t) =>
        t.id === timeAtualId
          ? { ...t, pokemons: t.pokemons.filter((p) => p.id !== pokemon.id) }
          : t
      ));
    } catch (err) {
      setErroLocal(err.response?.data?.erro || "Erro ao remover pokémon.");
    } finally {
      setCarregando(false);
    }
  }

  const fraquezas = timeAtual.pokemons.length > 0
    ? calcularFraquezas(timeAtual.pokemons)
    : [];

  const slots = Array(6).fill(null).map((_, i) => timeAtual.pokemons[i] || null);

  return (
    <aside className="meus-times">
      <div className="times-header">
        <span className="times-titulo">Meus Times</span>
        <span className="times-contador">{times.length}/10</span>
      </div>

      <div className="times-seletor">
        {editandoNome ? (
          <div className="editar-nome">
            <input
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && salvarNome()}
              autoFocus
            />
            <button className="btn-salvar-nome" onClick={salvarNome} disabled={carregando}>
              ✓
            </button>
          </div>
        ) : (
          // ⚠️  UUID é string — removido o Number() que estava aqui antes
          <select
            value={timeAtualId}
            onChange={(e) => setTimeAtualId(e.target.value)}
            className="select-time"
          >
            {times.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        )}
      </div>

      <p className="time-atual-label">Time Atual ({timeAtual.nome})</p>

      <div className="slots-grid">
        {slots.map((pokemon, i) => (
          <SlotPokemon
            key={i}
            pokemon={pokemon}
            onRemover={removerPokemon}
            carregando={carregando}
          />
        ))}
      </div>

      {erroLocal && <p className="erro-times">{erroLocal}</p>}

      {fraquezas.length > 0 ? (
        <div className="fraquezas-section">
          <p className="fraquezas-titulo">Análise de Fraquezas</p>
          <div className="fraquezas-icones">
            {fraquezas.map((tipo) => (
              <img
                key={tipo}
                src={`https://raw.githubusercontent.com/partywhale/pokemon-type-icons/master/icons/${tipo}.svg`}
                alt={tipo}
                title={tipo}
                className="fraqueza-icon"
              />
            ))}
          </div>
          <p className="fraco-contra">
            <strong>Fraco contra: </strong>
            {fraquezas.map((f) => f.charAt(0).toUpperCase() + f.slice(1)).join(", ")}
          </p>
        </div>
      ) : (
        <div className="fraquezas-vazio">
          <p>Adicione Pokémon ao time para ver as fraquezas</p>
        </div>
      )}

      <div className="times-botoes">
        <button className="btn-criar" onClick={criarNovoTime} disabled={carregando}>
          Criar Novo Time
        </button>
        <div className="botoes-secundarios">
          <button className="btn-editar" onClick={iniciarEdicao} disabled={carregando}>Editar</button>
          <button className="btn-excluir" onClick={excluirTime} disabled={carregando}>Excluir</button>
        </div>
      </div>
    </aside>
  );
}
