import { useState } from "react";

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

function SlotPokemon({ pokemon, onRemover }) {
  return (
    <div
      className={`slot-pokemon ${pokemon ? "preenchido" : "vazio"}`}
      onClick={() => pokemon && onRemover(pokemon)}
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
  const [editandoNome, setEditandoNome] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  const timeAtual = times.find((t) => t.id === timeAtualId);

  function criarNovoTime() {
    if (times.length >= 10) { alert("Você já tem 10 times!"); return; }
    const novoId = Date.now();
    const novoTime = { id: novoId, nome: `Time ${times.length + 1}`, pokemons: [] };
    setTimes([...times, novoTime]);
    setTimeAtualId(novoId);
  }

  function excluirTime() {
    if (times.length === 1) { alert("Você precisa ter pelo menos 1 time."); return; }
    const novos = times.filter((t) => t.id !== timeAtualId);
    setTimes(novos);
    setTimeAtualId(novos[0].id);
  }

  function iniciarEdicao() {
    setNovoNome(timeAtual.nome);
    setEditandoNome(true);
  }

  function salvarNome() {
    if (!novoNome.trim()) return;
    setTimes(times.map((t) => t.id === timeAtualId ? { ...t, nome: novoNome.trim() } : t));
    setEditandoNome(false);
  }

  function removerPokemon(pokemon) {
    setTimes(times.map((t) =>
      t.id === timeAtualId
        ? { ...t, pokemons: t.pokemons.filter((p) => p.id !== pokemon.id) }
        : t
    ));
  }

  const fraquezas = timeAtual?.pokemons.length > 0
    ? calcularFraquezas(timeAtual.pokemons)
    : [];

  const slots = Array(6).fill(null).map((_, i) => timeAtual?.pokemons[i] || null);

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
            <button className="btn-salvar-nome" onClick={salvarNome}>✓</button>
          </div>
        ) : (
          <select
            value={timeAtualId}
            onChange={(e) => setTimeAtualId(Number(e.target.value))}
            className="select-time"
          >
            {times.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        )}
      </div>

      <p className="time-atual-label">Time Atual ({timeAtual?.nome})</p>

      <div className="slots-grid">
        {slots.map((pokemon, i) => (
          <SlotPokemon key={i} pokemon={pokemon} onRemover={removerPokemon} />
        ))}
      </div>

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
        <button className="btn-criar" onClick={criarNovoTime}>Criar Novo Time</button>
        <div className="botoes-secundarios">
          <button className="btn-editar" onClick={iniciarEdicao}>Editar</button>
          <button className="btn-excluir" onClick={excluirTime}>Excluir</button>
        </div>
      </div>
    </aside>
  );
}
