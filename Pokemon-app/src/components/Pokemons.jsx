import { useState, useEffect } from "react";

const TOTAL_POKEMONS = 1025;
const limite = 27;

export default function Pokedex({ time, setTime }) {
  const tiposPokemon = [
    "bug",
    "grass",
    "fairy",
    "normal",
    "dragon",
    "psychic",
    "ghost",
    "ground",
    "steel",
    "fire",
    "flying",
    "ice",
    "electric",
    "rock",
    "dark",
    "water",
    "fighting",
    "poison",
  ];
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState("");

  const totalPaginas = Math.ceil(TOTAL_POKEMONS / limite);

  async function getPokemon(id) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    return res.json();
  }

  async function loadPokemonPage(page) {
    if (loading) return;

    setLoading(true);

    const inicio = (page - 1) * limite + 1;
    const fim = Math.min(inicio + limite - 1, TOTAL_POKEMONS);

    try {
      const promises = [];

      for (let i = inicio; i <= fim; i++) {
        promises.push(getPokemon(i));
      }

      const results = await Promise.all(promises);

      setPokemons(results);
    } catch (erro) {
      console.error("Erro ao carregar Pokémon:", erro);
    }

    setLoading(false);
  }

  async function filtrarPorTipo(tipoSelecionado) {
    if (tipo === tipoSelecionado) {
      setTipo("");
      loadPokemonPage(paginaAtual);
      return;
    }

    setTipo(tipoSelecionado);
    setLoading(true);

    const res = await fetch(
      `https://pokeapi.co/api/v2/type/${tipoSelecionado}`,
    );

    const data = await res.json();

    const lista = data.pokemon;

    const promises = lista.map((p) =>
      fetch(p.pokemon.url).then((r) => r.json()),
    );

    const results = await Promise.all(promises);

    setPokemons(results);
    setLoading(false);
  }

  useEffect(() => {
    loadPokemonPage(paginaAtual);
  }, [paginaAtual, tipo]);

  function paginaAnterior() {
    setPaginaAtual((p) => (p <= 1 ? totalPaginas : p - 1));
  }

  function proximaPagina() {
    setPaginaAtual((p) => (p >= totalPaginas ? 1 : p + 1));
  }

  async function selecionarPokemon(nomePokemon) {
    const data = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${nomePokemon}`,
    );

    const res = await data.json();

    if (time.length >= 5) {
      alert("Seu time já tem 5 Pokémon");
      return;
    }

    setTime([...time, res]);
  }

  return (
    <div>
      <div className="tipos-container">
        {tiposPokemon.map((tipoPokemon) => (
          <img
            key={tipoPokemon}
            src={`https://raw.githubusercontent.com/partywhale/pokemon-type-icons/master/icons/${tipoPokemon}.svg`}
            className={`tipo-icon ${tipo === tipoPokemon ? "ativo" : ""}`}
            onClick={() => filtrarPorTipo(tipoPokemon)}
          />
        ))}
      </div>

      {loading && <p>Carregando...</p>}

      <div className="pokemon-container">
        {pokemons.map((pokemon) => (
          <div key={pokemon.id} className="pokemon">
            <img
              src={pokemon.sprites.other["official-artwork"].front_default}
              className="poke-icon"
              alt={pokemon.name}
              height={100}
              width={100}
              onClick={() => selecionarPokemon(pokemon.name)}
            />
            <h1>{pokemon.name}</h1>
          </div>
        ))}
      </div>

      {tipo === "" && (
        <>
          <button onClick={paginaAnterior}>Anterior</button>
          <span> Página {paginaAtual} </span>
          <button onClick={proximaPagina}>Próxima</button>
        </>
      )}
    </div>
  );
}
