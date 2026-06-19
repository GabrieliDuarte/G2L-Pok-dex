import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Header() {

  const navigate = useNavigate()

  return (
    <header className="app-header">
      <div className="header-logo">
        <img
          src="/icones/Poké_Ball_icon.svg"
          alt="Pokédex"
          className="header-pokeball"
          onClick={() => {navigate("/")}}
        />
        <span className="header-titulo">Pokédex G2L</span>
      </div>
      <button className="header-dashboard" onClick={() => {navigate("/dashboard")}}>DashBoard</button>
      <button
        className="btn-meus-times-mobile"
        onClick={() => document.querySelector(".meus-times").classList.toggle("aberto")}
      >
        Meus Times
      </button>
      <div className="header-login">
        <img src="/icones/mingcute--user-4-fill.svg" alt="" 
        onClick={() => {navigate("/cadastro")}}
        />
      </div>
    </header>
  );
}

export default Header;
