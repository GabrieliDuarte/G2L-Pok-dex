import { useState } from "react";
import Pokedex from "../components/Pokedex";
import MeusTime from "../components/MeusTimes";
import "../index.css";

export default function Home() {
  const [times, setTimes] = useState([
    { id: 1, nome: "Team G2L", pokemons: [] }
  ]);
  const [timeAtualId, setTimeAtualId] = useState(1);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-logo">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg"
            alt="Pokédex"
            className="header-pokeball"
          />
          <span className="header-titulo">Pokédex G2L</span>
        </div>
        <p className="header-subtitulo">
          Bem-vindo à Pokédex G2L! Explore e crie seus times lendários.
        </p>
        <button
          className="btn-meus-times-mobile"
          onClick={() => document.querySelector(".meus-times").classList.toggle("aberto")}
        >
          Meus Times
        </button>
      </header>

      <div className="app-layout">
        <Pokedex
          times={times}
          setTimes={setTimes}
          timeAtualId={timeAtualId}
        />
        <MeusTime
          times={times}
          setTimes={setTimes}
          timeAtualId={timeAtualId}
          setTimeAtualId={setTimeAtualId}
        />
      </div>
    </div>
  );
}
