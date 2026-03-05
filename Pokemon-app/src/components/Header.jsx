import React from 'react'

function Header() {
    return (
        <div className={'Cabecalho'}>
        <img src="\icones\material-symbols--menu-rounded.svg" alt=""/>
            <h1>G2L</h1>
            <input type="text" placeholder={'Pesquisar'}/>
        </div>
    )
}

export default Header
    