const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const pool     = require("../config/db");

// ----------------------------------------------------------------
// POST /auth/cadastro
// ----------------------------------------------------------------
async function cadastro(req, res) {
  const { nome_treinador, email, senha } = req.body;

  if (!nome_treinador || !email || !senha) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios." });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: "A senha deve ter pelo menos 6 caracteres." });
  }

  try {
    // Verificar se e-mail já existe
    const { rows: existente } = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existente.length > 0) {
      return res.status(409).json({ erro: "E-mail já cadastrado." });
    }

    // Hash da senha (10 rounds é seguro e rápido o suficiente)
    const senha_hash = await bcrypt.hash(senha, 10);

    // Inserir usuário
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome_treinador, email, senha_hash)
       VALUES ($1, $2, $3)
       RETURNING id, nome_treinador, email, criado_em`,
      [nome_treinador.trim(), email.toLowerCase(), senha_hash]
    );

    const usuario = rows[0];

    // Criar um time inicial automaticamente
    await pool.query(
      "INSERT INTO times (usuario_id, nome) VALUES ($1, $2)",
      [usuario.id, "Time 1"]
    );

    const token = gerarToken(usuario);

    return res.status(201).json({
      mensagem: "Cadastro realizado com sucesso!",
      token,
      usuario: {
        id:             usuario.id,
        nome_treinador: usuario.nome_treinador,
        email:          usuario.email,
      },
    });
  } catch (err) {
    console.error("Erro no cadastro:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

// ----------------------------------------------------------------
// POST /auth/login
// ----------------------------------------------------------------
async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios." });
  }

  try {
    const { rows } = await pool.query(
      "SELECT id, nome_treinador, email, senha_hash FROM usuarios WHERE email = $1",
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      // Mensagem genérica para não revelar se o e-mail existe
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    const usuario = rows[0];

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    const token = gerarToken(usuario);

    return res.status(200).json({
      mensagem: "Login realizado com sucesso!",
      token,
      usuario: {
        id:             usuario.id,
        nome_treinador: usuario.nome_treinador,
        email:          usuario.email,
      },
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

// ----------------------------------------------------------------
// GET /auth/me  (rota protegida — retorna dados do usuário logado)
// ----------------------------------------------------------------
async function me(req, res) {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome_treinador, email, criado_em FROM usuarios WHERE id = $1",
      [req.usuario.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    return res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Erro em /me:", err);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------
function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, nome_treinador: usuario.nome_treinador },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

module.exports = { cadastro, login, me };