import { useState, useEffect } from "react";

const TOTAL_POKEMONS = 1025;
const limite = 27;

export default function Pokedex({ time, setTime }) {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    loadPokemonPage(paginaAtual);
  }, [paginaAtual]);

  function paginaAnterior() {
    setPaginaAtual((p) => (p <= 1 ? totalPaginas : p - 1));
  }

  function proximaPagina() {
    setPaginaAtual((p) => (p >= totalPaginas ? 1 : p + 1));
  }

  async function selecionarPokemon(nomePokemon) {
    const data = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${nomePokemon}`
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
      {loading && <p>Carregando...</p>}

      <div className="pokemon-container">
        {pokemons.map((pokemon) => (
          <img
            key={pokemon.id}
            src={pokemon.sprites.other["official-artwork"].front_default}
            className="poke-icon"
            alt={pokemon.name}
            height={150}
            onClick={() => selecionarPokemon(pokemon.name)}
          />
        ))}
      </div>

      <button onClick={paginaAnterior}>Anterior</button>

      <span> Página {paginaAtual} </span>

      <button onClick={proximaPagina}>Próxima</button>
    </div>
  );
}