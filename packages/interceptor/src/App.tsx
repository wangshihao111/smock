import React, { FC } from "react";
import { ConfigProvider } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { HashRouter, Switch, Route, Redirect } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import ContentEdit from "./pages/ContentEdit";

const App: FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
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
    </ConfigProvider>
  );
};

export default App;
