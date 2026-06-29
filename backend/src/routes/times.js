const express    = require("express");
const router     = express.Router();
const autenticar = require("../middlewares/autenticar");
const {
  listarTimes,
  criarTime,
  renomearTime,
  excluirTime,
  adicionarPokemon,
  removerPokemon,
} = require("../controllers/timesController");

// Todas as rotas de times exigem autenticação
router.use(autenticar);

router.get("/",                         listarTimes);
router.post("/",                        criarTime);
router.patch("/:id",                    renomearTime);
router.delete("/:id",                   excluirTime);
router.post("/:id/pokemons",            adicionarPokemon);
router.delete("/:id/pokemons/:pokemonId", removerPokemon);

module.exports = router;