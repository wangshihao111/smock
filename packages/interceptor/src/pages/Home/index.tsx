import React, { FC, useEffect, useState, useRef, ChangeEvent } from 'react'
import { List, Input, Row, Col, Button, Form, Modal, Radio } from 'antd'
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'
import './index.scss';
import { getApiList } from 'src/service/mock.service';
import { RouteChildrenProps } from 'react-router-dom';

interface ApiList {
  current: string[];
  total: string[];
}

const Home: FC<RouteChildrenProps> = (props) => {
  const [list, setList] = useState<ApiList>({current: [], total: []});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    getApiList().then(res => {
      setList({current: res.data, total: res.data});
      setLoading(false);
    });
  }, [])
  const handleDeleteClick = (path: string) => () => {
    Modal.confirm({
      title: '确定删除吗？',
      onOk: () => {
        console.log('delete', path)
      }
    })
  }
  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value)
    setList({
      ...list,
      current: list.total.filter(v => v.match(e.target.value))
    })
  }
  const handleEditClick = () => {
    props.history.push('/content-edit');
  }
  return (
    <section className="page-home">
      <Row className="page-home-header" gutter={16}>
        <Col span="8">
          <Form.Item label="过滤名称">
            <Input.Search placeholder="过滤列表" defaultValue="" onChange={handleValueChange} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="过滤类型">
          <Radio.Group defaultValue="all" buttonStyle="solid">
            <Radio.Button value="all">全部</Radio.Button>
            <Radio.Button value="is">已开启拦截</Radio.Button>
            <Radio.Button value="not">未开启拦截</Radio.Button>
          </Radio.Group>
          </Form.Item>
        </Col>
        <Col span={4}>
          <Button>重置</Button>
        </Col>
      </Row>
      <List loading={loading}>
        {
          list.current.map(v => (
            <List.Item key={v}>
              <div className="page-home-list-item">
                <span className="page-home-list-item-content">{v}</span>
                <span className="page-home-list-item-action">
                  <Button icon={<DeleteOutlined />} onClick={handleDeleteClick(v)}>删除记录</Button>
                  <Button type="primary" icon={<EditOutlined />} onClick={handleEditClick}>编辑内容</Button>
                </span>
              </div>
            </List.Item>
          ))
        }
        {
          !loading && list.current && (
          <List.Item>
            暂无记录
          </List.Item>)
        }
      </List>
    </section>
  )
}

export default Home;
