import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'loadsh';
import constants from '../../../../constants/variable.js';
import { handlePath, nameLengthLimit } from '../../../../common.js';
import { changeEditStatus } from '../../../../reducer/modules/interface.js';
import json5 from 'json5';
import { BarsOutlined, DeleteOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Form } from '@ant-design/compatible';
import '@ant-design/compatible/assets/index.css';
import {message, Affix, Tabs, Modal, TreeSelect} from 'antd';
import EasyDragSort from '../../../../components/EasyDragSort/EasyDragSort.js';
import MultiUserSelect from "../../../../components/MultiUserSelect/MulitUserSelect";
import mockEditor from 'client/components/AceEditor/mockEditor';
import AceEditor from 'client/components/AceEditor/AceEditor';
import axios from 'axios';
import { MOCK_SOURCE } from '../../../../constants/variable.js';
import Editor from 'common/tui-editor/dist/tui-editor-Editor-all.min.js';
import BachUpCase from '../../../../components/BachUpCase/BachUpCase';
const jSchema = require('json-schema-editor-visual');
const ResBodySchema = jSchema({ lang: 'zh_CN', mock: MOCK_SOURCE });
const ReqBodySchema = jSchema({ lang: 'zh_CN', mock: MOCK_SOURCE });
const TabPane = Tabs.TabPane;


require('common/tui-editor/dist/tui-editor.min.css'); // editor ui
require('common/tui-editor/dist/tui-editor-contents.min.css'); // editor content
require('./editor.css');


function checkIsJsonSchema(json) {
  try {
    json = json5.parse(json);
    if (json.properties && typeof json.properties === 'object' && !json.type) {
      json.type = 'object';
    }
    if (json.items && typeof json.items === 'object' && !json.type) {
      json.type = 'array';
    }
    if (!json.type) {
      return false;
    }
    json.type = json.type.toLowerCase();
    let types = ['object', 'string', 'number', 'array', 'boolean', 'integer'];
    if (types.indexOf(json.type) === -1) {
      return false;
    }
    return JSON.stringify(json);
  } catch (e) {
    return false;
  }
}

let EditFormContext;
const validJson = json => {
  try {
    json5.parse(json);
    return true;
  } catch (e) {
    return false;
  }
};

import { Select, Input, Tooltip, Button, Row, Col, Radio, AutoComplete, Switch } from 'antd';

const Json5Example = `
  {
    /**
     * info
     */

    "id": 1 //appId
  }

`;

const TextArea = Input.TextArea;
const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const dataTpl = {
  req_query: { name: '', required: '1', desc: '', example: '' },
  req_headers: { name: '', required: '1', desc: '', example: '' },
  req_params: { name: '', desc: '', example: '' },
  req_body_form: {
    name: '',
    type: 'text',
    required: '1',
    desc: '',
    example: ''
  }
};

const HTTP_METHOD = constants.HTTP_METHOD;
const HTTP_METHOD_KEYS = Object.keys(HTTP_METHOD);
const HTTP_REQUEST_HEADER = constants.HTTP_REQUEST_HEADER;

@connect(
  state => {
    return {
      custom_field: state.group.field,
      projectMsg: state.project.currProject
    };
  },
  {
    changeEditStatus
  }
)
class InterfaceEditForm extends Component {
  static propTypes = {
    custom_field: PropTypes.object,
    groupList: PropTypes.array,
    form: PropTypes.object,
    curdata: PropTypes.object,
    mockUrl: PropTypes.string,
    onSubmit: PropTypes.func,
    basepath: PropTypes.string,
    noticed: PropTypes.bool,
    cat: PropTypes.array,
    changeEditStatus: PropTypes.func,
    projectMsg: PropTypes.object,
    onTagClick: PropTypes.func
  };

  initState(curdata) {
    this.startTime = new Date().getTime();
    if (curdata.req_query && curdata.req_query.length === 0) {
      delete curdata.req_query;
    }
    if (curdata.req_headers && curdata.req_headers.length === 0) {
      delete curdata.req_headers;
    }
    if (curdata.req_body_form && curdata.req_body_form.length === 0) {
      delete curdata.req_body_form;
    }
    if (curdata.req_params && curdata.req_params.length === 0) {
      delete curdata.req_params;
    }
    if (curdata.req_body_form) {
      curdata.req_body_form = curdata.req_body_form.map(item => {
        item.type = item.type === 'text' ? 'text' : item.type === 'list'?'list':'file';
        return item;
      });
    }
    // 设置标签的展开与折叠
    curdata['hideTabs'] = {
      req: {
        body: 'hide',
        query: 'hide',
        headers: 'hide'
      }
    };
    curdata['hideTabs']['req'][HTTP_METHOD[curdata.method].default_tab] = '';
    return Object.assign(
      {
        submitStatus: false,
        title: '',
        path: '',
        status: 'undone',
        method: 'get',
        changevalue:-1,
        req_params: [],

        req_query: [
          {
            name: '',
            desc: '',
            required: '1'
          }
        ],

        req_headers: [
          {
            name: '',
            value: '',
            required: '1'
          }
        ],

        req_body_type: 'form',
        req_body_form: [
          {
            name: '',
            type: 'text',
            required: '1'
          }
        ],
        req_body_other: '',

        res_body_type: 'json',
        res_body: '',
        desc: '',
        res_body_mock: '',
        jsonType: 'tpl',
        mockUrl: this.props.mockUrl,
        req_radio_type: 'req-query',
        custom_field_value: '',
        api_opened: false,
        visible: false,
        showSyncModel:false,
        upjsonname:'',
        addjsonname:'',
        deljsonname:'',
        newjsonname:'',
        addjsonvlue:'',
        addjsonvalueType:'String',
        upjsonvalue:'',
        upstr:'',
        upnewstr:'',
        uptestscriptstr:'',
        uptestscriptnewstr:'',
        upprescriptstr:'',
        upprescriptnewstr:'',
        upafterscriptstr:'',
        upafterscriptnewstr:'',
        upcaseids:[],
        caseids:[],
        jsontoSchemaModel:false,
        jsonTxt:'',
        jsontoschemaType:'Request'
      },
      curdata
    );
  }

