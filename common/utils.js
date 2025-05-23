const Mock = require('mockjs');
const filter = require('./power-string.js').filter;
const stringUtils = require('./power-string.js').utils;
const json5 = require('json5');
const Ajv = require('ajv');
/**
 * 作用：解析规则串 key ，然后根据规则串的规则以及路径找到在 json 中对应的数据
 * 规则串：$.{key}.{body||params}.{dataPath} 其中 body 为返回数据，params 为请求数据，datapath 为数据的路径
 * 数组：$.key.body.data.arr[0]._id  (获取 key 所指向请求的返回数据的 arr 数组的第 0 项元素的 _id 属性)
 * 对象：$.key.body.data.obj._id ((获取 key 所指向请求的返回数据的 obj 对象的 _id 属性))
 *
 * @param String key 规则串
 * @param Object json 数据
 * @returns
 */
function simpleJsonPathParse(key, json) {
  if (!key || typeof key !== 'string' || key.indexOf('$.') !== 0 || key.length <= 2) {
    return null;
  }
  let keys = key.substr(2).split('.');
  keys = keys.filter(item => {
    return item;
  });
  for (let i = 0, l = keys.length; i < l; i++) {
    try {
      let m = keys[i].match(/(.*?)\[([0-9]+)\]/);
      if (m) {
        json = json[m[1]][m[2]];
      } else {
        json = json[keys[i]];
      }
    } catch (e) {
      json = '';
      break;
    }
  }

  return json;
}

// 全局变量 {{ global.value }}
// value 是在环境变量中定义的字段
function handleGlobalWord(word, json) {
  if (!word || typeof word !== 'string' || word.indexOf('global.') !== 0) return word;
  let keys = word.split('.');
  keys = keys.filter(item => {
    return item;
  });
  return json[keys[0]][keys[1]] || word;
}

function handleMockWord(word) {
  if (!word || typeof word !== 'string' || word[0] !== '@') return word;
  return Mock.mock(word);
}

/**
 *
 * @param {*} data
 * @param {*} handleValueFn 处理参数值函数
 */
function handleJson(data, handleValueFn) {
  if (!data) {
    return data;
  }
  if (typeof data === 'string') {
    return handleValueFn(data);
  } else if (typeof data === 'object') {
    for (let i in data) {
      data[i] = handleJson(data[i], handleValueFn);
    }
  } else {
    return data;
  }
  return data;
}

function handleValueWithFilter(context) {
  return function(match) {
    if (match[0] === '@') {
      return handleMockWord(match);
    } else if (match.indexOf('$.') === 0) {
      return simpleJsonPathParse(match, context);
    } else if (match.indexOf('global.') === 0) {
      return handleGlobalWord(match, context);
    } else {
      return match;
    }
  };
}

function handleFilter(str, match, context) {
  match = match.trim();
  try {
    let a = filter(match, handleValueWithFilter(context));

    return a;
  } catch (err) {
    return str;
  }
}

function handleParamsValue(val, context = {}) {
  const variableRegexp = /\{\{\s*([^}]+?)\}\}/g;
  if (!val || typeof val !== 'string') {
    return val;
  }
  // val = val.trim(); //需要保留空格进行一些测试

  // 检查是否完全匹配 {{...}}
  const match = val.match(/^\{\{([^\}]+)\}\}$/);
  if (match) {
    return handleFilter(val, match[1], context);
  }

  // 检查是否以 @ 或 $ 开头
  if (val[0] === '@' || val[0] === '$') {
    return handleFilter(val, val, context);
  }

  // 替换所有 {{...}} 变量
  return val.replace(variableRegexp, (str, match) => {
    return handleFilter(str, match, context);
  });
}

exports.handleJson = handleJson;
exports.handleParamsValue = handleParamsValue;

exports.simpleJsonPathParse = simpleJsonPathParse;
exports.handleMockWord = handleMockWord;
//转换谷歌日志查询url
function buildGCPLogsURL(url,params) {
  const baseUrl = url;

  // 取出 query 字段
  const queryPart = encodeURIComponent(params.query).replace(/%0A/g, "\n"); // 保留换行

  // 其余参数转换为查询字符串
  const queryParams = { ...params };
  delete queryParams.query; // query 需要特殊处理

  const searchParams = new URLSearchParams(queryParams).toString();
  return `${baseUrl};query=${queryPart};storageScope=${params.storageScope};cursorTimestamp=${params.cursorTimestamp};startTime=${params.startTime};endTime=${params.endTime}?${searchParams}`;
}
exports.buildGCPLogsURL = buildGCPLogsURL;
//时间戳转ISO 8601 纳秒级 UTC 时间格式
function formatTimestamp(timestamp) {
  const date = new Date(timestamp);

  return date.toISOString(); // 自动转换为 YYYY-MM-DDTHH:mm:ss.SSSZ 格式
}
exports.formatTimestamp = formatTimestamp;
exports.joinPath = (domain, joinPath) => {
  let l;
  if(domain){
    l = domain.length;
    if (domain[l - 1] === '/') {
      domain = domain.substr(0, l - 1);
    }
    if (joinPath[0] !== '/') {
      joinPath = joinPath.substr(1);
    }
  }
  return domain + joinPath;
};
/**
 * 对象转url参数
 * @param {*} data
 * @param {*} isPrefix
 */
