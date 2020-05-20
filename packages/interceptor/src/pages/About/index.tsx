import React, { FC } from "react";
import "./index.scss";

const About: FC = () => {
  return (
    <div className="page-about">
      <h2>关于我们</h2>
      <p>
        如果使用中发现问题，欢迎联系
        {/* <a href="email: 913003120@qq.com">913003120@qq.com</a> */}
      </p>
      <p>或去我们的仓库提issues</p>
      <p>
        仓库地址
        <a href="https://github.com/wangshihao111/smock">
          https://github.com/wangshihao111/smock
        </a>
      </p>
    </div>
  );
};

export default About;
