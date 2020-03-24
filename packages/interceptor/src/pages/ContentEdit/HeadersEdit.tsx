import React, { FC, useEffect, useRef, ChangeEvent } from 'react'
import { Row, Col, Form, Input, Button, Modal } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons'
import './header-edit.scss'
import { FormInstance } from 'antd/lib/form';

interface HeadersEditProps {
  headers: any;
  onChange?: (value: any) => any;
  style: any
}

type PairValue = {
  key: string;
  value: string;
};

interface PairItemProps {
  value?: PairValue,
  onChange?: (v: PairValue) => any;
  onDelete?: () => any;
};

const PairItem: FC<PairItemProps> = (props) => {
  const { value={key:'', value: ''}, onChange, onDelete } = props;
  console.log(value)
  const handleChange = (name: string) => (e: ChangeEvent<HTMLInputElement>) => {
    const result = {...value, [name]: e.target.value} as PairValue;
    onChange && onChange(result);
  }
  return (
    <Row gutter={24} align="bottom">
      <Col span={10}>
        <Form.Item name={value.key} label="响应头键名" rules={[{required: true, message: '必填'}]}>
          <Input onChange={handleChange('key')} value={value.key} />
        </Form.Item>
      </Col>
      <Col span={10}>
        <Form.Item name={value.value} label="响应头键值" rules={[{required: true, message: '必填'}]}>
          <Input onChange={handleChange('value')} value={value.value} />
        </Form.Item>
      </Col>
      <Col span={4}>
        <Button style={{marginBottom: 24}} icon={<DeleteOutlined />} onClick={() => onDelete && onDelete()}/>
      </Col>
    </Row>
  )
}

const HeadersEdit: FC<HeadersEditProps> = (props) => {
  const form = useRef<FormInstance>({} as any)
  console.log(props)
  useEffect(() => {
    const result = {} as any;
    for (const key in props.headers) {
      result[key] = {key, value: props.headers[key]}
    }
    form.current?.setFieldsValue(result);
  }, [props.headers])
  const handleValueChange = (changed: any, values: any) => {
    const {names, ...rest} = values;
    let result = {} as any;
    // names.forEach((el: any) => {
    //   result[el.key] = el.value;
    // });
    Object.keys(rest).forEach((k: any) => {
      const {key, value} = rest[k];
      result[key] = value;
    })
    if (props.onChange) {
      console.log(result)
      props.onChange(result);
    }
  }
  return (
    <section className="headers-edit" style={{height: props.style.height + 42}}>
      <header className="headers-edit-header">响应头编辑</header>
      <Form ref={form} onValuesChange={handleValueChange}>
        {
          Object.keys(props.headers || {}).map(h => (
            <Row gutter={24} align="bottom" key={h}>
              <Col span={10}>
                <Form.Item name={[h, 'key']} label="响应头键名" rules={[{required: true, message: '必填'}]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item name={[h, 'value']} label="响应头键值" rules={[{required: true, message: '必填'}]}>
                  <Input />
                </Form.Item>
              </Col>
              {/* <Col span={4}>
                <Button style={{marginBottom: 24}} icon={<DeleteOutlined />} onClick={handleDeleteClick(h)}/>
              </Col> */}
            </Row>
          ))
        }
        {/* <Form.List name={'names'}>
          {
            (fields: any[], {add, remove}) => {
              return (
                <div>
                  {
                    fields.map((field, index) => (
                      <Form.Item name={field.name} key={field.name} style={{marginBottom: 0}}>
                        <PairItem onDelete={() => remove(field.name)} />
                      </Form.Item>
                    ))
                  }
                  <Button icon={<PlusCircleOutlined />} onClick={() => add()}>添加响应头</Button>
                </div>
              )
            }
          }
        </Form.List> */}
      </Form>
    </section>
  )
}

export default HeadersEdit;
