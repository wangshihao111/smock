import React, { FC } from 'react';
import { HashRouter, Switch, Route, Redirect } from 'react-router-dom';
import Layout from './components/Layout'
import Home from './pages/Home';

const App: FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Switch>
          <Route path="/home" component={Home} />
          <Redirect from="/" to="home" exact />
        </Switch>
      </Layout>
    </HashRouter>
  );
}

export default App;
