import React, { useState, useEffect } from "react";

function Header() {
  const [nome, setNome] = useState("");
  const [listaPokemon, setListaPokemon] = useState([]);
  const [sugestoes, setSugestoes] = useState([]);
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    async function carregarPokemon() {
      const data = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
      const res = await data.json();

      const listaComImagem = res.results
        .map((p) => {
          const id = p.url.split("/")[6];

          return {
            name: p.name,
            img: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

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

    const filtrados = listaPokemon.filter((p) => p.name.startsWith(valor));

    setSugestoes(filtrados);
  }

  async function selecionarPokemon(nomePokemon) {
    const data = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${nomePokemon}`,
    );
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
      <>
    <div className="Cabecalho">
      <img src="/icones/Poké_Ball_icon.svg" alt="" height={50} />
      <h1>Pokédex G2L</h1>

      <input className="input-pesquisa"
        type="text"
        placeholder="Pesquisar Pokémon"
        value={nome}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          maxHeight: "300px",
          overflowY: "scroll",
          border: "1px solid #ccc",
          width: "250px",
        }}
      >
        {sugestoes.map((p) => (
          <li
          key={p.name}
          onClick={() => selecionarPokemon(p.name)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            padding: "5px",
          }}
          >
            <img src={p.img} alt={p.name} width="40" />
            {p.name}
          </li>
        ))}
      </ul>
      <img src="/icones/mingcute--user-4-fill.svg" alt="" />

      {pokemon && (
        <div>
          <h2>{pokemon.name}</h2>

          <img
            src={pokemon.sprites.other["showdown"].front_default}
            alt={pokemon.name}
            width="200"
          />
        </div>
      )}
    </div>
  </>
  );
}

export default Header;
