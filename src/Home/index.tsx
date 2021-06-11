import React from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';
import Player from '../Components/Player';
import Locale from '../Local';
import Love from '../Love';
import './index.scss'
const Home = () => {

  return (
    <section className="page-home">
      <section className="wrapper-box">
        <section className="nav">
          <p className="nav-item">
            <NavLink to="/">本地音乐</NavLink>
          </p>
          <p className="nav-item">
            <NavLink to="/like" exact>在线音乐</NavLink>
          </p>
        </section>
        <section className="music-box">
          <Switch>
            <Route path="/like" exact>
              <Love />
            </Route>
            <Route path="/" exact>
              <Locale />
            </Route>
          </Switch>
        </section>
      </section>
      <Player />
    </section>
  );
}

export default Home