exports.queryParams=function (data, isPrefix){
  isPrefix = isPrefix ? isPrefix : false
  let prefix = isPrefix ? '?' : ''
  let _result = []
  for (let key in data) {
    let value = data[key]
    // 去掉为空的参数
    if (['', undefined, null].includes(value)) {
      continue
    }
    if (value.constructor === Array) {
      value.forEach(_value => {
        _result.push(key + '[]=' + _value)
      })
    } else {
      _result.push(key + '=' + value)
    }
  }

  return _result.length ? prefix + _result.join('&') : ''
}

// exports.safeArray = arr => {
//   return Array.isArray(arr) ? arr : [];
// };
function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}
exports.safeArray = safeArray;

exports.isJson5 = function isJson5(json) {
  if (!json) return false;
  try {
    json = json5.parse(json);
    return json;
  } catch (e) {
    return false;
  }
};

function isJson(json) {
  if (!json) return false;
  try {
    json = JSON.parse(json);
    return json;
  } catch (e) {
    return false;
  }
}

exports.isJson = isJson;

exports.unbase64 = function(base64Str) {
    try {
      return stringUtils.unbase64(base64Str);
    } catch (err) {
      return base64Str;
    }
  };

exports.json_parse = function(json) {
  try {
    return JSON.parse(json);
  } catch (err) {
    return json;
  }
};

exports.json_format = function(json) {
  try {
    return JSON.stringify(JSON.parse(json), null, '   ');
  } catch (e) {
    return json;
  }
};

exports.ArrayToObject = function(arr) {
  let obj = {};
  safeArray(arr).forEach(item => {
    obj[item.name] = item.value;
  });

  return obj;
};

exports.timeago = function(timestamp) {
  let minutes, hours, days, seconds, mouth, year;
  const timeNow = parseInt(new Date().getTime() / 1000);
  seconds = timeNow - timestamp;
  if (seconds > 86400 * 30 * 12) {
    year = parseInt(seconds / (86400 * 30 * 12));
  } else {
    year = 0;
  }
  if (seconds > 86400 * 30) {
    mouth = parseInt(seconds / (86400 * 30));
  } else {
    mouth = 0;
  }
  if (seconds > 86400) {
    days = parseInt(seconds / 86400);
  } else {
    days = 0;
  }
  if (seconds > 3600) {
    hours = parseInt(seconds / 3600);
  } else {
    hours = 0;
  }
  minutes = parseInt(seconds / 60);
  if (year > 0) {
    return year + '年前';
  } else if (mouth > 0 && year <= 0) {
    return mouth + '月前';
  } else if (days > 0 && mouth <= 0) {
    return days + '天前';
  } else if (days <= 0 && hours > 0) {
    return hours + '小时前';
  } else if (hours <= 0 && minutes > 0) {
    return minutes + '分钟前';
  } else if (minutes <= 0 && seconds > 0) {
    if (seconds < 30) {
      return '刚刚';
    } else {
      return seconds + '秒前';
    }
  } else {
    return '刚刚';
  }
};

// json schema 验证器
exports.schemaValidator = function(schema, params) {
  try {
    const ajv = new Ajv({
      format: false,
      meta: false
    });
    let metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');
    ajv.addMetaSchema(metaSchema);
    ajv._opts.defaultMeta = metaSchema.id;
    ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';
    var localize = require('ajv-i18n');

    schema = schema || {
      type: 'object',
      title: 'empty object',
      properties: {}
    };
    const validate = ajv.compile(schema);
    let valid = validate(params);

    let message = '';
    if (!valid) {
      localize.zh(validate.errors);
      message += ajv.errorsText(validate.errors, { separator: '\n' });
    }

    return {
      valid: valid,
      message: message
    };
  } catch (e) {
    return {
      valid: false,
      message: e.message
    };
  }
};

exports.findStorageKeysFromScript = (s= "") => {
  const keys = [];
  const re = /storage\.setItem\((.+?),(.+?)\)/g;
  let m;
  do {
    m = re.exec(s);
    if (m) {
      let matchKey = m[1].replace(/['"]/ig, '');
      keys.push(matchKey);
    }
  } while (m);
  return keys;
}
