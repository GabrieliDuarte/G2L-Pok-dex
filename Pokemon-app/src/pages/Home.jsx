import { useState } from "react";
import Pokedex from "../components/Pokedex";
import MeusTime from "../components/MeusTimes";
import "../index.css";
import Header from "../components/Header";

export default function Home() {
    const [times, setTimes] = useState([
        { id: 1, nome: "Team G2L", pokemons: [] }
    ]);
    const [timeAtualId, setTimeAtualId] = useState(1);

    return (
        <div className="app">
            <Header />
            

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
