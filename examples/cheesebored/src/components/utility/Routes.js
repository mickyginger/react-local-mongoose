import React from 'react';

import { Container } from 'reactbulma';
import { Route, Switch, withRouter } from 'react-router-dom';

import Home from '../pages/Home';

import CheesesIndex from '../cheeses/CheesesIndex';
import CheesesShow from '../cheeses/CheesesShow';
import CheesesNew from '../cheeses/CheesesNew';
import CheesesEdit from '../cheeses/CheesesEdit';

import Seed from './Seed';

const Routes = ({ location }) => {
  const isHomePage = location.pathname === '/';
  return (
    <section className={isHomePage ? 'hero is-large homepage' : 'section'}>
      <Container>
        <Switch>
          <Route path="/cheeses/:id/edit" component={CheesesEdit} />
          <Route path="/cheeses/new" component={CheesesNew} />
          <Route path="/cheeses/:id" component={CheesesShow} />
          <Route path="/cheeses" component={CheesesIndex} />
          <Route path="/seed" component={Seed} />
          <Route path="/" component={Home} />
        </Switch>
      </Container>
    </section>
  );
};

export default withRouter(Routes);
