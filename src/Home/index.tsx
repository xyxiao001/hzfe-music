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
            <NavLink to="/" exact>推荐</NavLink>
          </p>
          <p className="nav-item">
            <NavLink to="/local">本地音乐</NavLink>
          </p>
        </section>
        <section className="music-box">
          <Switch>
            <Route path="/local" exact>
              <Locale />
            </Route>
            <Route path="/" exact>
              <Love />
            </Route>
          </Switch>
        </section>
      </section>
      <Player />
    </section>
  );
}

export default Home
