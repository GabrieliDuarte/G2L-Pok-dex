import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../services/api";

function Home() {
    const TOTAL_POKEMONS = 1025;
    const limite = 27;

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
    const [time, setTime] = useState([])

    const totalPaginas = Math.ceil(TOTAL_POKEMONS / limite);

    async function getPokemon(idOuNome) {
        const res = await api.get(`/pokemon/${idOuNome}`);
        return res.data;
    }

    async function loadPokemonPage(page) {
        try {
            setLoading(true);

            const inicio = (page - 1) * limite + 1;
            const fim = Math.min(inicio + limite - 1, TOTAL_POKEMONS);

            const promises = [];

            for (let i = inicio; i <= fim; i++) {
                promises.push(getPokemon(i));
            }

            const results = await Promise.all(promises);

            setPokemons(results);
        } catch (erro) {
            console.error("Erro ao carregar Pokémon:", erro);
        } finally {
            setLoading(false);
        }
    }

    async function filtrarPorTipo(tipoSelecionado) {
        try {
            setLoading(true);

            // remove filtro
            if (tipo === tipoSelecionado) {
                setTipo("");
                await loadPokemonPage(paginaAtual);
                return;
            }

            setTipo(tipoSelecionado);

            const res = await api.get(`/type/${tipoSelecionado}`);

            // pega apenas os primeiros 27
            const lista = res.data.pokemon.slice(0, limite);

            const promises = lista.map((p) =>
                getPokemon(p.pokemon.name)
            );

            const results = await Promise.all(promises);

            setPokemons(results);
        } catch (erro) {
            console.error("Erro ao filtrar Pokémon:", erro);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // só pagina quando NÃO houver filtro
        if (!tipo) {
            loadPokemonPage(paginaAtual);
        }
    }, [paginaAtual]);

    function paginaAnterior() {
        setPaginaAtual((p) =>
            p <= 1 ? totalPaginas : p - 1
        );
    }

    function proximaPagina() {
        setPaginaAtual((p) =>
            p >= totalPaginas ? 1 : p + 1
        );
    }

    async function selecionarPokemon(nomePokemon) {
        try {
            if (time.length >= 5) {
                alert("Seu time já tem 5 Pokémon");
                return;
            }

            // impede repetidos
            const jaExiste = time.some(
                (p) => p.name === nomePokemon
            );

            if (jaExiste) {
                alert("Pokémon já está no time");
                return;
            }

            const res = await api.get(`/pokemon/${nomePokemon}`);

            setTime([...time, res.data]);
        } catch (erro) {
            console.error("Erro ao selecionar Pokémon:", erro);
        }
    }

    return (
        <>
            <Header time={time} setTime={setTime} />
            <div className="container-home">

                <div className="times">
                    <div className="timePrincipal">
                        {time.map((p) => (
                            <div key={p.id} className="pokemon-time">
                                <img
                                    src={p.sprites.other.showdown.front_default}
                                    width="60"
                                    alt={p.name}
                                />

                                <p>{p.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="tipos-container">
                    {tiposPokemon.map((tipoPokemon) => (
                        <img
                            key={tipoPokemon}
                            src={`https://raw.githubusercontent.com/partywhale/pokemon-type-icons/master/icons/${tipoPokemon}.svg`}
                            className={`tipo-icon ${tipo === tipoPokemon ? "ativo" : ""
                                }`}
                            onClick={() =>
                                filtrarPorTipo(tipoPokemon)
                            }
                        />
                    ))}
                </div>

                {loading && <p>Carregando...</p>}

                <div className="pokemon-container">
                    {pokemons.map((pokemon) => (
                        <div
                            key={pokemon.id}
                            className="pokemon"
                        >
                            <img
                                src={
                                    pokemon.sprites.other[
                                        "official-artwork"
                                    ].front_default
                                }
                                className="poke-icon"
                                alt={pokemon.name}
                                height={100}
                                width={100}
                                onClick={() =>
                                    selecionarPokemon(
                                        pokemon.name
                                    )
                                }
                            />

                            <h1>{pokemon.name}</h1>
                        </div>
                    ))}
                </div>

                {!tipo && (
                    <>
                        <button onClick={paginaAnterior}>
                            Anterior
                        </button>

                        <span> Página {paginaAtual} </span>

                        <button onClick={proximaPagina}>
                            Próxima
                        </button>
                    </>
                )}
            </div>
        </>
    );
}

export default Home;