import React from 'react'

function Equipes({ time }) {
  return (
    <div className="times">
    <div className="timePrincipal">

      {time.map((p, index) => (
        <div key={index}>
          <img src={p.sprites.front_default} width="60" />
          <p>{p.name}</p>
        </div>
      ))}

    </div>
  </div>
  )
}

export default Equipes