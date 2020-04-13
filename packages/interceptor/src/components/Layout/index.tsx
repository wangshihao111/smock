import React, { FC } from "react";
import { NavLink } from "react-router-dom";
import "./index.scss";

const Layout: FC = (props) => {
  return (
    <section className="basic-layout">
      <header className="basic-layout-header">
        <h1 className="basic-layout-header-title">接口拦截工具</h1>
        <div className="basic-layout-header-nav">
          <NavLink to="/home">
            <nav>首页</nav>
          </NavLink>
          <NavLink to="/about">
            <nav>关于</nav>
          </NavLink>
        </div>
      </header>
      <main className="basic-layout-body">{props.children}</main>
    </section>
  );
};

export default Layout;
