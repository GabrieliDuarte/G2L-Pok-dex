import { useState } from 'react'
import './App.css'
import Header from './components/Header';
import Equipes from './components/Equipes';
function App() {
  const [time, setTime] = useState([]);

  return (
    <>
      <div>
        <Header time={time} setTime={setTime}/>
        <Equipes time={time}/>
      </div>
    </>
  )
}

export default App
