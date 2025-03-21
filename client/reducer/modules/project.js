import axios from 'axios';
import variable from '../../constants/variable';
import { setGlobalScript } from '../../../common/postmanLib';
import {htmlFilter} from '../../common';

// Actions
const FETCH_PROJECT_LIST = 'yapi/project/FETCH_PROJECT_LIST';
const PROJECT_ADD = 'yapi/project/PROJECT_ADD';
const PROJECT_DEL = 'yapi/project/PROJECT_DEL';
// const CHANGE_TABLE_LOADING = 'yapi/project/CHANGE_TABLE_LOADING';
const PROJECT_UPDATE = 'yapi/project/PROJECT_UPDATE';
const PROJECT_UPDATE_ENV = 'yapi/project/PROJECT_UPDATE_ENV';
const PROJECT_UPSET = 'yapi/project/PROJECT_UPSET';
const GET_CURR_PROJECT = 'yapi/project/GET_CURR_PROJECT';
const GET_PEOJECT_MEMBER = 'yapi/project/GET_PEOJECT_MEMBER';
const ADD_PROJECT_MEMBER = 'yapi/project/ADD_PROJECT_MEMBER';
const DEL_PROJECT_MEMBER = 'yapi/project/DEL_PROJECT_MEMBER';
const CHANGE_PROJECT_MEMBER = 'yapi/project/CHANGE_PROJECT_MEMBER';
const GET_TOKEN = 'yapi/project/GET_TOKEN';
const UPDATE_TOKEN = 'yapi/project/UPDATE_TOKEN';
const CHECK_PROJECT_NAME = 'yapi/project/CHECK_PROJECT_NAME';
const COPY_PROJECT_MSG = 'yapi/project/COPY_PROJECT_MSG';
const PROJECT_GET_ENV = 'yapi/project/PROJECT_GET_ENV';
const CHANGE_MEMBER_EMAIL_NOTICE = 'yapi/project/CHANGE_MEMBER_EMAIL_NOTICE';
const GET_SWAGGER_URL_DATA = 'yapi/project/GET_SWAGGER_URL_DATA';
const GET_PROJECT_COL = 'yapi/project/GET_PROJECT_COL';
const GET_PROJECT_CASE = 'yapi/project/GET_PROJECT_CASE';
const GET_FAIL_COL = 'yapi/project/GET_FAIL_COL';
const GET_FAIL_CASE = 'yapi/project/GET_FAIL_CASE';
const SET_FIREBASE_APP = 'yapi/project/SET_FIREBASE_APP';
const GET_PROJECT_CASELIBVERSIONS = 'yapi/project/GET_PROJECT_CASELIBVERSIONS';
const GET_PROJECT_DEMANDS = 'yapi/project/GET_PROJECT_DEMANDS'
// Reducer
const initialState = {
  isUpdateModalShow: false,
  handleUpdateIndex: -1,
  projectList: [],
  projectMsg: {},
  userInfo: {},
  tableLoading: true,
  total: 0,
  currPage: 1,
  token: '',
  currProject: {},
  projectEnv: {
    env: [
      {
        header: []
      }
    ]
  },
  swaggerUrlData: '',
  colstats:{},
  casestats:{},
  failcol:[],
  failcase:[],
  demandlist:[],
  caselibverisons:[],
  firebaseApp:null
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_FIREBASE_APP:{
      return {
        ...state,
        firebaseApp: action.payload
      };
    }
    case GET_FAIL_COL:{
      return {
        ...state,
        failcol: action.payload.data.data
      };
    }
    case GET_FAIL_CASE:{
      return {
        ...state,
        failcase: action.payload.data.data
      };
    }
    case GET_PROJECT_CASE:{
      return {
        ...state,
        casestats: action.payload.data.data
      };
    }
    case GET_PROJECT_COL:{
      return {
        ...state,
        colstats: action.payload.data.data
      };
    }
    case GET_CURR_PROJECT: {
      return {
        ...state,
        currProject: action.payload.data.data
      };
    }
    case GET_PROJECT_DEMANDS:{
      return {
        ...state,
        demandlist: action.payload.data.data
      };
    }
    case GET_PROJECT_CASELIBVERSIONS:{
      return {
        ...state,
        caselibverisons: action.payload.data.data
      };
    }
    case FETCH_PROJECT_LIST: {
      return {
        ...state,
        projectList: action.payload.data.data.list,
        total: action.payload.data.data.total,
        userInfo: action.payload.data.data.userinfo
      };
    }

    case PROJECT_ADD: {
      return state;
    }
    case PROJECT_DEL: {
      return state;
    }

    case GET_TOKEN: {
      return {
        ...state,
        token: action.payload.data.data
      };
    }

    case PROJECT_GET_ENV: {
      return {
        ...state,
        projectEnv: action.payload.data.data
      };
    }
    case UPDATE_TOKEN: {
      return {
        ...state,
        token: action.payload.data.data.token
      };
    }

    case CHECK_PROJECT_NAME: {
      return {
        ...state
      };
    }
    case COPY_PROJECT_MSG: {
      return {
        ...state
      };
    }

    case GET_SWAGGER_URL_DATA: {
      return {
        ...state,
        swaggerUrlData: action.payload.data.data
      }
    }
    default:
      return state;
  }
};

