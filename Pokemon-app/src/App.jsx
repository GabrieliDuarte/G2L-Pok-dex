import { useState } from 'react'
import './App.css'
import Header from './components/Header';
import Equipes from './components/Equipes';
import Pokemons from './components/Pokemons';
function App() {
  return (
    <>
      <div>
        <Header />
        <Equipes />
        <Pokemons />
      </div>
    </>
  )
}

export default App
