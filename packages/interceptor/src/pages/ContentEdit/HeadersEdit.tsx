import React, { FC, useEffect, useState, ChangeEvent } from "react";
import { Input, Button, Table, Modal, Form, notification } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import "./header-edit.scss";
import { ColumnsType } from "antd/lib/table";

interface HeadersEditProps {
  headers: any;
  onChange?: (value: any) => any;
  style: any;
}

export type RowData = {
  key: string;
  value: string;
};

const HeadersEdit: FC<HeadersEditProps> = (props) => {
  const [tableData, setTableData] = useState<RowData[]>([]);
  useEffect(() => {
    console.log(props.headers);
    setTableData(props.headers);
  }, [props.headers]);
  const handleRowChange = (key: string, value: string) => {
    setTableData((prev: RowData[]) => {
      const temp = [...prev];
      const index = prev.findIndex((v) => v.key === key);
      if (index > -1) {
        const newValue = { key, value: value };
        temp.splice(index, 1, newValue);
      }
      if (props.onChange) {
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
    const form = {} as any;
    Modal.confirm({
      content: (
        <>
          <Form.Item label="键">
            <Input
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                (form.key = e.target.value)
              }
            />
          </Form.Item>
          <Form.Item label="值">
            <Input
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                (form.value = e.target.value)
              }
            />
          </Form.Item>
        </>
      ),
      onOk: () => {
        setTableData((prev: RowData[]) => {
          if (!prev.find((v) => v.key === form.key)) {
            if (props.onChange) {
              props.onChange([form, ...prev]);
            }
            return [form, ...prev];
          } else {
            notification.error({
              message: "该key已经存在，不能重复创建。",
            });
            return prev;
          }
        });
      },
    });
  };
  const columns: ColumnsType<any> = [
    {
      key: "key",
      dataIndex: "key",
      title: "Key",
    },
    {
      key: "value",
      dataIndex: "value",
      title: "Value",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            handleRowChange(record.key, e.target.value)
          }
        />
      ),
    },
    {
      key: "opt",
      title: "操作",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => handleDelete(record.key)}
          icon={<DeleteOutlined />}
        >
          删除
        </Button>
      ),
    },
  ];
  return (
    <section
      className="headers-edit"
      style={{ height: props.style.height + 42 }}
    >
      <header className="headers-edit-header">
        <span>响应头编辑</span>
        <Button
          size="small"
          type="primary"
          onClick={handleNewHeader}
          icon={<PlusOutlined />}
        >
          新增
        </Button>
      </header>
      <Table
        dataSource={tableData}
        columns={columns}
        pagination={{ pageSize: 7 }}
      />
    </section>
  );
};

export default HeadersEdit;
