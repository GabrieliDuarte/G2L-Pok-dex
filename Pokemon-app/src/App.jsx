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
<<<<<<< HEAD
        <Header time={time} setTime={setTime}/>
        <Equipes time={time}/>
=======
        <Header />
        <Equipes />
        <Pokemons />
>>>>>>> d10bd78ac9ae0f1562befe439c4452a84f5a55dd
      </div>
    </>
  )
}

export default App
