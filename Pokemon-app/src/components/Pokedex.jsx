import { useState, useEffect, useRef } from "react";
import pokeapi from "../services/pokeapi";

const TOTAL_POKEMONS = 1025;
const LIMITE = 48;
const tiposPokemon = [
  "bug", "grass", "fairy", "normal", "dragon", "psychic",
  "ghost", "ground", "steel", "fire", "flying", "ice",
  "electric", "rock", "dark", "water", "fighting", "poison",
];

export default function Pokedex({
  timeAtualId,
  pokemonsDoTime,
  onAdicionarPokemon,
  timesCarregando,
}) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState("");
  const [busca, setBusca] = useState("");
  const [listaPokemon, setListaPokemon] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const totalPaginas = Math.ceil(TOTAL_POKEMONS / LIMITE);
  const isMounted = useRef(true);
  const [favoritos, setFavoritos] = useState(() => {
    const favoritosSalvos = localStorage.getItem("meusFavoritosG2L");
    if (favoritosSalvos) {
      return JSON.parse(favoritosSalvos);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("meusFavoritosG2L", JSON.stringify(favoritos));
  }, [favoritos]);
  useEffect(() => {
    async function carregarListaPokemon() {
      try {
        const res = await pokeapi.get(`pokemon?limit=${TOTAL_POKEMONS}`);
        const lista = res.data.results.map((p) => {
          const id = p.url.split("/").filter(Boolean).pop();
          return {
            id,
            name: p.name,
            img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        });
        if (isMounted.current) setListaPokemon(lista);
      } catch (e) {
        console.error(e);
      }
    }
    carregarListaPokemon();
  }, []);

  async function loadPokemonPage(page) {
    setLoading(true);
    const inicio = (page - 1) * LIMITE + 1;
    const fim = Math.min(inicio + LIMITE - 1, TOTAL_POKEMONS);
    try {
      const results = await Promise.all(
        Array.from({ length: fim - inicio + 1 }, (_, i) =>
          pokeapi.get(`pokemon/${inicio + i}`).then((r) => r.data)
        )
      );
      if (isMounted.current) setPokemons(results);
    } catch (e) {
      console.error(e);
    }
    if (isMounted.current) setLoading(false);
  }

  useEffect(() => {
    const id = setTimeout(() => loadPokemonPage(1), 0);
    return () => {
      clearTimeout(id);
      isMounted.current = false;
    };
  }, []);

  function mudarPagina(novaPagina) {
    setPaginaAtual(novaPagina);
    if (!tipo && !busca) loadPokemonPage(novaPagina);
  }

  async function filtrarPorTipo(tipoSelecionado) {
    if (tipo === tipoSelecionado) {
      setTipo("");
      loadPokemonPage(paginaAtual);
      return;
    }
    setTipo(tipoSelecionado);
    setLoading(true);
    const res = await pokeapi.get(`type/${tipoSelecionado}`);
    const promises = res.data.pokemon.map((p) =>
      pokeapi.get(p.pokemon.url).then((r) => r.data)
    );
    const results = await Promise.all(promises);
    if (isMounted.current) {
      setPokemons(results);
      setLoading(false);
    }
  }

  async function buscarPokemon(e) {
    e.preventDefault();
    if (!busca.trim()) return;
    setSugestoes([]);
    setLoading(true);
    try {
      const res = await pokeapi.get(`pokemon/${busca.toLowerCase().trim()}`);
      setPokemons([res.data]);
      setTipo("");
    } catch {
      alert("Pokémon não encontrado!");
    }
    setLoading(false);
  }

  function handleBuscaChange(e) {
    const valor = e.target.value;
    setBusca(valor);

    const valorLimpo = valor.toLowerCase().trim();
    if (valorLimpo === "") {
      setSugestoes([]);
      return;
    }

    const filtrados = listaPokemon.filter(
      (p) => p.name.includes(valorLimpo) || p.id === valorLimpo
    );
    setSugestoes(filtrados.slice(0, 8));
  }

  async function selecionarSugestao(nomePokemon) {
    setSugestoes([]);
    setBusca("");
    try {
      const res = await pokeapi.get(`pokemon/${nomePokemon}`);
      await adicionarAoTime(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  function limparBusca() {
    setBusca("");
    setSugestoes([]);
    setTipo("");
    loadPokemonPage(paginaAtual);
  }

  async function adicionarAoTime(pokemon) {
    if (timesCarregando) {
      alert("Aguarde o carregamento dos times.");
      return;
    }
    if (!timeAtualId) {
      alert("Nenhum time selecionado.");
      return;
    }
    if (pokemonsDoTime.length >= 6) {
      alert("Seu time já tem 6 Pokémon!");
      return;
    }
    if (pokemonsDoTime.some((p) => p.pokemon_id === pokemon.id)) {
      alert("Esse Pokémon já está no time!");
      return;
    }
    await onAdicionarPokemon(pokemon);
  }

  function favoritarPokemon(e, id) {
    e.stopPropagation();

    if (favoritos.includes(id)) {
      setFavoritos(favoritos.filter((favId) => favId !== id));
    } else {
      setFavoritos([...favoritos, id]);
    }
  }

  function spriteOficial(pokemon) {
    return (
      pokemon.sprites?.other?.["official-artwork"]?.front_default ||
      pokemon.sprites?.front_default ||
      "/icones/Poké_Ball_icon.svg"
    );
  }

  return (
    <main className="pokedex-main">
      <form className="busca-form" onSubmit={buscarPokemon}>
        <div className="busca-input-wrapper">
          <input
            className="busca-input"
            type="text"
            placeholder="Pesquisar Pokémon (nome ou número)"
            value={busca}
            onChange={handleBuscaChange}
            autoComplete="off"
          />
          {sugestoes.length > 0 && (
            <ul className="search-container">
              {sugestoes.map((p) => (
                <li
                  key={p.id}
                  className="search-results"
                  onClick={() => selecionarSugestao(p.name)}
                >
                  <img src={p.img} alt={p.name} width="40" />
                  <span>
                    #{String(p.id).padStart(3, "0")}{" "}
                    {p.name.charAt(0).toUpperCase() + p.name.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button type="submit" className="busca-btn">
          🔍
        </button>
        {busca && (
          <button type="button" className="busca-limpar" onClick={limparBusca}>
            ✕
          </button>
        )}
      </form>

      <div className="filtros-section">
        <h3 className="filtros-titulo">Filtros de Elemento</h3>
        <div className="tipos-container">
          {tiposPokemon.map((t) => (
            <button
              key={t}
              className={`tipo-btn ${tipo === t ? "ativo" : ""}`}
              onClick={() => filtrarPorTipo(t)}
              title={t}
            >
              <img
                src={`https://raw.githubusercontent.com/partywhale/pokemon-type-icons/master/icons/${t}.svg`}
                alt={t}
              />
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="pokeball-loader" />
          <p>Carregando Pokémon...</p>
        </div>
      ) : (
        <div className="pokemon-grid">
          {pokemons.map((pokemon) => (
            <div
              key={pokemon.id}
              className="pokemon-card"
              onClick={() => adicionarAoTime(pokemon)}
              title={`Adicionar ${pokemon.name} ao time`}
            >
              <button
                className="btn-favorito"
                onClick={(e) => favoritarPokemon(e, pokemon.id)}
                title="Favoritar"
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px",
                  zIndex: 10,
                }}
              >
                <img
                  src={
                    favoritos.includes(pokemon.id)
                      ? "/icones/EstrelaPreenchida.svg"
                      : "/icones/Estrela.svg"
                  }
                  alt="Favorito"
                  style={{ width: "24px", height: "24px" }}
                />
              </button>

              <span className="pokemon-numero">
                #{String(pokemon.id).padStart(3, "0")}
              </span>
              <img src={spriteOficial(pokemon)} alt={pokemon.name} />
              <h3 className="pokemon-nome">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </h3>
              <div className="pokemon-tipos">
                {pokemon.types.map((t) => (
                  <span
                    key={t.type.name}
                    className="pokemon-tipo-badge"
                    data-tipo={t.type.name}
                  >
                    {t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tipo === "" && !busca && (
        <div className="paginacao">
          <button
            onClick={() =>
              mudarPagina(paginaAtual <= 1 ? totalPaginas : paginaAtual - 1)
            }
          >
            ‹ Anterior
          </button>
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <button
            onClick={() =>
              mudarPagina(paginaAtual >= totalPaginas ? 1 : paginaAtual + 1)
            }
          >
            Próxima ›
          </button>
        </div>
      )}
    </main>
  );
}
