import { useEffect, useState } from "react";
import Pokedex from "../components/Pokedex";
import MeusTime from "../components/MeusTimes";
import "../index.css";
import Header from "../components/Header";
import api from "../services/api";

export default function Home() {
  const [times, setTimes] = useState([]);
  const [timeAtualId, setTimeAtualId] = useState("");
  const [carregandoTimes, setCarregandoTimes] = useState(true);

  useEffect(() => {
    async function carregarTimes() {
      try {
        const { data } = await api.get("/times");
        setTimes(data);
        if (data.length > 0) setTimeAtualId(data[0].id);
      } catch (err) {
        console.error("Erro ao carregar times:", err);
      } finally {
        setCarregandoTimes(false);
      }
    }
    carregarTimes();
  }, []);

  async function adicionarPokemonAoTime(pokemon) {
    const timeAtual = times.find((t) => t.id === timeAtualId);

    if (!timeAtual) {
      alert("Nenhum time selecionado.");
      return;
    }
    if (timeAtual.pokemons.length >= 6) {
      alert("Seu time já tem 6 Pokémon!");
      return;
    }
    if (timeAtual.pokemons.some((p) => p.pokemon_id === pokemon.id)) {
      alert("Esse Pokémon já está no time!");
      return;
    }

    const slot = timeAtual.pokemons.length;
    const spriteUrl =
      pokemon.sprites?.other?.["official-artwork"]?.front_default ||
      pokemon.sprites?.front_default ||
      null;

    try {
      const { data } = await api.post(`/times/${timeAtualId}/pokemons`, {
        slot,
        pokemon_id: pokemon.id,
        nome: pokemon.name,
        sprite_url: spriteUrl,
        tipos: pokemon.types.map((t) => t.type.name),
      });

      const pokemonFormatado = {
        id: data.id,
        slot: data.slot,
        pokemon_id: data.pokemon_id,
        name: data.nome,
        types: data.tipos.map((tipo) => ({ type: { name: tipo } })),
        sprites: {
          other: { "official-artwork": { front_default: data.sprite_url } },
        },
      };

      setTimes((prev) =>
        prev.map((t) =>
          t.id === timeAtualId
            ? { ...t, pokemons: [...t.pokemons, pokemonFormatado] }
            : t
        )
      );
    } catch (err) {
      console.error("Erro ao adicionar pokémon:", err);
      alert(err.response?.data?.erro || "Erro ao adicionar Pokémon ao time.");
    }
  }

  const pokemonsDoTimeAtual =
    times.find((t) => t.id === timeAtualId)?.pokemons ?? [];

  return (
    <div className="app">
      <Header />

      <div className="app-layout">
        <Pokedex
          timeAtualId={timeAtualId}
          pokemonsDoTime={pokemonsDoTimeAtual}
          onAdicionarPokemon={adicionarPokemonAoTime}
          timesCarregando={carregandoTimes}
        />
        {carregandoTimes ? (
          <aside className="meus-times">
            <p className="time-atual-label">Carregando times...</p>
          </aside>
        ) : (
          <MeusTime
            times={times}
            setTimes={setTimes}
            timeAtualId={timeAtualId}
            setTimeAtualId={setTimeAtualId}
          />
        )}
      </div>
    </div>
  );
}
