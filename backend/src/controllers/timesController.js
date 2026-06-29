const pool = require("../config/db");

// ----------------------------------------------------------------
// GET /times  — lista todos os times do usuário logado (com pokémons)
// ----------------------------------------------------------------
async function listarTimes(req, res) {
  try {
    const { rows: times } = await pool.query(
      `SELECT id, nome, criado_em
       FROM times
       WHERE usuario_id = $1
       ORDER BY criado_em ASC`,
      [req.usuario.id]
    );

    // Buscar pokémons de todos os times de uma só query (evita N+1)
    const timeIds = times.map((t) => t.id);

    let pokemons = [];
    if (timeIds.length > 0) {
      const { rows } = await pool.query(
        `SELECT id, time_id, slot, pokemon_id, nome, sprite_url, tipos
         FROM time_pokemons
         WHERE time_id = ANY($1::uuid[])
         ORDER BY slot ASC`,
        [timeIds]
      );
      pokemons = rows;
    }

    // Montar estrutura { id, nome, pokemons: [...] } para cada time
    const timesComPokemons = times.map((time) => ({
      ...time,
      pokemons: pokemons
        .filter((p) => p.time_id === time.id)
        .map((p) => ({
          id:         p.id,
          slot:       p.slot,
          pokemon_id: p.pokemon_id,
          name:       p.nome,       // "name" para bater com o objeto da PokeAPI no front
          types:      p.tipos.map((tipo) => ({ type: { name: tipo } })), // mesmo formato da PokeAPI
          sprites: {
            other: { "official-artwork": { front_default: p.sprite_url } },
          },
        })),
    }));

    return res.status(200).json(timesComPokemons);
  } catch (err) {
    console.error("Erro ao listar times:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

// ----------------------------------------------------------------
// POST /times  — cria um novo time
// ----------------------------------------------------------------
async function criarTime(req, res) {
  const { nome } = req.body;

  try {
    // Checar limite de 10 (o trigger do banco também barra, mas melhor retornar mensagem amigável)
    const { rows: contagem } = await pool.query(
      "SELECT COUNT(*) FROM times WHERE usuario_id = $1",
      [req.usuario.id]
    );
    if (parseInt(contagem[0].count) >= 10) {
      return res.status(400).json({ erro: "Você já possui 10 times." });
    }

    const { rows } = await pool.query(
      `INSERT INTO times (usuario_id, nome)
       VALUES ($1, $2)
       RETURNING id, nome, criado_em`,
      [req.usuario.id, nome?.trim() || "Novo Time"]
    );

    return res.status(201).json({ ...rows[0], pokemons: [] });
  } catch (err) {
    console.error("Erro ao criar time:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

// ----------------------------------------------------------------
// PATCH /times/:id  — renomear time
// ----------------------------------------------------------------
async function renomearTime(req, res) {
  const { id } = req.params;
  const { nome } = req.body;

  if (!nome?.trim()) {
    return res.status(400).json({ erro: "Nome é obrigatório." });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE times SET nome = $1
       WHERE id = $2 AND usuario_id = $3
       RETURNING id, nome`,
      [nome.trim(), id, req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Time não encontrado." });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Erro ao renomear time:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

// ----------------------------------------------------------------
// DELETE /times/:id  — excluir time (mínimo 1 deve restar)
// ----------------------------------------------------------------
async function excluirTime(req, res) {
  const { id } = req.params;

  try {
    const { rows: contagem } = await pool.query(
      "SELECT COUNT(*) FROM times WHERE usuario_id = $1",
      [req.usuario.id]
    );
    if (parseInt(contagem[0].count) <= 1) {
      return res.status(400).json({ erro: "Você precisa ter pelo menos 1 time." });
    }

    const { rowCount } = await pool.query(
      "DELETE FROM times WHERE id = $1 AND usuario_id = $2",
      [id, req.usuario.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ erro: "Time não encontrado." });
    }

    return res.status(200).json({ mensagem: "Time excluído com sucesso." });
  } catch (err) {
    console.error("Erro ao excluir time:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

// ----------------------------------------------------------------
// POST /times/:id/pokemons  — adicionar pokémon a um slot
// ----------------------------------------------------------------
async function adicionarPokemon(req, res) {
  const { id: time_id } = req.params;
  const { slot, pokemon_id, nome, sprite_url, tipos } = req.body;

  if (slot === undefined || !pokemon_id || !nome || !tipos?.length) {
    return res.status(400).json({ erro: "slot, pokemon_id, nome e tipos são obrigatórios." });
  }

  try {
    // Garantir que o time pertence ao usuário
    const { rows: time } = await pool.query(
      "SELECT id FROM times WHERE id = $1 AND usuario_id = $2",
      [time_id, req.usuario.id]
    );
    if (time.length === 0) {
      return res.status(404).json({ erro: "Time não encontrado." });
    }

    // Upsert: se o slot já tiver pokémon, substitui
    const { rows } = await pool.query(
      `INSERT INTO time_pokemons (time_id, slot, pokemon_id, nome, sprite_url, tipos)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (time_id, slot) DO UPDATE
         SET pokemon_id = EXCLUDED.pokemon_id,
             nome       = EXCLUDED.nome,
             sprite_url = EXCLUDED.sprite_url,
             tipos      = EXCLUDED.tipos
       RETURNING id, slot, pokemon_id, nome, sprite_url, tipos`,
      [time_id, slot, pokemon_id, nome, sprite_url, tipos]
    );

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar pokémon:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

// ----------------------------------------------------------------
// DELETE /times/:id/pokemons/:pokemonId  — remover pokémon do time
// ----------------------------------------------------------------
async function removerPokemon(req, res) {
  const { id: time_id, pokemonId } = req.params;

  try {
    // Garantir que o time pertence ao usuário
    const { rows: time } = await pool.query(
      "SELECT id FROM times WHERE id = $1 AND usuario_id = $2",
      [time_id, req.usuario.id]
    );
    if (time.length === 0) {
      return res.status(404).json({ erro: "Time não encontrado." });
    }

    const { rowCount } = await pool.query(
      "DELETE FROM time_pokemons WHERE id = $1 AND time_id = $2",
      [pokemonId, time_id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ erro: "Pokémon não encontrado no time." });
    }

    return res.status(200).json({ mensagem: "Pokémon removido com sucesso." });
  } catch (err) {
    console.error("Erro ao remover pokémon:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

module.exports = {
  listarTimes,
  criarTime,
  renomearTime,
  excluirTime,
  adicionarPokemon,
  removerPokemon,
};