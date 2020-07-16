import React, { FC } from "react";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import ContentEdit from "./pages/ContentEdit";

const App: FC = () => {
  return (
    <HashRouter basename="/">
      <Layout>
        <Switch>
          <Route path="/home" component={Home} />
          <Route path="/content-edit/:api/:detail" component={ContentEdit} />
          <Route path="/about" component={About} />
          <Redirect from="/" to="home" exact />
        </Switch>
      </Layout>
    </HashRouter>
  );
};

export default App;
