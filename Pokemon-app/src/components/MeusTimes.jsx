import { useState } from "react";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import api from "../services/api";

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

const fortalezasPorTipo = {
  fire:     ["grass", "ice", "bug", "steel"],
  water:    ["fire", "ground", "rock"],
  grass:    ["water", "ground", "rock"],
  electric: ["water", "flying"],
  ice:      ["grass", "ground", "flying", "dragon"],
  fighting: ["normal", "ice", "rock", "dark", "steel"],
  poison:   ["grass", "fairy"],
  ground:   ["fire", "electric", "poison", "rock", "steel"],
  flying:   ["grass", "fighting", "bug"],
  psychic:  ["fighting", "poison"],
  bug:      ["grass", "psychic", "dark"],
  rock:     ["fire", "ice", "flying", "bug"],
  ghost:    ["psychic", "ghost"],
  dragon:   ["dragon"],
  dark:     ["psychic", "ghost"],
  steel:    ["ice", "rock", "fairy"],
  fairy:    ["fighting", "dragon", "dark"],
  normal:   [],
};

function contarTipos(pokemons, mapaPorTipo) {
  const contagem = {};
  pokemons.forEach((pokemon) => {
    pokemon.types.map((t) => t.type.name).forEach((tipo) => {
      (mapaPorTipo[tipo] || []).forEach((alvo) => {
        contagem[alvo] = (contagem[alvo] || 0) + 1;
      });
    });
  });
  return contagem;
}

function formatarTipo(tipo) {
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function calcularAnaliseTipos(pokemons) {
  const fraquezas = contarTipos(pokemons, fraquezasPorTipo);
  const fortalezas = contarTipos(pokemons, fortalezasPorTipo);

  const tiposRelevantes = [
    ...new Set([...Object.keys(fraquezas), ...Object.keys(fortalezas)]),
  ]
    .sort((a, b) => {
      const totalA = (fraquezas[a] || 0) + (fortalezas[a] || 0);
      const totalB = (fraquezas[b] || 0) + (fortalezas[b] || 0);
      return totalB - totalA;
    })
    .slice(0, 8);

  const chartData = tiposRelevantes.map((tipo) => ({
    tipo: formatarTipo(tipo),
    fraqueza: fraquezas[tipo] || 0,
    forte: fortalezas[tipo] || 0,
  }));

  const topFraquezas = Object.entries(fraquezas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tipo]) => tipo);

  const topFortalezas = Object.entries(fortalezas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tipo]) => tipo);

  return { chartData, topFraquezas, topFortalezas };
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

  const analiseTipos = timeAtual.pokemons.length > 0
    ? calcularAnaliseTipos(timeAtual.pokemons)
    : null;

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

      {analiseTipos ? (
        <div className="fraquezas-section">
          <p className="fraquezas-titulo">Análise de Tipos</p>

          <div className="tipo-radar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={analiseTipos.chartData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="var(--borda)" />
                <PolarAngleAxis
                  dataKey="tipo"
                  tick={{ fill: "var(--texto-suave)", fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card-bg)",
                    border: "1px solid var(--borda)",
                    borderRadius: "8px",
                    fontSize: "0.75rem",
                  }}
                />
                <Radar
                  name="Fraco contra"
                  dataKey="fraqueza"
                  stroke="#e74c3c"
                  fill="#e74c3c"
                  fillOpacity={0.35}
                />
                <Radar
                  name="Forte contra"
                  dataKey="forte"
                  stroke="#27ae60"
                  fill="#27ae60"
                  fillOpacity={0.35}
                />
                <Legend wrapperStyle={{ fontSize: "0.72rem" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <p className="fraco-contra">
            <strong>Fraco contra: </strong>
            {analiseTipos.topFraquezas.map(formatarTipo).join(", ")}
          </p>
          <p className="forte-contra">
            <strong>Forte contra: </strong>
            {analiseTipos.topFortalezas.map(formatarTipo).join(", ")}
          </p>
        </div>
      ) : (
        <div className="fraquezas-vazio">
          <p>Adicione Pokémon ao time para ver a análise de tipos</p>
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
