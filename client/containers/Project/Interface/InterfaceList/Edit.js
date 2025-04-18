import React, { PureComponent as Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import InterfaceEditForm from './InterfaceEditForm.js';
import {
  updateInterfaceData,
  fetchInterfaceListMenu,
  fetchInterfaceData
} from '../../../../reducer/modules/interface.js';
import { getProject } from '../../../../reducer/modules/project.js';
import axios from 'axios';
import { message, Modal } from 'antd';
import './Edit.scss';
import { withRouter, Link } from 'react-router-dom';
import ProjectTag from '../../Setting/ProjectMessage/ProjectTag.js';

@connect(
  state => {
    return {
      curdata: state.inter.curdata,
      currProject: state.project.currProject
    };
  },
  {
    updateInterfaceData,
    fetchInterfaceListMenu,
    fetchInterfaceData,
    getProject
  }
)
class InterfaceEdit extends Component {
  static propTypes = {
    curdata: PropTypes.object,
    currProject: PropTypes.object,
    updateInterfaceData: PropTypes.func,
    fetchInterfaceListMenu: PropTypes.func,
    fetchInterfaceData: PropTypes.func,
    match: PropTypes.object,
    switchToView: PropTypes.func,
    getProject: PropTypes.func
  };

  constructor(props) {
    super(props);
    const { curdata, currProject } = this.props;
    this.state = {
      mockUrl:
        location.protocol +
        '//' +
        location.hostname +
        (location.port !== '' ? ':' + location.port : '') +
        `/mock/${currProject._id}${currProject.basepath}${curdata.path}`,
      curdata: {},
      status: 0,
      visible: false
      // tag: []
    };
  }

  onSubmit = async params => {
    params.id = this.props.match.params.actionId;
    let result = await axios.post('/api/interface/up', params);
    this.props.fetchInterfaceListMenu(this.props.currProject._id).then();
    this.props.fetchInterfaceData(params.id).then();
    if (result.data.errcode === 0) {
      this.props.updateInterfaceData(params);
      message.success('保存成功');
    } else {
      message.error(result.data.errmsg);
    }
  };
  //组件即将销毁时触发
  componentWillUnmount() {
    try {
      //如果当前组件时编辑状态，销毁时断开连接状态置为0
      if (this.state.status === 1) {
        //关闭连接
        this.WebSocket.close();
      }
    } catch (e) {
      return null;
    }
  }

  componentDidMount() {
    let domain = location.hostname + (location.port !== '' ? ':' + location.port : '');
    let s,
      initData = false;
    //因后端 node 仅支持 ws， 暂不支持 wss
    let wsProtocol = location.protocol === 'https:' ? 'wss' : 'ws';

    setTimeout(() => {
      if (initData === false) {
        this.setState({
          curdata: this.props.curdata,
          status: 1
        });
        initData = true;
      }
    }, 3000);
    //客户端websocket连接逻辑
    try {
      //打开一个web socket连接
      s = new WebSocket(
        wsProtocol +
          '://' +
          domain +
          '/api/interface/solve_conflict?id=' +
          this.props.match.params.actionId
      );
      //onopen时客户端与服务端建立连接后触发
      s.onopen = () => {
        this.WebSocket = s;
        //使用send方法发送数据，连接时发送
        // this.WebSocket.send("我是客户端");
      };
      //接受消息，获取当前状态。可以一直监听
      s.onmessage = e => {
        initData = true;
        let result = JSON.parse(e.data);
        if (result.errno === 0) {
          this.setState({
            curdata: result.data,
            status: 1
          });
        } else {
          this.setState({
            curdata: result.data,
            status: 2
          });
        }
      };

      s.onerror = () => {
        this.setState({
          curdata: this.props.curdata,
          status: 1
        });
        console.warn('websocket 连接失败，将导致多人编辑同一个接口冲突。');
      };
    } catch (e) {
      this.setState({
        curdata: this.props.curdata,
        status: 1
      });
      console.error('websocket 连接失败，将导致多人编辑同一个接口冲突。');
    }
  }

  onTagClick = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = async () => {
    let { tag } = this.tag.state;
    tag = tag.filter(val => {
      return val.name !== '';
    });

    let id = this.props.currProject._id;
    let params = {
      id,
      tag
    };
    let result = await axios.post('/api/project/up_tag', params);

    if (result.data.errcode === 0) {
      await this.props.getProject(id);
      message.success('保存成功');
    } else {
      message.error(result.data.errmsg);
    }

    this.setState({
      visible: false
    });
  };

  handleCancel = () => {
    this.setState({
      visible: false
    });
  };

  tagSubmit = tagRef => {
    this.tag = tagRef;

    // this.setState({tag})
  };

  render() {
    const { cat, basepath, switch_notice, tag } = this.props.currProject;
    return (
      <div className="interface-edit">
        {this.state.status === 1 ? (
          <InterfaceEditForm
            cat={cat}
            mockUrl={this.state.mockUrl}
            basepath={basepath}
            noticed={switch_notice}
            onSubmit={this.onSubmit}
            curdata={this.state.curdata}
            onTagClick={this.onTagClick}
          />
        ) : null}
        {this.state.status === 2 ? (
          <div style={{ textAlign: 'center', fontSize: '14px', paddingTop: '10px' }}>
            <Link to={'/user/profile/' + this.state.curdata.uid}>
              <b>{this.state.curdata.username}</b>
            </Link>
            <span>正在编辑该接口，请稍后再试...</span>
          </div>
        ) : null}
        {this.state.status === 0 && '正在加载，请耐心等待...'}

        <Modal
          title="Tag 设置"
          width={680}
          open={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          okText="保存"
        >
          <div className="tag-modal-center">
            <ProjectTag tagMsg={tag} ref={this.tagSubmit} />
          </div>
        </Modal>
      </div>
    );
  }
}

export default withRouter(InterfaceEdit);
