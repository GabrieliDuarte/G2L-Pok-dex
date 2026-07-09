-- Schema da Pokédex G2L
-- Execute este script no PostgreSQL antes de rodar o backend.

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; --permite que o banco de dados gere UUIDs

CREATE TABLE IF NOT EXISTS usuarios (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_treinador VARCHAR(100) NOT NULL,
  email          VARCHAR(255) NOT NULL UNIQUE,
  senha_hash     VARCHAR(255) NOT NULL,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS times (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  nome       VARCHAR(100) NOT NULL,
  criado_em  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS time_pokemons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_id    UUID NOT NULL REFERENCES times(id) ON DELETE CASCADE,
  slot       SMALLINT NOT NULL CHECK (slot >= 0 AND slot <= 5),
  pokemon_id INTEGER NOT NULL,
  nome       VARCHAR(100) NOT NULL,
  sprite_url TEXT,
  tipos      TEXT[] NOT NULL DEFAULT '{}',
  UNIQUE (time_id, slot)
);

CREATE INDEX IF NOT EXISTS idx_times_usuario ON times(usuario_id);
CREATE INDEX IF NOT EXISTS idx_time_pokemons_time ON time_pokemons(time_id);

-- Impede mais de 10 times por usuário
CREATE OR REPLACE FUNCTION verificar_limite_times()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM times WHERE usuario_id = NEW.usuario_id) >= 10 THEN
    RAISE EXCEPTION 'Limite de 10 times por usuário atingido';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_limite_times ON times;
CREATE TRIGGER trg_limite_times
  BEFORE INSERT ON times
  FOR EACH ROW EXECUTE PROCEDURE verificar_limite_times();

-- Impede mais de 6 pokémons por time
CREATE OR REPLACE FUNCTION verificar_limite_pokemons()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM time_pokemons WHERE time_id = NEW.time_id) >= 6
     AND NOT EXISTS (
       SELECT 1 FROM time_pokemons
       WHERE time_id = NEW.time_id AND slot = NEW.slot
     ) THEN
    RAISE EXCEPTION 'Limite de 6 pokémons por time atingido';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_limite_pokemons ON time_pokemons;
CREATE TRIGGER trg_limite_pokemons
  BEFORE INSERT ON time_pokemons
  FOR EACH ROW EXECUTE PROCEDURE verificar_limite_pokemons();