export function setFirebaseApp (app) {
  return{
    type: SET_FIREBASE_APP,
    payload: app
  }
}

// 获取某分组下的项目列表
export function fetchProjectList(id, pageNum) {
  return {
    type: FETCH_PROJECT_LIST,
    payload: axios.get('/api/project/list', {
      params: {
        group_id: id,
        page: pageNum || 1,
        limit: variable.PAGE_LIMIT
      }
    })
  };
}

// 复制项目
export function copyProjectMsg(params) {
  return {
    type: COPY_PROJECT_MSG,
    payload: axios.post('/api/project/copy', params)
  };
}
// 获取项目需求集
export function getdemands(project_id) {
  return {
    type: GET_PROJECT_DEMANDS,
    payload: axios.get('/api/demand/getdemand', {
      params: {
        project_id: project_id
      }
    })
  };
}
// 获取项目用例库版本集
export function getcaseliversions(project_id) {
  return {
    type: GET_PROJECT_CASELIBVERSIONS,
    payload: axios.get('/api/caselib/getversion', {
      params: {
        project_id: project_id
      }
    })
  };
}
// 获取项目集合统计
export function getcolcasestats(project_id) {
  return {
    type: GET_PROJECT_COL,
    payload: axios.get('/api/project/colstats', {
      params: {
        project_id: project_id
      }
    })
  };
}
// 获取项目失败集合
export function getfailcol(project_id) {
  return {
    type: GET_FAIL_COL,
    payload: axios.get('/api/project/failcol', {
      params: {
        project_id: project_id
      }
    })
  };
}
// 获取项目用例库统计
export function getcasestats(project_id,demandid,version) {
  return {
    type: GET_PROJECT_COL,
    payload: axios.post('/api/project/casestats', {
      project_id: project_id,
      demandid:demandid,
      version:version
    })
  };
}
// 获取项目失败用例
export function getfailcase(project_id,demandid,version) {
  return {
    type: GET_FAIL_CASE,
    payload: axios.post('/api/project/failcase', {
      project_id: project_id,
      demandid:demandid,
      version:version
    })
  };
}
// 添加项目成员
export function addMember(param) {
  return {
    type: ADD_PROJECT_MEMBER,
    payload: axios.post('/api/project/add_member', param)
  };
}

// 删除项目成员
export function delMember(param) {
  return {
    type: DEL_PROJECT_MEMBER,
    payload: axios.post('/api/project/del_member', param)
  };
}

// 修改项目成员权限
export function changeMemberRole(param) {
  return {
    type: CHANGE_PROJECT_MEMBER,
    payload: axios.post('/api/project/change_member_role', param)
  };
}
// 修改项目成员是否收到邮件通知
export function changeMemberEmailNotice(param) {
  return {
    type: CHANGE_MEMBER_EMAIL_NOTICE,
    payload: axios.post('/api/project/change_member_email_notice', param)
  };
}

