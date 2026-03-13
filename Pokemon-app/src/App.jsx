import { useState } from 'react'
import './App.css'
import Header from './components/Header';
import Equipes from './components/Equipes';
import Pokemons from './components/Pokemons';
function App() {
  const [time, setTime] = useState([]);

  return (
    <>
      <div>
        <Header time={time} setTime={setTime}/>
        <Equipes time={time}/>
        <Pokemons time={time} setTime={setTime}/>
      </div>
    </>
  )
}

export default App
