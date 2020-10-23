import React, {
  FC,
  useEffect,
  useState,
  ChangeEvent,
  useMemo,
  useCallback,
  MouseEvent,
} from "react";
import { Input, Row, Col, Button, Form, Modal, Select, Table } from "antd";
import { uniq } from "lodash";
import "./index.scss";
import {
  getApiList,
  getInterceptedList,
  updateInterceptedList,
  deleteHistory,
} from "src/service/mock.service";
import { RouteChildrenProps } from "react-router-dom";
import { TableRowSelection } from "antd/lib/table/interface";
import EnableStatus from "../../components/EnableStatus";

type FilterForm = {
  search: string;
  type: string;
};

function getDisplayList(
  list: string[],
  filter: FilterForm,
  intercepted: string[]
) {
  return list
    .filter((item) => item.match(filter.search))
    .filter((item) => {
      if (filter.type === "all") return true;
      else if (filter.type === "enabled") {
        return intercepted.includes(item);
      } else {
        return !intercepted.includes(item);
      }
    });
}

const Home: FC<RouteChildrenProps> = (props) => {
  const [list, setList] = useState<string[]>([]);
  const [intercepted, setIntercepted] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterForm>({ search: "", type: "all" });
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const fetchList = () => {
    setLoading(true);
    getApiList()
      .then((res) => {
        setList(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
    getInterceptedList()
      .then((res) => {
        setIntercepted(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
    setSelectedRowKeys([]);
  };
  useEffect(() => {
    fetchList();
  }, []);
  // const handleResetClick = () => {
  //   setFilter({ search: "", type: "all" });
  // };
  const handleDeleteClick = useCallback(
    (path: string) => (e: MouseEvent) => {
      e.stopPropagation();
      Modal.confirm({
        title: "确定删除吗？",
        onOk: () => {
          deleteHistory(path).then((res) => {
            fetchList();
          });
        },
      });
    },
    []
  );
  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter({
      ...filter,
      search: e.target.value,
    });
  };
  const handleStatusChange = (value: any) => {
    setFilter({
      ...filter,
      type: value,
    });
  };

  const updateIntercepted = (targetList: string[]) => {
    updateInterceptedList(targetList).then((res) => {
      const list = res.data.list;
      setIntercepted(list);
    });
  };

  const handleEnableChange = useCallback(
    (api: string, enabled: boolean, e?: MouseEvent<HTMLAnchorElement>) => {
      e?.stopPropagation();
      const index = intercepted.indexOf(api);
      const targetList = [...intercepted];
      if (enabled) {
        if (index < 0) {
          targetList.push(api);
        }
      } else {
        if (index > -1) {
          targetList.splice(index, 1);
        }
      }
      updateIntercepted(targetList);
    },
    [intercepted]
  );

  // const handleSelectAll = (e: CheckboxChangeEvent) => {
  //   const checked = e.target.checked;
  //   if (checked) {
  //     updateIntercepted(list);
  //   } else {
  //     updateIntercepted([]);
  //   }
  // };

  const handleGroupOperate = useMemo(
    () => (type: "enable" | "disable" | "delete") => async () => {
      if (type === "enable") {
        updateIntercepted(uniq([...selectedRowKeys, ...intercepted]));
        setSelectedRowKeys([]);
      } else if (type === "disable") {
        const list = [...intercepted].filter(
          (v) => !selectedRowKeys.includes(v)
        );
        updateIntercepted(list);
        setSelectedRowKeys([]);
      } else if (type === "delete") {
        Modal.confirm({
          title: "确定删除吗？",
          onOk: async () => {
            setLoading(true);
            await deleteHistory(selectedRowKeys);
            setLoading(false);
            fetchList();
          },
        });
      }
    },
    [intercepted, selectedRowKeys]
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleEditClick = (v: string) => {
    props.history.push(
      `/content-edit/${encodeURIComponent(v)}/${!intercepted.includes(v)}`
    );
  };
  const displayList = getDisplayList(list, filter, intercepted);

  const dataSource = useMemo(
    () =>
      displayList.map((u) => ({
        url: u,
        enabled: intercepted.includes(u),
      })),
    [displayList, intercepted]
  );
  const columns = useMemo(() => {
    return [
      {
        title: "地址",
        dataIndex: "url",
        render: (v: string) => (
          <a style={{ color: "#fff" }} onClick={() => handleEditClick(v)}>
            {v}
          </a>
        ),
      },
      {
        title: "状态",
        dataIndex: "enabled",
        render: (v: boolean) => <EnableStatus enabled={v} />,
      },
      {
        title: "操作",
        render: (record: any) => {
          return (
            <span className="page-home-table-actions">
              <a
                onClick={(e) =>
                  handleEnableChange(record.url, !record.enabled, e)
                }
              >
                {record.enabled ? "禁用" : "启用"}
              </a>
              <a onClick={handleDeleteClick(record.url)}>删除</a>
            </span>
          );
        },
      },
    ];
  }, [handleDeleteClick, handleEditClick, handleEnableChange]);
  const rowSelection: TableRowSelection<any> = {
    selectedRowKeys,
    onChange: (keys: any[], rows: any) => {
      setSelectedRowKeys(keys);
    },
  };
  return (
    <section className="page-home">
      <Row className="page-home-header">
        <h2 className="page-home-header-title">请求信息列表</h2>
      </Row>
      <Row className="page-home-filter" gutter={16}>
        <Col span={6}>
          <Form.Item label="过滤类型">
            <Select defaultValue="all" onChange={handleStatusChange}>
              <Select.Option value="all">全部</Select.Option>
              <Select.Option value="enabled">已启用</Select.Option>
              <Select.Option value="disabled">已禁用</Select.Option>
            </Select>
            {/* <Radio.Group
              defaultValue="all"
              buttonStyle="solid"
              onChange={handleStatusChange}
              value={filter.type}
            >
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="enabled">已开启拦截</Radio.Button>
              <Radio.Button value="disabled">未开启拦截</Radio.Button>
            </Radio.Group> */}
          </Form.Item>
        </Col>
        <Col span="6">
          <Form.Item label="过滤地址">
            <Input.Search
              placeholder="过滤地址"
              defaultValue=""
              value={filter.search}
              onChange={handleValueChange}
            />
          </Form.Item>
        </Col>
        {/* <Col span={4}>
          <Button onClick={handleResetClick}>重置</Button>
        </Col> */}
      </Row>
      <Row className="page-home-buttons">
        <Button onClick={handleGroupOperate("enable")}>批量启用</Button>
        <Button onClick={handleGroupOperate("disable")}>批量禁用</Button>
        <Button onClick={handleGroupOperate("delete")}>批量删除</Button>
      </Row>
      <Table
        loading={loading}
        dataSource={dataSource}
        columns={columns}
        rowSelection={rowSelection}
        rowKey={(v) => v.url}
        onRow={(record: any) => ({
          style: {
            cursor: "pointer",
          },
          title: "点击进入详情或编辑",
          onClick: (e) => {
            handleEditClick(record.url);
          },
        })}
      />
    </section>
  );
};

export default Home;
