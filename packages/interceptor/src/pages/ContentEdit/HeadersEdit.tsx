import React, {
  FC,
  useEffect,
  useState,
  ChangeEvent,
  useMemo,
  useCallback,
} from "react";
import { Input, Button, Table, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "./header-edit.scss";
import { ColumnsType } from "antd/lib/table";

interface HeadersEditProps {
  headers: any;
  onChange?: (value: any) => any;
  style?: any;
  disabled?: boolean;
}

export type RowData = {
  key: string;
  value: string;
  status?: string;
};

let newKey = "";

const HeadersEdit: FC<HeadersEditProps> = (props) => {
  const [tableData, setTableData] = useState<RowData[]>([]);
  useEffect(() => {
    setTableData(props.headers);
  }, [props.headers]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRowChange = (key: string, value: string, record: any) => {
    setTableData((prev: RowData[]) => {
      const temp = [...prev];
      const index = prev.findIndex((v) => v.key === key);
      if (index > -1) {
        const newValue = { ...record, key, value: value };
        temp.splice(index, 1, newValue);
      }
      if (props.onChange && record.status !== "new") {
        props.onChange(temp);
      }
      return temp;
    });
  };
  const handleDelete = (key: string) => {
    Modal.confirm({
      title: "确定删除吗？",
      content: "未点保存不会从本地缓存中删除。",
      onOk: () => {
        setTableData((prev: RowData[]) => {
          const result = prev.filter((v) => v.key !== key);
          if (props.onChange) {
            props.onChange(result);
          }
          return result;
        });
      },
    });
  };
  const handleNewHeader = () => {
    if (tableData[0]?.status !== "new") {
      setTableData([{ key: "", value: "", status: "new" }, ...tableData]);
    }
  };
  const handleNewKeyChange = useCallback((e: any) => {
    newKey = e.target.value;
  }, []);

  const handleNewDone = useCallback(
    (type: "confirm" | "cancel") => {
      if (!newKey && type === "confirm") return;
      setTableData((prev) => {
        const [first, ...rest] = prev;
        if (type === "cancel") {
          return rest;
        } else if (type === "confirm") {
          const result = [{ key: newKey, value: first.value }, ...rest];
          if (props.onChange) {
            props.onChange(result);
          }
          return result;
        }
        newKey = "";
        return prev;
      });
    },
    [props]
  );
  const columns: ColumnsType<any> = useMemo(
    () => [
      {
        key: "key",
        dataIndex: "key",
        title: "Key",
        render(value, record) {
          return record.status === "new" ? (
            <Input
              placeholder="请输入键"
              key="input-key"
              type="text"
              onChange={handleNewKeyChange}
            />
          ) : (
            value
          );
        },
      },
      {
        key: "value",
        dataIndex: "value",
        title: "Value",
        render: (text, record) =>
          props.disabled ? (
            text
          ) : (
            <Input
              disabled={props.disabled}
              value={text}
              placeholder="请输入值"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                handleRowChange(record.key, e.target.value, record)
              }
            />
          ),
      },
    ],
    [handleNewKeyChange, handleRowChange, props.disabled]
  );
  if (!props.disabled) {
    columns.push({
      key: "opt",
      title: "操作",
      width: 120,
      render: (_, record) =>
        record.status !== "new" ? (
          <a
            className="header-edit-opt"
            onClick={() => !props.disabled && handleDelete(record.key)}
          >
            删除
          </a>
        ) : (
          <>
            <a
              className="header-edit-opt"
              onClick={() => handleNewDone("confirm")}
            >
              确定
            </a>
            <a
              className="header-edit-opt"
              onClick={() => handleNewDone("cancel")}
            >
              取消
            </a>
          </>
        ),
    });
  }
  return (
    <section
      className="headers-edit"
      // style={{ height: props.style.height + 42 }}
    >
      <header className="headers-edit-header">
        <span>响应头{!props.disabled ? "编辑" : ""}</span>
        {!props.disabled && (
          <Button
            disabled={props.disabled}
            size="small"
            type="primary"
            onClick={handleNewHeader}
            icon={<PlusOutlined />}
          >
            新增
          </Button>
        )}
      </header>
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </section>
  );
};

export default HeadersEdit;
