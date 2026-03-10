import React, { useState } from 'react'
function Header() {
    const [nome, setNome] = useState("");
    const [txt, setTxt] = useState('')
    const [img, setImg] = useState("")
    async function getPokemon(){
        const data = await fetch (`https://pokeapi.co/api/v2/pokemon/${nome}`)
        const res = await data.json()

        setImg(res.sprites.front_default)
        setTxt(res.name)
    }
    return (
        <div className={'Cabecalho'}>
        <img src="\icones\material-symbols--menu-rounded.svg" alt=""/>
            <h1>G2L</h1>
            <input type="text" placeholder={'Pesquisar'} onChange={(e) => setNome(e.target.value)}/>
            <button onClick={getPokemon}>oi</button>
            <p>{txt}</p>
            <img src={img} alt="" />
        </div>
    )
}

export default Header
    