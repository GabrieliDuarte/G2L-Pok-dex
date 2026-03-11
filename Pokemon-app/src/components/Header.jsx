import React, { useState, useEffect } from "react";

function Header() {
  const [nome, setNome] = useState("");
  const [listaPokemon, setListaPokemon] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    async function carregarPokemon() {
      const data = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100000");
      const res = await data.json();

      const listaComImagem = res.results.map((p, index) => ({
        name: p.name,
        img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`
      }));

      setListaPokemon(listaComImagem);
    }

    carregarPokemon();
  }, []);

  function handleChange(e) {
    const valor = e.target.value.toLowerCase();
    setNome(valor);

    if (valor === "") {
      setSugestoes([]);
      return;
    }

    const filtrados = listaPokemon.filter((p) =>
      p.name.startsWith(valor)
    );

    setSugestoes(filtrados.slice(0, 5));
  }

  async function selecionarPokemon(nomePokemon) {
    const data = await fetch(`https://pokeapi.co/api/v2/pokemon/${nomePokemon}`);
    const res = await data.json();

    setPokemon(res);
    setNome(res.name);
    setSugestoes([]);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && sugestoes.length > 0) {
      selecionarPokemon(sugestoes[0].name);
    }
  }

  return (
    <div className="Cabecalho">

      <h1>Pokédex</h1>

      <input
        type="text"
        placeholder="Pesquisar Pokémon"
        value={nome}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <ul style={{ listStyle: "none", padding: 0 }}>
        {sugestoes.map((p) => (
          <li
            key={p.name}
            onClick={() => selecionarPokemon(p.name)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              padding: "5px"
            }}
          >
            <img src={p.img} alt={p.name} width="40" />
            {p.name}
          </li>
        ))}
      </ul>

      {pokemon && (
        <div>
          <h2>{pokemon.name}</h2>

          <img
            src={pokemon.sprites.other["official-artwork"].front_default}
            alt={pokemon.name}
            width="200"
          />
        </div>
      )}

    </div>
  );
}

export default Header;