  constructor(props) {
    super(props);
    const { curdata } = this.props;
    // console.log('custom_field1', this.props.custom_field);
    this.state = this.initState(curdata);
  }

  handleSubmit = e => {
    e.preventDefault();
    this.setState({
      submitStatus: true
    });
    try {
      this.props.form.validateFields((err, values) => {
        setTimeout(() => {
          if (this._isMounted) {
            this.setState({
              submitStatus: false
            });
          }
        }, 3000);
        if (!err) {
          values.desc = this.editor.getHtml();
          values.markdown = this.editor.getMarkdown();
          if (values.res_body_type === 'json') {
            if (this.state.res_body && validJson(this.state.res_body) === false) {
              return message.error('返回body json格式有问题，请检查！');
            }
            try {
              values.res_body = JSON.stringify(JSON.parse(this.state.res_body), null, '   ');
            } catch (e) {
              values.res_body = this.state.res_body;
            }
          }
          if (values.req_body_type === 'json') {
            if (this.state.req_body_other && validJson(this.state.req_body_other) === false) {
              return message.error('响应Body json格式有问题，请检查！');
            }
            try {
              values.req_body_other = JSON.stringify(
                JSON.parse(this.state.req_body_other),
                null,
                '   '
              );
            } catch (e) {
              values.req_body_other = this.state.req_body_other;
            }
          }

          values.method = this.state.method;
          values.req_params = values.req_params || [];
          values.req_headers = values.req_headers || [];
          values.req_body_form = values.req_body_form || [];
          let isfile = false,
            isHavaContentType = false;
          if (values.req_body_type === 'form') {
            values.req_body_form.forEach(item => {
              if (item.type === 'file') {
                isfile = true;
              }
            });

            values.req_headers.map(item => {
              if (item.name === 'Content-Type') {
                item.value = isfile ? 'multipart/form-data' : 'application/x-www-form-urlencoded';
                isHavaContentType = true;
              }
            });
            if (isHavaContentType === false) {
              values.req_headers.unshift({
                name: 'Content-Type',
                value: isfile ? 'multipart/form-data' : 'application/x-www-form-urlencoded'
              });
            }
          } else if (values.req_body_type === 'json') {
            values.req_headers
              ? values.req_headers.map(item => {
                  if (item.name === 'Content-Type') {
                    item.value = 'application/json';
                    isHavaContentType = true;
                  }
                })
              : [];
            if (isHavaContentType === false) {
              values.req_headers = values.req_headers || [];
              values.req_headers.unshift({
                name: 'Content-Type',
                value: 'application/json'
              });
            }
          }
          values.req_headers = values.req_headers
            ? values.req_headers.filter(item => item.name !== '')
            : [];

          values.req_body_form = values.req_body_form
            ? values.req_body_form.filter(item => item.name !== '')
            : [];
          values.req_params = values.req_params
            ? values.req_params.filter(item => item.name !== '')
            : [];
          values.req_query = values.req_query
            ? values.req_query.filter(item => item.name !== '')
            : [];

          if (HTTP_METHOD[values.method].request_body !== true) {
            values.req_body_form = [];
          }

          if (
            values.req_body_is_json_schema &&
            values.req_body_other &&
            values.req_body_type === 'json'
          ) {
            values.req_body_other = checkIsJsonSchema(values.req_body_other);
            if (!values.req_body_other) {
              return message.error('请求参数 json-schema 格式有误');
            }
          }
          if (
            values.res_body_is_json_schema &&
            values.res_body &&
            values.res_body_type === 'json'
          ) {
            values.res_body = checkIsJsonSchema(values.res_body);
            if (!values.res_body) {
              return message.error('返回数据 json-schema 格式有误');
            }
          }

          this.props.onSubmit(values);
          EditFormContext.props.changeEditStatus(false);
        }
      });
    } catch (e) {
      console.error(e.message);
      this.setState({
        submitStatus: false
      });
    }
  };

  onChangeMethod = val => {
    let radio = [];
    if (HTTP_METHOD[val].request_body) {
      radio = ['req', 'body'];
    } else {
      radio = ['req', 'query'];
    }
    this.setState({
      req_radio_type: radio.join('-')
    });

    this.setState({ method: val }, () => {
      this._changeRadioGroup(radio[0], radio[1]);
    });
  };

  async componentWillMount() {
      //关联用例集
      let result = await axios.post('/api/interface/getCaseListId', {
        id: this.props.curdata._id
      });
      this.setState({
        caseids:result.data.data
      })
  }
  componentDidMount() {
    EditFormContext = this;
    this._isMounted = true;
    this.setState({
      req_radio_type: HTTP_METHOD[this.state.method].request_body ? 'req-body' : 'req-query'
    });

    this.mockPreview = mockEditor({
      container: 'mock-preview',
      data: '',
      readOnly: true
    });

    this.editor = new Editor({
      el: document.querySelector('#desc'),
      initialEditType: 'wysiwyg',
      height: '500px',
      initialValue: this.state.markdown || this.state.desc
    });
  }

  componentWillUnmount() {
    EditFormContext.props.changeEditStatus(false);
    EditFormContext = null;
    this._isMounted = false;
  }

  addParams = (name, data) => {
    let newValue = {};
    data = data || dataTpl[name];
    newValue[name] = [].concat(this.state[name], data);
    this.setState(newValue);
  };

