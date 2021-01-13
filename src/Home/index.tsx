import React from 'react';
import Player from '../Components/Player'
import './index.scss'
const Home = () => {

  return (
    <section className="page-home">
      <section className="wrapper-box">
        <section className="nav">
          <p className="nav-item">Music</p>
          <p className="nav-item">Album</p>
        </section>
        <section className="music-box">
          music-box
        </section>
      </section>
      <Player></Player>
    </section>
  );
}

export default Home
