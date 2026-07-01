import Header from "../components/Header";
import { useState, useEffect, useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import api from "../services/api";
import pokeapi from "../services/pokeapi";

function tipoIconeUrl(tipo) {
  return `https://raw.githubusercontent.com/partywhale/pokemon-type-icons/master/icons/${tipo}.svg`;
}

function formatarTipo(tipo) {
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function TipoTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const { tipo, percentual } = payload[0].payload;
  return (
    <div className="dashboard-tooltip">
      <p className="dashboard-tooltip-titulo">{tipo}</p>
      <p className="dashboard-tooltip-valor">
        {percentual.toFixed(1)}% dos times
      </p>
    </div>
  );
}

export default function DashboardTimes() {
  const [times, setTimes] = useState(null);
  const [erro, setErro] = useState(null);
  const [showdownUrl, setShowdownUrl] = useState(null);

  useEffect(() => {
    api
      .get("/times")
      .then(({ data }) => setTimes(data))
      .catch((err) => {
        setErro(err.response?.data?.erro || "Erro ao carregar times.");
      });
  }, []);

  // ---- Cálculo das estatísticas agregadas a partir dos times carregados ----
  const stats = useMemo(() => {
    if (!times || times.length === 0) return null;

    const totalTimes = times.length;
    const monData = {}; // nome -> { count, pokemonId }
    const typeCount = {};

    times.forEach((time) => {
      time.pokemons.forEach((p) => {
        if (!monData[p.name]) {
          monData[p.name] = { count: 0, pokemonId: p.pokemon_id };
        }
        monData[p.name].count += 1;

        p.types.forEach(({ type }) => {
          typeCount[type.name] = (typeCount[type.name] || 0) + 1;
        });
      });
    });

    const sortedMons = Object.entries(monData).sort(
      (a, b) => b[1].count - a[1].count,
    );
    const sortedTypes = Object.entries(typeCount).sort((a, b) => b[1] - a[1]);

    const radarData = sortedTypes.slice(0, 10).map(([tipo, count]) => ({
      tipo: formatarTipo(tipo),
      percentual: (count / totalTimes) * 100,
    }));

    return {
      totalTimes,
      topMon: { name: sortedMons[0][0], ...sortedMons[0][1] },
      topType: { nome: sortedTypes[0][0], count: sortedTypes[0][1] },
      topMons: sortedMons.slice(0, 6),
      radarData,
    };
  }, [times]);

  // ---- Buscar sprite do Showdown do pokémon mais usado ----
  useEffect(() => {
    if (!stats?.topMon?.pokemonId) return;
    setShowdownUrl(null);
    pokeapi
      .get(`pokemon/${stats.topMon.pokemonId}`)
      .then(({ data }) => {
        const url = data.sprites?.other?.showdown?.front_default;
        if (url) setShowdownUrl(url);
      })
      .catch(() => setShowdownUrl(null));
  }, [stats?.topMon?.pokemonId]);

  if (erro) {
    return (
      <div className="dashboard-times">
        <p className="dashboard-erro">{erro}</p>
      </div>
    );
  }

  if (!times) {
    return (
      <div className="dashboard-times">
        <p className="dashboard-carregando">Carregando dashboard...</p>
      </div>
    );
  }

  if (times.length === 0) {
    return (
      <div className="dashboard-times">
        <div className="dashboard-vazio">
          <p>
            Você ainda não criou nenhum time. Monte seu primeiro time para ver
            as estatísticas aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="dashboard-times">
        <h1 className="dashboard-titulo">Dashboard dos seus times</h1>

        {/* Cards de métricas */}
        <div className="metricas-grid">
          <div className="metrica-card">
            <p className="metrica-label">Times criados</p>
            <p className="metrica-valor">{stats.totalTimes}</p>
          </div>

          <div className="metrica-card metrica-card-pokemon">
            <p className="metrica-label">Pokémon mais usado</p>
            <div className="metrica-pokemon-conteudo">
              {showdownUrl ? (
                <img
                  src={showdownUrl}
                  alt={stats.topMon.name}
                  className="metrica-sprite-showdown"
                />
              ) : (
                <div className="metrica-sprite-placeholder" />
              )}
              <div>
                <p className="metrica-valor metrica-valor-capitalize">
                  {stats.topMon.name}
                </p>
                <p className="metrica-sub">
                  em {stats.topMon.count} de {stats.totalTimes} times
                </p>
              </div>
            </div>
          </div>

          <div className="metrica-card">
            <p className="metrica-label">Tipo mais comum</p>
            <div className="metrica-tipo-conteudo">
              <img
                src={tipoIconeUrl(stats.topType.nome)}
                alt={stats.topType.nome}
                className="metrica-tipo-icone"
              />
              <p className="metrica-valor metrica-valor-capitalize">
                {formatarTipo(stats.topType.nome)}
              </p>
            </div>
            <p className="metrica-sub">
              aparece {stats.topType.count}x no total
            </p>
          </div>
        </div>

        <div className="dashboard-colunas">
          {/* Ranking dos pokémons mais usados */}
          <div className="dashboard-card">
            <p className="dashboard-card-titulo">Top pokémons mais usados</p>
            <div className="ranking-lista">
              {stats.topMons.map(([nome, { count }]) => {
                const pct = Math.round((count / stats.totalTimes) * 100);
                return (
                  <div key={nome} className="ranking-item">
                    <div className="ranking-item-linha">
                      <span className="ranking-item-nome">{nome}</span>
                      <span className="ranking-item-contagem">
                        {count}/{stats.totalTimes}
                      </span>
                    </div>
                    <div className="ranking-barra-bg">
                      <div
                        className="ranking-barra"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Radar de distribuição de tipos */}
          <div className="dashboard-card">
            <p className="dashboard-card-titulo">Distribuição de tipos</p>
            <div className="dashboard-radar-chart">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={stats.radarData} outerRadius="72%">
                  <PolarGrid stroke="var(--borda)" />
                  <PolarAngleAxis
                    dataKey="tipo"
                    tick={{ fill: "var(--texto-suave)", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, "dataMax"]}
                    tick={{ fill: "var(--texto-suave)", fontSize: 9 }}
                  />
                  <Radar
                    name="% dos times"
                    dataKey="percentual"
                    stroke="var(--vermelho)"
                    fill="var(--vermelho)"
                    fillOpacity={0.35}
                  />
                  <Tooltip content={<TipoTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