  delParams = (key, name) => {
    let curValue = this.props.form.getFieldValue(name);
    let newValue = {};
    newValue[name] = curValue.filter((val, index) => {
      return index !== key;
    });
    this.props.form.setFieldsValue(newValue);
    this.setState(newValue);
  };

  handleMockPreview = async () => {
    let str = '';

    try {
      if (this.props.form.getFieldValue('res_body_is_json_schema')) {
        let schema = json5.parse(this.props.form.getFieldValue('res_body'));
        let result = await axios.post('/api/interface/schema2json', {
          schema: schema
        });
        return this.mockPreview.setValue(JSON.stringify(result.data));
      }
      if (this.resBodyEditor.editor.curData.format === true) {
        str = JSON.stringify(this.resBodyEditor.editor.curData.mockData(), null, '  ');
      } else {
        str = '解析出错: ' + this.resBodyEditor.editor.curData.format;
      }
    } catch (err) {
      str = '解析出错: ' + err.message;
    }
    this.mockPreview.setValue(str);
  };

  handleJsonType = key => {
    key = key || 'tpl';
    if (key === 'preview') {
      this.handleMockPreview();
    }
    this.setState({
      jsonType: key
    });
  };

  handlePath = e => {
    let val = e.target.value,
      queue = [];

    let insertParams = name => {
      let findExist = _.find(this.state.req_params, { name: name });
      if (findExist) {
        queue.push(findExist);
      } else {
        queue.push({ name: name, desc: '' });
      }
    };
    val = handlePath(val);
    this.props.form.setFieldsValue({
      path: val
    });
    if (val && val.indexOf(':') !== -1) {
      let paths = val.split('/'),
        name,
        i;
      for (i = 1; i < paths.length; i++) {
        if (paths[i][0] === ':') {
          name = paths[i].substr(1);
          insertParams(name);
        }
      }
    }

    if (val && val.length > 3) {
      val.replace(/\{(.+?)\}/g, function(str, match) {
        insertParams(match);
      });
    }

    this.setState({
      req_params: queue
    });
  };

  // 点击切换radio
  changeRadioGroup = e => {
    const res = e.target.value.split('-');
    if (res[0] === 'req') {
      this.setState({
        req_radio_type: e.target.value
      });
    }
    this._changeRadioGroup(res[0], res[1]);
  };

  _changeRadioGroup = (group, item) => {
    const obj = {};
    // 先全部隐藏
    for (let key in this.state.hideTabs[group]) {
      obj[key] = 'hide';
    }
    // 再取消选中项目的隐藏
    obj[item] = '';
    this.setState({
      hideTabs: {
        ...this.state.hideTabs,
        [group]: obj
      }
    });
  };

  handleDragMove = name => {
    return data => {
      let newValue = {
        [name]: data
      };
      this.props.form.setFieldsValue(newValue);
      this.setState(newValue);
    };
  };

  // 处理res_body Editor
  handleResBody = d => {
    const initResBody = this.state.res_body;
    this.setState({
      res_body: d.text
    });
    EditFormContext.props.changeEditStatus(initResBody !== d.text);
  };

  // 处理 req_body_other Editor
  handleReqBody = d => {
    const initReqBody = this.state.req_body_other;
    this.setState({
      req_body_other: d.text
    });
    EditFormContext.props.changeEditStatus(initReqBody !== d.text);
  };

  // 处理批量导入参数
  handleBulkOk = () => {
    let curValue = this.props.form.getFieldValue(this.state.bulkName);
    // { name: '', required: '1', desc: '', example: '' }
    let newValue = [];

    this.state.bulkValue.split('\n').forEach((item, index) => {
      let valueItem = Object.assign({}, curValue[index] || dataTpl[this.state.bulkName]);
      valueItem.name = item.split(':')[0];
      valueItem.example = item.replace(item.split(':')[0]+':','') || '';
      newValue.push(valueItem);
    });

    this.setState({
      visible: false,
      bulkValue: null,
      bulkName: null,
      [this.state.bulkName]: newValue
    });
  };

  // 取消批量导入参数
  handleBulkCancel = () => {
    this.setState({
      visible: false,
      bulkValue: null,
      bulkName: null
    });
  };

  showBulk = name => {
    let value = this.props.form.getFieldValue(name);

    let bulkValue = ``;
    value.forEach(item => {
      return (bulkValue += item.name ? `${item.name}:${item.example || ''}\n` : '');
    });

    this.setState({
      visible: true,
      bulkValue,
      bulkName: name
    });
  };

  handleBulkValueInput = e => {
    this.setState({
      bulkValue: e.target.value
    });
  };

