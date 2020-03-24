import React, { FC, useState, useEffect, useCallback, useLayoutEffect } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import { getApiDetail, saveApiData } from '../../service/mock.service';
import { notification, Tabs, Button, Modal, Checkbox } from 'antd';
import { SyncOutlined, SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import 'ace-builds'
import AceEditor from 'react-ace';

import "ace-builds/src-noconflict/ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-tomorrow";

import './index.scss'
import { CheckboxChangeEvent } from 'antd/lib/checkbox';
import HeadersEdit from './HeadersEdit';

const { TabPane } = Tabs;

interface HistoryItem {
  key: string;
  request: {
    params: any;
    body: any;
  };
  response: any
};

function parseResponseData(data: any): HistoryItem[] {
  const result: HistoryItem[] = [];
  for (const key in data) {
    result.push({
      key,
      request: data[key].request,
      response: data[key].response
    })
  }
  return result;
}

let editHeaders = {}

function getModeByHeader(headers = {} as any): string {
  const contentType = headers['content-type'] || 'application/json';
  return contentType.split('/')[1] || 'json'
}

const ContentEdit: FC<RouteChildrenProps> = (props) => {
  const path = decodeURIComponent((props.match?.params as any).api);
  const [form, setForm] = useState<string>('');
  const [editKey, setEditKey] = useState<string>('');
  const [eh, setEh] = useState<number>(500);
  const [detail, setDetail] = useState<HistoryItem[]>([]);
  // const [showHeaderEdit, setShowHeaderEdit] = useState<boolean>(true);
  const fetchDetail = useCallback((saved: boolean=false) => {
    getApiDetail(path).then(res => {
      const data = parseResponseData(res.data);
      if (!saved) {
        setForm(data[0].response.data);
        setEditKey(data[0].key);
        editHeaders = data[0].response.headers
      }
      setDetail(data);
    }).catch(e => {
      notification.error({
        message: '获取失败，请重试',
      })
    })
  }, [path])
  useEffect(() => {
    console.log('object')
    fetchDetail();
  }, [fetchDetail])
  const handleContentChange = (value: string, key: string) => {
    setForm(value);
  }
  const handleTabChange = (key: string) => {
    const target = detail.find(v => v.key === key);
    setForm(target?.response.data);
    setEditKey(key);
  }
  const handleAction = (type: string) => () => {
    const target = detail.find(v => v.key === editKey);
    if (type === 'reset') {
      if (form !== target?.response.data) {
        Modal.confirm({
          title: '重置将放弃所有更改，确定吗？',
          onOk: () => {
            const target = detail.find(v => v.key === editKey);
            setForm(target?.response.data);
            editHeaders = target?.response.headers;
          }
        });
      }
    } else {
      try {
        const data = JSON.parse(form);
        saveApiData({
          path,
          key: editKey,
          response: {
            ...target?.response,
            headers: editHeaders,
            data,
          }
        }).then(res => {
          fetchDetail(true)
          notification.success({
            message: '保存成功。'
          })
        }).catch(() => {
          notification.error({
            message: '保存失败。'
          })
        });
      } catch (error) {
        notification.error({
          message: "格式化失败，请检查内容格式！"
        })
      }
      
    }
  }

  const handleHeadersChange = (values: any) => {
    editHeaders = values;
  }
  function fitEditorHeight() {
    const height = window.innerHeight;
    let editorHeight = height - 60 - 16 - 8 - 46 - 42;
    // if (showHeaderEdit) {
    //   editorHeight -= 200;
    // }
    setEh(editorHeight);
  }
  useLayoutEffect(() => {
    fitEditorHeight();
    window.addEventListener('resize', fitEditorHeight);
    return () => {
      window.removeEventListener('resize', fitEditorHeight);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const renderTab = (request: any) => {
    return (
      <div className="history-tab-item-tab">
        <pre>
          {request}
        </pre>
      </div>
    )
  }
  return (
    <div className="page-edit">
      <header className="page-edit-header">
        <div className="back-arrow" onClick={() => props.history.push('/home')}>
          <ArrowLeftOutlined />
        </div>
        <h3 className="page-edit-header-title">接口编辑</h3>
        {/* <div className="page-edit-header-left">
          <Checkbox checked={showHeaderEdit} onChange={(e: CheckboxChangeEvent) => setShowHeaderEdit(e.target.checked)}>
            显示请求头编辑
          </Checkbox>
        </div> */}
        <div className="operation-wrap">
          <Button type="link" onClick={() => props.history.push('/home')}>返回上一页</Button>
          <Button type="link" icon={<SyncOutlined />} onClick={handleAction('reset')}>重置为初始值</Button>
          <Button type="link" icon={<SaveOutlined />} onClick={handleAction('save')}>保存</Button>
        </div>
      </header>
      <main className="page-edit-content">
        <Tabs tabPosition="left" onChange={handleTabChange}>
          {
            detail.map(({key, request, response}) => (
              <TabPane key={key} tab={renderTab(request)}>
                <div className="history-tab-content">
                  <div className="content-edit">
                    <header className="content-edit-title">响应体编辑</header>
                    <AceEditor
                      style={{width: '100%', height: eh, boxShadow: '-1px -1px 5px 0 #ababab'}}
                      placeholder="Placeholder Text"
                      mode={getModeByHeader(response.headers)}
                      theme="tomorrow"
                      onChange={v => handleContentChange(v, key)}
                      fontSize={14}
                      showPrintMargin={true}
                      showGutter={true}
                      highlightActiveLine={true}
                      value={form}
                      setOptions={{
                        useWorker: false,
                        enableBasicAutocompletion: false,
                        enableLiveAutocompletion: false,
                        enableSnippets: false,
                        showLineNumbers: true,
                        tabSize: 2,
                      }}
                    />
                  </div>
                  {
                    <HeadersEdit style={{height: eh}} headers={response.headers} onChange={handleHeadersChange} />
                  }
                </div>
              </TabPane>
            ))
          }
        </Tabs>
      </main>
    </div>
  )
}

export default ContentEdit
