import { useEffect, useState } from 'react'
import './App.css'

import Home from './pages/Home';

function App() {
  const [time, setTime] = useState([]);
  const [pg, setPg] = useState(<Home time={time} setTime={setTime} />)


  return (
    <>
      {pg}
    </>
  )
}

export default App