  onChange = value => {
    this.props.form.setFieldsValue({catid:value});
    // this.setState({ changevalue:value });
  };
  upCaseModleClose = ()=>{
    this.setState({
      showSyncModel : false
    })
  }
  SyncModel = ()=>{
    this.setState({
      showSyncModel : true
    })
  }
  jsontoSchemaModel = ()=>{
    this.setState({
      jsontoSchemaModel : true
    })
  }
  handleJsontoschema = d =>{
    this.setState({
      jsonTxt: d.text
    });
  }
  onChangeJsontoschemaType = (e)=>{
    this.setState({jsontoschemaType:e.target.value})
  }
  jsontoSchema = ()=>{
    let jsonString = this.state.jsonTxt;
    let jsontoschemaType = this.state.jsontoschemaType;
    // **存储字段注释**
    let commentsMap = {};
  
    // 1️⃣ 逐行提取注释
    const lines = jsonString.split('\n');
    for (const line of lines) {
      const match = line.match(/"(\w+)"\s*:\s*[^\/]*\/\/\s*(.*)/);
      if (match) {
        const key = match[1];
        const comment = match[2]?.trim() || "";
        commentsMap[key] = comment;
      }
    }
  
    // 2️⃣ 清理 JSON 注释并解析
    const cleanJsonStr = jsonString.replace(/\/\/[^\n]*/g, "");
    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanJsonStr);
    } catch (error) {
      console.error("JSON 解析失败:", error);
      return null;
    }
  
    // 3️⃣ 递归构建 Schema（修正属性合并）
    function buildSchema(obj, key = "") {
      if (Array.isArray(obj)) {
        const itemsSchema = obj.length > 0 ? buildSchema(obj[0], key) : {};
        return { type: "array", items: itemsSchema };
      } else if (typeof obj === "object" && obj !== null) {
        const subSchema = {
          type: "object",
          properties: {},
          required: [],
        };
  
        // 添加当前层级的描述
        if (commentsMap[key]) {
          subSchema.description = commentsMap[key];
        } 
  
        // 处理每个子属性
        for (const childKey of Object.keys(obj)) {
          const childValue = obj[childKey];
          let childSchema;
  
          if (Array.isArray(childValue)) {
            childSchema = buildSchema(childValue, childKey);
          } else if (typeof childValue === "object" && childValue !== null) {
            childSchema = buildSchema(childValue, childKey);
          } else {
            childSchema = { type: typeof childValue };
          }
  
          // 合并子 Schema 并添加描述
          subSchema.properties[childKey] = {
            ...childSchema,
            description: commentsMap[childKey] || "",
          };
          subSchema.required.push(childKey);
        }
  
        return subSchema;
      } else {
        return { type: typeof obj, description: commentsMap[key] || "" };
      }
    }
    
    let jsonSchema = buildSchema(parsedJson);
    let schema = JSON.stringify(jsonSchema, null, 2);
    commentsMap = {};
    if(jsontoschemaType=='Request'){
      this.setState({
        req_body_other:schema
      })
    }else{
      this.setState({
        res_body:schema
      })
    }
    this.setState({
      jsontoSchemaModel:false,
      jsonTxt:'',
      jsontoschemaType:'Request'
    })
  }
  render() {
    const caseids = [];
    this.state.caseids.forEach(item=>{
      caseids.push(<Option key={item.toString() }>{item.toString()}</Option>);
    })
    const { getFieldDecorator } = this.props.form;
    const { custom_field, projectMsg } = this.props;

    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    };

    const res_body_use_schema_editor = checkIsJsonSchema(this.state.res_body) || '';

    const req_body_other_use_schema_editor = checkIsJsonSchema(this.state.req_body_other) || '';

    const queryTpl = (data, index) => {
      return (
        <Row key={index} className="interface-edit-item-content">
          <Col
            span={1}
            easy_drag_sort_child="true"
            className="interface-edit-item-content-col interface-edit-item-content-col-drag"
          >
            <BarsOutlined />
          </Col>
          <Col span={4} draggable="false" className="interface-edit-item-content-col">
            {getFieldDecorator('req_query[' + index + '].name', {
              initialValue: data.name
            })(<Input placeholder="参数名称" />)}
          </Col>
          <Col span={3} className="interface-edit-item-content-col">
            {getFieldDecorator('req_query[' + index + '].required', {
              initialValue: data.required
            })(
              <Select>
                <Option value="1">必需</Option>
                <Option value="0">非必需</Option>
              </Select>
            )}
          </Col>
          <Col span={6} className="interface-edit-item-content-col">
            {getFieldDecorator('req_query[' + index + '].example', {
              initialValue: data.example
            })(<TextArea autoSize={true} placeholder="参数示例" />)}
          </Col>
          <Col span={9} className="interface-edit-item-content-col">
            {getFieldDecorator('req_query[' + index + '].desc', {
              initialValue: data.desc
            })(<TextArea autoSize={true} placeholder="备注" />)}
          </Col>
          <Col span={1} className="interface-edit-item-content-col">
            <DeleteOutlined
              className="interface-edit-del-icon"
              onClick={() => this.delParams(index, 'req_query')} />
          </Col>
        </Row>
      );
    };

    const headerTpl = (data, index) => {
      return (
        <Row key={index} className="interface-edit-item-content">
          <Col
            span={1}
            easy_drag_sort_child="true"
            className="interface-edit-item-content-col interface-edit-item-content-col-drag"
          >
            <BarsOutlined />
          </Col>
          <Col span={4} className="interface-edit-item-content-col">
            {getFieldDecorator('req_headers[' + index + '].name', {
              initialValue: data.name
            })(
              <AutoComplete
                dataSource={HTTP_REQUEST_HEADER}
                filterOption={(inputValue, option) =>
                  option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                placeholder="参数名称"
              />
            )}
          </Col>
          <Col span={3} className="interface-edit-item-content-col">
            {getFieldDecorator('req_headers[' + index + '].required', {
              initialValue: data.required
            })(
              <Select>
                <Option value="1">必需</Option>
                <Option value="0">非必需</Option>
              </Select>
            )}
          </Col>
          <Col span={5} className="interface-edit-item-content-col">
            {getFieldDecorator('req_headers[' + index + '].value', {
              initialValue: data.value
            })(<Input placeholder="参数值" />)}
          </Col>
          <Col span={5} className="interface-edit-item-content-col">
            {getFieldDecorator('req_headers[' + index + '].example', {
              initialValue: data.example
            })(<TextArea autoSize={true} placeholder="参数示例" />)}
          </Col>
          <Col span={5} className="interface-edit-item-content-col">
            {getFieldDecorator('req_headers[' + index + '].desc', {
              initialValue: data.desc
            })(<TextArea autoSize={true} placeholder="备注" />)}
          </Col>
          <Col span={1} className="interface-edit-item-content-col">
            <DeleteOutlined
              className="interface-edit-del-icon"
              onClick={() => this.delParams(index, 'req_headers')} />
          </Col>
        </Row>
      );
    };

    const requestBodyTpl = (data, index) => {
      return (
        <Row key={index} className="interface-edit-item-content">
          <Col
            span={1}
            easy_drag_sort_child="true"
            className="interface-edit-item-content-col interface-edit-item-content-col-drag"
          >
            <BarsOutlined />
          </Col>
          <Col span={4} className="interface-edit-item-content-col">
            {getFieldDecorator('req_body_form[' + index + '].name', {
              initialValue: data.name
            })(<Input placeholder="name" />)}
          </Col>
          <Col span={3} className="interface-edit-item-content-col">
            {getFieldDecorator('req_body_form[' + index + '].type', {
              initialValue: data.type
            })(
              <Select>
                <Option value="text">text</Option>
                <Option value="list">list</Option>
                <Option value="file">file</Option>
              </Select>
            )}
          </Col>
          <Col span={3} className="interface-edit-item-content-col">
            {getFieldDecorator('req_body_form[' + index + '].required', {
              initialValue: data.required
            })(
              <Select>
                <Option value="1">必需</Option>
                <Option value="0">非必需</Option>
              </Select>
            )}
          </Col>
          <Col span={5} className="interface-edit-item-content-col">
            {getFieldDecorator('req_body_form[' + index + '].example', {
              initialValue: data.example
            })(<TextArea autoSize={true} placeholder="参数示例" />)}
          </Col>
          <Col span={7} className="interface-edit-item-content-col">
            {getFieldDecorator('req_body_form[' + index + '].desc', {
              initialValue: data.desc
            })(<TextArea autoSize={true} placeholder="备注" />)}
          </Col>
          <Col span={1} className="interface-edit-item-content-col">
            <DeleteOutlined
              className="interface-edit-del-icon"
              onClick={() => this.delParams(index, 'req_body_form')} />
          </Col>
        </Row>
      );
    };

    const paramsTpl = (data, index) => {
      return (
        <Row key={index} className="interface-edit-item-content">
          <Col span={6} className="interface-edit-item-content-col">
            {getFieldDecorator('req_params[' + index + '].name', {
              initialValue: data.name
            })(<Input disabled placeholder="参数名称" />)}
          </Col>
          <Col span={7} className="interface-edit-item-content-col">
            {getFieldDecorator('req_params[' + index + '].example', {
              initialValue: data.example
            })(<TextArea autoSize={true} placeholder="参数示例" />)}
          </Col>
          <Col span={11} className="interface-edit-item-content-col">
            {getFieldDecorator('req_params[' + index + '].desc', {
              initialValue: data.desc
            })(<TextArea autoSize={true} placeholder="备注" />)}
          </Col>
        </Row>
      );
    };

    const paramsList = this.state.req_params.map((item, index) => {
      return paramsTpl(item, index);
    });

    const QueryList = this.state.req_query.map((item, index) => {
      return queryTpl(item, index);
    });

    const headerList = this.state.req_headers
      ? this.state.req_headers.map((item, index) => {
          return headerTpl(item, index);
        })
      : [];

    const requestBodyList = this.state.req_body_form.map((item, index) => {
      return requestBodyTpl(item, index);
    });

    const DEMOPATH = '/api/user/{id}';

    console.log({"this.props.cat":this.props.cat});

    return (
      <div>
        {this.state.showSyncModel?(
          <BachUpCase
            reqBodyType={this.props.form.getFieldValue('req_body_type')}
            caseIds={this.state.caseids}
            showSyncModel={true}
            syncForInterface={true}
            upCaseids={[]}
            interFaceid={this.props.curdata._id}
            isClose={this.upCaseModleClose}
            projectId={projectMsg._id}
            curProject={this.props.projectMsg}
          >
          </BachUpCase>
        ):null}
        <Modal
          title="josn"
          open={this.state.jsontoSchemaModel}
          onOk={this.jsontoSchema}
          onCancel={() => {
            this.setState({ jsontoSchemaModel: false,jsonTxt:'',jsontoschemaType:'Request' });
          }}
          width={'500px'}
        >
          <AceEditor
            data={this.state.jsonTxt}
            style={{width: '100%', height: '500px' }}
            onChange={this.handleJsontoschema}
            fullScreen={true}
          />
          <Radio.Group onChange={this.onChangeJsontoschemaType} value={this.state.jsontoschemaType}>
            <Radio value='Request'>Reuqest</Radio>
            <Radio value='Response'>Response</Radio>
          </Radio.Group>
        </Modal>
        <Modal
          title="批量添加参数"
          width={680}
          open={this.state.visible}
          onOk={this.handleBulkOk}
          onCancel={this.handleBulkCancel}
          okText="导入"
        >
          <div>
            <TextArea
              placeholder="每行一个name:examples"
              autoSize={{ minRows: 6, maxRows: 10 }}
              value={this.state.bulkValue}
              onChange={this.handleBulkValueInput}
            />
          </div>
        </Modal>
        <Form onSubmit={this.handleSubmit}>
          <h2 className="interface-title" style={{ marginTop: 0 }}>
            基本设置
          </h2>
          <div className="panel-sub">
            <FormItem className="interface-edit-item" {...formItemLayout} label="接口名称">
              {getFieldDecorator('title', {
                initialValue: this.state.title,
                rules: nameLengthLimit('接口')
              })(<Input id="title" placeholder="接口名称" />)}
            </FormItem>

            <FormItem className="interface-edit-item" {...formItemLayout} label="选择分类">
              {getFieldDecorator('catid', {
                initialValue: this.state.catid + '',
                rules: [{ required: true, message: '请选择一个分类' }]
              })(
                <TreeSelect
                // value={this.state.changevalue}
                className="select path"
                treeData={this.props.cat}
                onChange={this.onChange}
                />
              )}
            </FormItem>

            <FormItem
              className="interface-edit-item"
              {...formItemLayout}
              label={
                <span>
                  接口路径&nbsp;
                  <Tooltip
                    title={
                      <div>
                        <p>
                          1. 支持动态路由,例如:
                          {DEMOPATH}
                        </p>
                        <p>
                          2. 支持 ?controller=xxx 的QueryRouter,非router的Query参数请定义到
                          Request设置-&#62;Query
                        </p>
                      </div>
                    }
                  >
                    <QuestionCircleOutlined style={{ width: '10px' }} />
                  </Tooltip>
                </span>
              }
            >
              <InputGroup compact>
                <Select
                  value={this.state.method}
                  onChange={this.onChangeMethod}
                  style={{ width: '15%' }}
                >
                  {HTTP_METHOD_KEYS.map(item => {
                    return (
                      <Option key={item} value={item}>
                        {item}
                      </Option>
                    );
                  })}
                </Select>

                <Tooltip
                  title="接口基本路径，可在 项目设置 里修改"
                  style={{
                    display: this.props.basepath == '' ? 'block' : 'none'
                  }}
                >
                  <Input
                    disabled
                    value={this.props.basepath}
                    readOnly
                    onChange={() => {}}
                    style={{ width: '25%' }}
                  />
                </Tooltip>
                {getFieldDecorator('path', {
                  initialValue: this.state.path,
                  rules: [
                    {
                      required: true,
                      message: '请输入接口路径!'
                    }
                  ]
                })(
                  <Input onChange={this.handlePath} placeholder="/path" style={{ width: '60%' }} />
                )}
              </InputGroup>
              <Row className="interface-edit-item">
                <Col span={24} offset={0}>
                  {paramsList}
                </Col>
              </Row>
            </FormItem>
            <FormItem className="interface-edit-item" {...formItemLayout} label="Tag">
              {getFieldDecorator('tag', { initialValue: this.state.tag })(
                <Select placeholder="请选择 tag " mode="multiple">
                  {projectMsg.tag.map(item => {
                    return (
                      <Option value={item.name} key={item._id}>
                        {item.name}
                      </Option>
                    );
                  })}
                  <Option value="tag设置" disabled style={{ cursor: 'pointer', color: '#2395f1' }}>
                    <Button type="primary" onClick={this.props.onTagClick}>
                      Tag设置
                    </Button>
                  </Option>
                </Select>
              )}
            </FormItem>
            <FormItem className="interface-edit-item" {...formItemLayout} label="状态">
              {getFieldDecorator('status', { initialValue: this.state.status })(
                <Select>
                  <Option value="done">已发布</Option>
                  <Option value="design">设计中</Option>
                  <Option value="undone">开发中</Option>
                  <Option value="testing">已提测</Option>
                  <Option value="deprecated">已过时</Option>
                  <Option value="stoping">暂停开发</Option>
                </Select>
              )}
            </FormItem>
            <FormItem className="interface-edit-item" {...formItemLayout} label="负责人">
              {getFieldDecorator('owners', { initialValue: this.state.owners })(
                <MultiUserSelect />
              )}
            </FormItem>
            {custom_field.enable && (
              <FormItem
                className="interface-edit-item"
                {...formItemLayout}
                label={custom_field.name}
              >
                {getFieldDecorator('custom_field_value', {
                  initialValue: this.state.custom_field_value
                })(<Input placeholder="请输入" />)}
              </FormItem>
            )}
          </div>
          <Tooltip title ="jsonschema转换">      
            <Button type="primary"  onClick={this.jsontoSchemaModel}>JsonSchema转换</Button>
          </Tooltip>  
          <h2 className="interface-title">请求参数设置</h2>

          <div className="container-radiogroup">
            <RadioGroup
              value={this.state.req_radio_type}
              size="large"
              className="radioGroup"
              onChange={this.changeRadioGroup}
            >
              {HTTP_METHOD[this.state.method].request_body ? (
                <RadioButton value="req-body">Body</RadioButton>
              ) : null}
              <RadioButton value="req-query">Query</RadioButton>
              <RadioButton value="req-headers">Headers</RadioButton>
            </RadioGroup>
          </div>
          &nbsp;
          <Tooltip title ="修改参数后可同步用例参数">      
            <Button type="primary"  style={{ float: 'right'}} onClick={this.SyncModel}>同步用例</Button>
          </Tooltip>  
          <div className="panel-sub">
            <FormItem className={'interface-edit-item ' + this.state.hideTabs.req.query}>
              <Row justify="space-around" gutter={[16,16]}>
                <Col span={24}>
                  <Button size="small" type="primary" onClick={() => this.addParams('req_query')}>
                    添加Query参数
                  </Button>
                  <div className="bulk-import" onClick={() => this.showBulk('req_query')}>
                    批量添加
                  </div>
                </Col>
              </Row>
            </FormItem>

            <Row className={'interface-edit-item ' + this.state.hideTabs.req.query} gutter={[16,16]}>
              <Col span={24}>
                <EasyDragSort
                  data={() => this.props.form.getFieldValue('req_query')}
                  onChange={this.handleDragMove('req_query')}
                  onlyChild="easy_drag_sort_child"
                >
                  {QueryList}
                </EasyDragSort>
              </Col>
            </Row>

            <FormItem className={'interface-edit-item ' + this.state.hideTabs.req.headers}>
              <Tooltip
                title={
                  <React.Fragment>
                    若需返回值转 base64 请添加头 binary，值为所转格式类型例如：image/jpeg <br />
                    若需接口循环请求请添加头 Loopnum，结合 Timesleep 可以进行每次循环延时 <br />
                    若需二进制上传文件请添加头 ContentType:binary/octet-stream <br />
                    若想循环测试时跳过某条用例可通过请求头 Skip 判断
                  </React.Fragment>
                }
              >
                <Button size="small" type="primary" onClick={() => this.addParams('req_headers')}>
                  添加Header
                </Button>
              </Tooltip>
            </FormItem>

            <Row className={'interface-edit-item ' + this.state.hideTabs.req.headers} gutter={[16,16]}>
              <Col span={24}>
                <EasyDragSort
                  data={() => this.props.form.getFieldValue('req_headers')}
                  onChange={this.handleDragMove('req_headers')}
                  onlyChild="easy_drag_sort_child"
                >
                  {headerList}
                </EasyDragSort>
              </Col>
            </Row>
            {HTTP_METHOD[this.state.method].request_body ? (
              <div>
                <FormItem className={'interface-edit-item ' + this.state.hideTabs.req.body}>
                  {getFieldDecorator('req_body_type', {
                    initialValue: this.state.req_body_type
                  })(
                    <RadioGroup>
                      <Radio value="form">form</Radio>
                      <Radio value="json">json</Radio>
                      <Radio value="file">file</Radio>
                      <Radio value="raw">raw</Radio>
                    </RadioGroup>
                  )}
                </FormItem>

                <Row
                  className={
                    'interface-edit-item ' +
                    (this.props.form.getFieldValue('req_body_type') === 'form'
                      ? this.state.hideTabs.req.body
                      : 'hide')
                  }
                  gutter={[16, 16]}
                >
                  <Col style={{ minHeight: '50px' }} span={24}>
                    <Row type="flex" justify="space-around">
                      <Col span={12} className="interface-edit-item">
                        <Button
                          size="small"
                          type="primary"
                          onClick={() => this.addParams('req_body_form')}
                        >
                          添加form参数
                        </Button>
                      </Col>
                      <Col span={12}>
                        <div className="bulk-import" onClick={() => this.showBulk('req_body_form')}>
                          批量添加
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  <Col span={24}>
                    <EasyDragSort
                      data={() => this.props.form.getFieldValue('req_body_form')}
                      onChange={this.handleDragMove('req_body_form')}
                      onlyChild="easy_drag_sort_child"
                    >
                      {requestBodyList}
                    </EasyDragSort>
                  </Col>
                </Row>
              </div>
            ) : null}

            <Row
              className={
                'interface-edit-item ' +
                (this.props.form.getFieldValue('req_body_type') === 'json'
                  ? this.state.hideTabs.req.body
                  : 'hide')
              }
              gutter={[16, 16]}
            >
              <Col span={24}>
                <span>
                  JSON-SCHEMA:&nbsp;
                  {!projectMsg.is_json5 && (
                    <Tooltip title="项目 -> 设置 开启 json5">
                      <QuestionCircleOutlined />{' '}
                    </Tooltip>
                  )}
                </span>
                {getFieldDecorator('req_body_is_json_schema', {
                  valuePropName: 'checked',
                  initialValue: this.state.req_body_is_json_schema || !projectMsg.is_json5
                })(
                  <Switch
                    checkedChildren="开"
                    unCheckedChildren="关"
                    disabled={!projectMsg.is_json5}
                  />
                )}   
              </Col>
              <Col className="interface-edit-json-info" span={24}>
                {!this.props.form.getFieldValue('req_body_is_json_schema') ? (
                  <span>
                    基于 Json5, 参数描述信息用注释的方式实现{' '}
                    <Tooltip title={<pre>{Json5Example}</pre>}>
                      <QuestionCircleOutlined style={{ color: '#086dbf' }} />
                    </Tooltip>
                    “全局编辑”或 “退出全屏” 请按 F9
                  </span>
                ) : (
                  <ReqBodySchema
                    onChange={text => {
                      this.setState({
                        req_body_other: text
                      });

                      if (new Date().getTime() - this.startTime > 1000) {
                        EditFormContext.props.changeEditStatus(true);
                      }
                    }}
                    isMock={true}
                    data={req_body_other_use_schema_editor}
                  />
                )}
              </Col>
              <Col span={24}>
                {!this.props.form.getFieldValue('req_body_is_json_schema') && (
                  <AceEditor
                    className="interface-editor"
                    data={this.state.req_body_other}
                    onChange={this.handleReqBody}
                    fullScreen={true}
                  />
                )}
              </Col>
            </Row>

            {this.props.form.getFieldValue('req_body_type') === 'file' &&
            this.state.hideTabs.req.body !== 'hide' ? (
              <Row className="interface-edit-item" gutter={[16, 16]}>
                <Col className="interface-edit-item-other-body" span={24}>
                  {getFieldDecorator('req_body_other', {
                    initialValue: this.state.req_body_other
                  })(<TextArea placeholder="" autoSize={true} />)}
                </Col>
              </Row>
            ) : null}
            {this.props.form.getFieldValue('req_body_type') === 'raw' &&
            this.state.hideTabs.req.body !== 'hide' ? (
              <Row gutter={[16,16]}>
                <Col span={24}>
                  {getFieldDecorator('req_body_other', {
                    initialValue: this.state.req_body_other
                  })(<TextArea placeholder="" autoSize={{ minRows: 8 }} />)}
                </Col>
              </Row>
            ) : null}
          </div>

          {/* ----------- Response ------------- */}

          <h2 className="interface-title">
            返回数据设置&nbsp;
            {!projectMsg.is_json5 && (
              <Tooltip title="项目 -> 设置 开启 json5">
                <QuestionCircleOutlined className="tooltip" />{' '}
              </Tooltip>
            )}
            {getFieldDecorator('res_body_is_json_schema', {
              valuePropName: 'checked',
              initialValue: this.state.res_body_is_json_schema || !projectMsg.is_json5
            })(
              <Switch
                checkedChildren="json-schema"
                unCheckedChildren="json"
                disabled={!projectMsg.is_json5}
              />
            )}
          </h2>
          <div className="container-radiogroup">
            {getFieldDecorator('res_body_type', {
              initialValue: this.state.res_body_type
            })(
              <RadioGroup size="large" className="radioGroup">
                <RadioButton value="json">JSON</RadioButton>
                <RadioButton value="raw">RAW</RadioButton>
              </RadioGroup>
            )}
          </div>
          <div className="panel-sub">
            <Row
              className="interface-edit-item"
              style={{
                display:
                  this.props.form.getFieldValue('res_body_type') === 'json' ? 'block' : 'none'
              }}
            >
              <Col>
                <Tabs size="large" defaultActiveKey="tpl" onChange={this.handleJsonType}>
                  <TabPane tab="模板" key="tpl" />
                  <TabPane tab="预览" key="preview" />
                </Tabs>
                <div style={{ marginTop: '10px' }}>
                  {!this.props.form.getFieldValue('res_body_is_json_schema') ? (
                    <div style={{ padding: '10px 0', fontSize: '15px' }}>
                      <span>
                        基于 mockjs 和 json5,使用注释方式写参数说明{' '}
                        <Tooltip title={<pre>{Json5Example}</pre>}>
                          <QuestionCircleOutlined style={{ color: '#086dbf' }} />
                        </Tooltip>{' '}
                        ,具体使用方法请{' '}
                        <span
                          className="href"
                          onClick={() =>
                            window.open('https://yapi.ymfe.org/documents/mock.html', '_blank')
                          }
                        >
                          查看文档
                        </span>
                      </span>
                      ，“全局编辑”或 “退出全屏” 请按 <span style={{ fontWeight: '500' }}>F9</span>
                    </div>
                  ) : (
                    <div style={{ display: this.state.jsonType === 'tpl' ? 'block' : 'none' }}>
                      <ResBodySchema
                        onChange={text => {
                          this.setState({
                            res_body: text
                          });
                          if (new Date().getTime() - this.startTime > 1000) {
                            EditFormContext.props.changeEditStatus(true);
                          }
                        }}
                        isMock={true}
                        data={res_body_use_schema_editor}
                      />
                    </div>
                  )}
                  {!this.props.form.getFieldValue('res_body_is_json_schema') &&
                    this.state.jsonType === 'tpl' && (
                      <AceEditor
                        className="interface-editor"
                        data={this.state.res_body}
                        onChange={this.handleResBody}
                        ref={editor => (this.resBodyEditor = editor)}
                        fullScreen={true}
                      />
                    )}
                  <div
                    id="mock-preview"
                    style={{
                      backgroundColor: '#eee',
                      lineHeight: '20px',
                      minHeight: '300px',
                      display: this.state.jsonType === 'preview' ? 'block' : 'none'
                    }}
                  />
                </div>
              </Col>
            </Row>

            <Row
              className="interface-edit-item"
              style={{
                display: this.props.form.getFieldValue('res_body_type') === 'raw' ? 'block' : 'none'
              }}
            >
              <Col>
                {getFieldDecorator('res_body', {
                  initialValue: this.state.res_body
                })(<TextArea style={{ minHeight: '150px' }} placeholder="" />)}
              </Col>
            </Row>
          </div>

          {/* ----------- remark ------------- */}

          <h2 className="interface-title">备 注</h2>
          <div className="panel-sub">
            <FormItem className={'interface-edit-item'}>
              <div>
                <div id="desc" style={{ lineHeight: '20px' }} className="remark-editor" />
              </div>
            </FormItem>
          </div>

          {/* ----------- email ------------- */}
          <h2 className="interface-title">其 他</h2>
          <div className="panel-sub">
            <FormItem
              className={'interface-edit-item'}
              {...formItemLayout}
              label={
                <span>
                  邮件通知&nbsp;
                  <Tooltip title={'开启邮件通知，可在 项目设置 里修改'}>
                    <QuestionCircleOutlined style={{ width: '10px' }} />
                  </Tooltip>
                </span>
              }
            >
              {getFieldDecorator('switch_notice', {
                valuePropName: 'checked',
                initialValue: this.props.noticed
              })(<Switch checkedChildren="开" unCheckedChildren="关" />)}
            </FormItem>
            <FormItem
              className={'interface-edit-item'}
              {...formItemLayout}
              label={
                <span>
                  开放接口&nbsp;
                  <Tooltip title={'用户可以在 数据导出 时选择只导出公开接口'}>
                    <QuestionCircleOutlined style={{ width: '10px' }} />
                  </Tooltip>
                </span>
              }
            >
              {getFieldDecorator('api_opened', {
                valuePropName: 'checked',
                initialValue: this.state.api_opened
              })(<Switch checkedChildren="开" unCheckedChildren="关" />)}
            </FormItem>
          </div>

          <FormItem
            className="interface-edit-item"
            style={{ textAlign: 'center', marginTop: '16px' }}
          >
            {/* <Button type="primary" htmlType="submit">保存1</Button> */}
            <Affix offsetBottom={0}>
              <Button
                className="interface-edit-submit-button"
                disabled={this.state.submitStatus}
                size="large"
                htmlType="submit"
              >
                保存
              </Button>
            </Affix>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Form.create({
  onValuesChange() {
    EditFormContext.props.changeEditStatus(true);
  }
})(InterfaceEditForm);
