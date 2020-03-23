import React, { FC, useState, useEffect, useCallback } from 'react'
import { RouteChildrenProps } from 'react-router-dom'
import { getApiDetail, saveApiData } from '../../service/mock.service';
import { notification, Tabs, Button, Modal } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import 'ace-builds'
import AceEditor from 'react-ace';

import "ace-builds/src-noconflict/ace";

import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-tomorrow";

import './index.scss'

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

const ContentEdit: FC<RouteChildrenProps> = (props) => {
  const path = decodeURIComponent((props.match?.params as any).api);
  const [form, setForm] = useState<string>('');
  const [editKey, setEditKey] = useState<string>('');
  const [detail, setDetail] = useState<HistoryItem[]>([]);
  const fetchDetail = useCallback((saved: boolean=false) => {
    getApiDetail(path).then(res => {
      const data = parseResponseData(res.data);
      if (!saved) {
        setForm(data[0].response.data);
        setEditKey(data[0].key);
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
            ...target,
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
      <Tabs tabPosition="left" onChange={handleTabChange}>
        {
          detail.map(({key, request}) => (
            <TabPane key={key} tab={renderTab(request)}>
              <div className="history-tab-content">
                <div className="operation-wrap">
                  <Button type="link" icon={<EditOutlined />} onClick={handleAction('reset')}>重置为初始值</Button>
                  <Button type="link" icon={<EditOutlined />} onClick={handleAction('save')}>保存</Button>
                </div>
                <AceEditor
                  style={{width: '100%'}}
                  placeholder="Placeholder Text"
                  mode="json"
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
            </TabPane>
          ))
        }
      </Tabs>
    </div>
  )
}

export default ContentEdit
