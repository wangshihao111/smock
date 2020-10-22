import React, {
  FC,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  ReactElement,
} from "react";
import { RouteChildrenProps } from "react-router-dom";
import { notification, Tabs, Button, Modal, Form, Input } from "antd";
import { SyncOutlined, SaveOutlined, LeftOutlined } from "@ant-design/icons";
import { AxiosError } from "axios";
import "ace-builds";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-dracula";

import "./index.scss";
import { getApiDetail, saveApiData } from "../../service/mock.service";
import HeadersEdit, { RowData } from "./HeadersEdit";

const { TabPane } = Tabs;

interface HistoryItem {
  key: string;
  request: {
    params: any;
    body: any;
  };
  response: any;
}

function parseResponseData(data: any): HistoryItem[] {
  const result: HistoryItem[] = [];
  for (const key in data) {
    result.push({
      key,
      request: data[key].request,
      response: data[key].response,
    });
  }
  return result;
}

// 正在编辑的头信息，中间变量
let editHeaders = {};

const ContentEdit: FC<RouteChildrenProps> = (props) => {
  const path = decodeURIComponent((props.match?.params as any).api);
  const [form, setForm] = useState<string>("");
  const [editKey, setEditKey] = useState<string>("");
  const [eh, setEh] = useState<number>(500);
  const [detail, setDetail] = useState<HistoryItem[]>([]);
  const [editStatusNum, setEditStatusNum] = useState<number>(0);
  const [editingHeader, setEditingHeader] = useState<any>({});
  const fetchDetail = useCallback(
    (saved = false, reset = false) => {
      getApiDetail(path, reset)
        .then((res) => {
          const data = parseResponseData(res.data);
          if (!saved) {
            setForm(data[0].response.data);
            setEditKey(data[0].key);
            editHeaders = data[0].response.headers;
            setEditingHeader(editHeaders);
            setEditStatusNum(data[0].response.status);
          }
          setDetail(data);
        })
        .catch((e: AxiosError) => {
          let message = "";
          if (e.response && e.response.data) {
            message = e.response.data.message;
          } else {
            message = "获取失败，请重试";
          }
          notification.error({
            message,
          });
        });
    },
    [path]
  );
  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);
  const handleContentChange = (value: string): void => {
    setForm(value);
  };
  const handleTabChange = (key: string): void => {
    const target = detail.find((v) => v.key === key);
    setForm(target?.response.data);
    setEditKey(key);
    editHeaders = target?.response.headers;
    setEditingHeader(editHeaders);
    setEditStatusNum(target?.response.status);
  };
  const handleAction = (type: string) => (): void => {
    const target = detail.find((v) => v.key === editKey);
    if (type === "reset") {
      Modal.confirm({
        title: "重置将放弃所有更改，确定吗？",
        onOk: async () => {
          fetchDetail(false, true);
        },
      });
    } else {
      try {
        const data = JSON.parse(form);
        saveApiData({
          path,
          key: editKey,
          response: {
            ...target?.response,
            status: editStatusNum,
            headers: editHeaders,
            data,
          },
        })
          .then((res) => {
            fetchDetail(true);
            notification.success({
              message: "保存成功。",
            });
          })
          .catch((e: AxiosError) => {
            let message = "";
            if (e.response && e.response.data) {
              message = e.response.data.message;
            } else {
              message = "保存失败。";
            }
            notification.error({
              message,
            });
          });
      } catch (error) {
        notification.error({
          message: "格式化失败，请检查内容格式！",
        });
      }
    }
  };

  const handleHeadersChange = (values: RowData[]): void => {
    const headers = {} as any;
    values.forEach((v) => (headers[v.key] = v.value));
    editHeaders = headers;
  };
  function fitEditorHeight(): void {
    const height = window.innerHeight;
    const editorHeight = height - 60 - 16 - 8 - 46 - 42;
    setEh(editorHeight);
  }
  useLayoutEffect(() => {
    fitEditorHeight();
    window.addEventListener("resize", fitEditorHeight);
    return (): void => {
      window.removeEventListener("resize", fitEditorHeight);
    };
  }, []);
  const renderTab = (request: any): ReactElement => {
    return (
      <div className="history-tab-item-tab">
        <pre>{request}</pre>
      </div>
    );
  };

  const getHeadersArr = (headers: any = {}) => {
    return Object.keys(headers).map((h) => ({ key: h, value: headers[h] }));
  };
  const isDetail = (props.match?.params as any).detail === "true";
  return (
    <div className="page-edit">
      <header className="page-edit-header">
        <div
          className="back-arrow"
          onClick={(): void => props.history.push("/home")}
        >
          <LeftOutlined />
        </div>
        <h3 className="page-edit-header-title">接口编辑</h3>
        {!isDetail && (
          <div className="operation-wrap">
            <Button
              type="default"
              style={{ marginRight: 16 }}
              disabled={isDetail}
              icon={<SyncOutlined />}
              onClick={handleAction("reset")}
            >
              重置为初始值
            </Button>
            <Button
              disabled={isDetail}
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleAction("save")}
            >
              保存
            </Button>
          </div>
        )}
      </header>
      <main className="page-edit-content">
        <div className="history-tab-content">
          <div className="content-edit">
            <header className="content-edit-header">
              <h2 className="content-edit-header-title">响应体编辑</h2>
              <Form.Item label="响应状态码">
                {isDetail ? (
                  editStatusNum
                ) : (
                  <Input
                    size="small"
                    value={editStatusNum}
                    onChange={(e): void => {
                      setEditStatusNum(Number(e.target.value || editStatusNum));
                    }}
                  />
                )}
              </Form.Item>
            </header>
            <div className="content-edit-content">
              <Tabs tabPosition="left" onChange={handleTabChange}>
                {detail.map(({ key, request, response }) => (
                  <TabPane key={key} tab={renderTab(request)}></TabPane>
                ))}
              </Tabs>
              <AceEditor
                readOnly={isDetail}
                style={{
                  width: "100%",
                  height: eh,
                }}
                placeholder="Placeholder Text"
                mode="json"
                theme="dracula"
                onChange={(v): void => handleContentChange(v)}
                fontSize={14}
                showPrintMargin={true}
                showGutter={true}
                highlightActiveLine={true}
                value={form}
                setOptions={{
                  useWorker: false,
                  enableBasicAutocompletion: false,
                  enableSnippets: false,
                  showLineNumbers: true,
                  tabSize: 2,
                }}
              />
            </div>
          </div>
          {
            <HeadersEdit
              disabled={isDetail}
              style={{ height: eh }}
              headers={getHeadersArr(editingHeader)}
              onChange={handleHeadersChange}
            />
          }
        </div>
      </main>
    </div>
  );
};

export default ContentEdit;
