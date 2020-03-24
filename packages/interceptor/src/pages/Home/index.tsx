import React, { FC, useEffect, useState, ChangeEvent } from 'react'
import { List, Input, Row, Col, Button, Checkbox, Form, Modal, Radio } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import './index.scss';
import { getApiList, getInterceptedList, updateInterceptedList, deleteHistory } from 'src/service/mock.service';
import { RouteChildrenProps } from 'react-router-dom';
import { RadioChangeEvent } from 'antd/lib/radio';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

type FilterForm = {
  search: string;
  type: string;
}

function getDisplayList(list: string[], filter: FilterForm, intercepted: string[]) {
  return list.filter(item => item.match(filter.search)).filter(item => {
    if (filter.type === 'all') return true;
    else if (filter.type === 'enabled') {
      return intercepted.includes(item);
    } else {
      return !intercepted.includes(item);
    }
  })
}

const Home: FC<RouteChildrenProps> = (props) => {
  const [list, setList] = useState<string[]>([]);
  const [intercepted, setIntercepted] = useState<string[]>([]);
  const [filter, setFilter] = useState<FilterForm>({search: '', type: 'all'});
  const [loading, setLoading] = useState(false);
  const fetchList = () => {
    setLoading(true);
    getApiList().then(res => {
      setList(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
    getInterceptedList().then(res => {
      setIntercepted(res.data);
    }).catch((e) => {console.log(e)})
  }
  useEffect(() => {
    fetchList();
  }, [])
  const handleResetClick = () => {
    setFilter({search: '', type: 'all'})
  }
  const handleDeleteClick = (path: string) => () => {
    Modal.confirm({
      title: '确定删除吗？',
      onOk: () => {
        console.log('delete', path);
        deleteHistory(path).then((res) => {
          fetchList();
        })
      }
    })
  }
  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter({
      ...filter,
      search: e.target.value
    })
  }
  const handleStatusChange = (e: RadioChangeEvent) => {
    console.log(e.target.value)
    setFilter({
      ...filter,
      type: e.target.value
    });
  }

  const updateIntercepted = (targetList: string[]) => {
    updateInterceptedList(targetList).then(res => {
      const list = res.data.list;
      setIntercepted(list);
    })
  }

  const handleEnableChange = (api: string) => (e: CheckboxChangeEvent) => {
    const index = intercepted.indexOf(api);
    const targetList = [...intercepted]
    if (e.target.checked) {
      if (index < 0) {
        targetList.push(api);
      }
    } else {
      if (index > -1) {
        targetList.splice(index, 1);
      }
    }
    updateIntercepted(targetList);
  }
  const handleSelectAll = (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    if (checked) {
      updateIntercepted(list);
    } else {
      updateIntercepted([])
    }
  }
  const handleEditClick = (v: string) => {
    props.history.push(`/content-edit/${encodeURIComponent(v)}`);
  }
  const displayList = getDisplayList(list, filter, intercepted);
  const listFooter = displayList.length ? (
    <div className="page-home-list-item" style={{justifyContent: 'space-between'}}>
      <span className="page-home-list-item-content">请求记录列表：</span>
      <span className="page-home-list-item-action" style={{marginRight: 252}}>
        <Checkbox checked={intercepted.length === list.length} onChange={handleSelectAll}>全选</Checkbox>
      </span>
    </div>
  ) : null;
  return (
    <section className="page-home">
      <Row className="page-home-header" gutter={16}>
      <Col span={12}>
          <Form.Item label="过滤类型">
          <Radio.Group defaultValue="all" buttonStyle="solid" onChange={handleStatusChange} value={filter.type}>
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="enabled">已开启拦截</Radio.Button>
            <Radio.Button value="disabled">未开启拦截</Radio.Button>
          </Radio.Group>
          </Form.Item>
        </Col>
        <Col span="8">
          <Form.Item label="过滤地址">
            <Input.Search placeholder="过滤地址" defaultValue="" value={filter.search} onChange={handleValueChange} />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Button onClick={handleResetClick}>重置</Button>
        </Col>
      </Row>
      <List loading={loading} className="page-home-list" header={listFooter}>
        {
          displayList.map(v => (
            <List.Item key={v}>
              <div className="page-home-list-item">
                <span className="page-home-list-item-content">{v}</span>
                <span className="page-home-list-item-action">
                  <Checkbox checked={intercepted.includes(v)} onChange={handleEnableChange(v)}>启用</Checkbox>
                  <Button icon={<DeleteOutlined />} onClick={handleDeleteClick(v)}>删除记录</Button>
                  <Button type="primary" icon={<EditOutlined />} onClick={() => handleEditClick(v)}>编辑内容</Button>
                </span>
              </div>
            </List.Item>
          ))
        }
        {
          !loading  && displayList.length === 0 && (
          <List.Item>
            暂无记录
          </List.Item>)
        }
      </List>
    </section>
  )
}

export default Home;
