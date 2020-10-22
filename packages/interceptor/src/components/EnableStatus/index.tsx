import React, { FC } from "react";
import "./index.scss";

const EnableStatus: FC<{ enabled: boolean }> = ({ enabled }) => {
  return (
    <div
      className={`api-enable-status ${
        enabled ? "api-enable-status-enabled" : ""
      }`}
    >
      {enabled ? "已启用" : "已禁用"}
    </div>
  );
};

export default EnableStatus;