// 获取项目成员列表
export function getProjectMemberList(id) {
  return {
    type: GET_PEOJECT_MEMBER,
    payload: axios.get('/api/project/get_member_list', {
      params: { id }
    })
  };
}

// export function changeTableLoading(data) {
//   return {
//     type: CHANGE_TABLE_LOADING,
//     payload: data
//   };
// }

export function addProject(data) {
  let {
    name,
    prd_host,
    basepath,
    desc,
    group_id,
    group_name,
    protocol,
    icon,
    color,
    project_type
  } = data;

  // 过滤项目名称中有html标签存在的情况
  name = htmlFilter(name);
  const param = {
    name,
    prd_host,
    protocol,
    basepath,
    desc,
    group_id,
    group_name,
    icon,
    color,
    project_type
  };
  return {
    type: PROJECT_ADD,
    payload: axios.post('/api/project/add', param)
  };
}

// 修改项目
export function updateProject(data) {
  let { name, project_type, basepath, desc, _id, env, group_id, switch_notice, strice, is_json5, tag } = data;

  // 过滤项目名称中有html标签存在的情况
  name = htmlFilter(name);
  const param = {
    name,
    project_type,
    basepath,
    switch_notice,
    desc,
    id: _id,
    env,
    group_id,
    strice,
    is_json5,
    tag
  };
  return {
    type: PROJECT_UPDATE,
    payload: axios.post('/api/project/up', param)
  };
}

// 修改项目脚本
export function updateProjectScript(data) {
  return {
    type: PROJECT_UPDATE,
    payload: axios.post('/api/project/up', data)
  };
}

// 修改全局mock
export function updateProjectMock(data) {
  return {
    type: PROJECT_UPDATE,
    payload: axios.post('/api/project/up', data)
  };
}

// 修改项目环境配置
export function updateEnv(data) {
  const { env, _id } = data;
  const param = {
    id: _id,
    env
  };
  return {
    type: PROJECT_UPDATE_ENV,
    payload: axios.post('/api/project/up_env', param)
  };
}

// 获取项目环境配置
export async function getEnv(project_id, axiosOption = {}) {
  try {
    const result = await axios.get('/api/project/get_env', { params: { project_id }, ...axiosOption });
    return {
      type: PROJECT_GET_ENV,
      payload: result
    };
  } catch (e) {
    if (axios.isCancel(e)) {
      return {
        type: '',
        payload: e
      };
    } else {
      throw e;
    }
  }
}

// 修改项目头像
export function upsetProject(param) {
  return {
    type: PROJECT_UPSET,
    payload: axios.post('/api/project/upset', param)
  };
}

// 删除项目
export function delProject(id) {
  const param = { id };
  return {
    type: PROJECT_DEL,
    payload: axios.post('/api/project/del', param)
  };
}

export async function getProject(id) {
  let result = await axios.get('/api/project/get?id=' + id);
  if(result.data.errcode==0){
    setGlobalScript(id,result.data.data.global_script);
  }
  return {
    type: GET_CURR_PROJECT,
    payload: result
  };
}

export async function getToken(project_id, axiosOption = {}) {
  try {
    const result = await axios.get('/api/project/token', {
      params: { project_id },
      ...axiosOption
    });
    return {
      type: GET_TOKEN,
      payload: result
    };
  } catch (e) {
    if (axios.isCancel(e)) {
      return {
        type: '',
        payload: e
      };
    } else {
      throw e;
    }
  }
}

export async function updateToken(project_id) {
  return {
    type: UPDATE_TOKEN,
    payload: axios.get('/api/project/update_token', {
      params: { project_id }
    })
  };
}

export async function checkProjectName(name, group_id) {
  return {
    type: CHECK_PROJECT_NAME,
    payload: axios.get('/api/project/check_project_name', {
      params: { name, group_id }
    })
  };
}

export async function handleSwaggerUrlData(url) {
  return {
    type: GET_SWAGGER_URL_DATA,
    payload: axios.get('/api/project/swagger_url?url='+encodeURI(encodeURI(url)))
  };
}
