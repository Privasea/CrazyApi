module.exports = function (uid, projectId,interfaceId) {
  if(!uid || !projectId || !interfaceId){
    console.error('uid projectId interfaceId 不能为空', uid, projectId,interfaceId)
  }

  /**
   * 统一转换为number
   */
  return {
    yapi_uid: +uid,
    yapi_projectId: +projectId,
    yapi_interfaceId: +interfaceId
  }
}