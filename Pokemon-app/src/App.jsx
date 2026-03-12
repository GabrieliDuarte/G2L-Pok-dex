import { useState } from 'react'
import './App.css'
import Header from './components/Header';
import Equipes from './components/Equipes';
function App() {
  return (
    <>
      <div>
        <Header />
        <Equipes />
      </div>
    </>
  )
}

export default App
