import request from 'request'
import { getLogger } from './logger'
import fs from 'fs'
import path from 'path'
import { IOrchestratorApi } from '.'

const logger = getLogger('main')
const httpLogger = getLogger('httpLogger')

class BaseError extends Error {
  constructor(e?: string) {
    super(e)
    this.name = new.target.name
    // 下記の行はTypeScriptの出力ターゲットがES2015より古い場合(ES3, ES5)のみ必要
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

export class NetworkAccessError extends BaseError {
  constructor(public statusCode: number, public body: any, e?: string) {
    super(e)
  }
}

export const getData = (config: any, accessToken: string, apiPath: string): Promise<any> => {
  const option = createOption(config, accessToken, apiPath)
  return createStrPromise(Object.assign(option, { method: 'GET' }))
}

export const getArray = (
  config: any,
  accessToken: string,
  apiPath: string,
  queries?: any,
  isOdata: boolean = true,
): Promise<Array<any>> => {
  let optionTmp = createOption(config, accessToken, apiPath)
  optionTmp = Object.assign(optionTmp, { method: 'GET' })

  let option = optionTmp
  if (queries) {
    option = Object.assign(optionTmp, { qs: queries })
  }
  return createArrayPromise(option, isOdata)
}

export const postData = (config: any, accessToken: string, apiPath: string, obj: any): Promise<any> => {
  const option = createOption(config, accessToken, apiPath)
  return createJSONPromise(
    Object.assign(option, {
      method: 'POST',
      json: obj,
    }),
  )
}

export const uploadData = async (
  config: any,
  accessToken: string,
  apiPath: string,
  fullPath: string,
  isOdata: boolean = true,
): Promise<any> => {
  const option = createOption(config, accessToken, apiPath, 'multipart/form-data')

  const p: Promise<any> = new Promise((resolve, reject) => {
    fs.readFile(fullPath, (err, data_) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data_)
      return
    })
  })

  const data = await p
  return createArrayPromise(
    Object.assign({}, option, {
      method: 'POST',
      multipart: [
        {
          'Content-Disposition': `form-data; name="uploads[]"; filename="${path.basename(fullPath)}"`,
          'Content-Type': 'application/octet-stream',
          'Content-Length': data.length,
          body: data,
        },
      ],
    }),
    isOdata,
  )
}

export const downloadData = (
  config: any,
  accessToken: string,
  apiPath: string,
  id: string,
  version: string,
): Promise<any> => {
  const option = createOption(config, accessToken, apiPath)
  option.headers['Accept'] = 'application/octet-stream'
  return createDownloadPromise(
    Object.assign({}, option, {
      method: 'GET',
      encoding: null,
    }),
    id,
    version,
  )
}

export const putData = (config: any, accessToken: string, apiPath: string, obj: any): Promise<any> => {
  const option = createOption(config, accessToken, apiPath)
  return createJSONPromise(
    Object.assign(option, {
      method: 'PUT',
      json: obj,
    }),
  )
}

export const deleteData = (config: any, accessToken: string, apiPath: string): Promise<any> => {
  const option = createOption(config, accessToken, apiPath)
  return createJSONPromise(
    Object.assign(option, {
      method: 'DELETE',
    }),
  )
}

/**
 * 「APIのReturn値のvalueが配列であると見なしてvalueを配列で返すPromise」を返す
 * @param option
 * @param isOdata  stat系APIは、OData形式ではなく、どうもただの配列で返ってくるので、valueプロパティを返すかそのまま返すかの判定フラグに使う
 */
const createArrayPromise = (option: any, isOdata: boolean): Promise<Array<any>> => {
  // promiseを返す処理は毎回おなじ。Request処理して、コールバックで値を設定するPromiseを作って返すところを共通化
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(option, function (err: any, response: any, body: string) {
      if (err) {
        reject(err)
        return
      }
      httpLogger.debug({ objects: option })
      logger.info(`method: ${option.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
        logger.error(body)
        reject(new NetworkAccessError(response.statusCode, body))
        return 
      }
      logger.debug(body)
      const obj = JSON.parse(body)
      if (isOdata) {
        resolve(obj.value) // valueプロパティが配列である場合。
      } else {
        resolve(obj) // objがそのまま配列であるばあい。
      }
    })
  })
  return promise
}

/**
 * 「APIのReturn値をそのまま返すPromise」を返す
 * @param option
 */
const createStrPromise = (option: any): Promise<Array<any>> => {
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(option, function (err: any, response: any, body: string) {
      if (err) {
        reject(err)
        return
      }
      httpLogger.debug({ objects: option })
      logger.info(`method: ${option.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
        logger.error(body)
        reject(new NetworkAccessError(response.statusCode, body))
      }
      if (body === null || body === '') {
        resolve()
        return
      }
      const obj = JSON.parse(body)
      // エラーがあった場合
      if (obj.errorCode || obj.errorCode === 0) {
        //errorCodeが数値のゼロの時があった
        reject(obj)
        return
      }
      resolve(obj)
      return
    })
  })
  return promise
}

/**
 * 「APIのReturn値をそのまま返すPromise」を返す
 * @param option
 */
const createJSONPromise = (option: any): Promise<Array<any>> => {
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(option, function (err: any, response: any, body: any) {
      if (err) {
        reject(err)
        return
      }
      httpLogger.debug({ objects: option })
      logger.info(`method: ${option.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
        logger.error(body)
        reject(new NetworkAccessError(response.statusCode, body))
      }

      // PUTのばあい、StatusCodeが200で、Bodyが空のためundefinedになったが正常終了させる。
      if (response.statusCode === 200 && !body) {
        resolve()
        return
      }
      // POSTでなげて204(当然Body部が空文字)が返ってきたとき、bodyがundefinedになった   ←この件の対応をいれた if(body...)
      // DELETEでなげて204(戻り電文はPOSTと同じ空) が返ったときは、bodyは''になった
      // つまり同じ空電文でも、POST/DELETEで、requestライブラリのbodyの値は異なるということだ
      if (body && (body.errorCode || body.errorCode === 0)) {
        // エラーがあった場合
        //errorCodeが数値のゼロの時があった
        reject(body)
        return
      }
      resolve(body)
      return
    })
  })
  return promise
}

const createDownloadPromise = (option: any, id: string, version: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    request(option, (err: any, response: any, body: any) => {
      if (err) {
        reject(err)
        return
      }
      httpLogger.debug({ objects: option })
      logger.info(`method: ${option.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
        logger.error(body)
        reject(new NetworkAccessError(response.statusCode, body))
      }
      if (response.statusCode === 200) {
        fs.writeFileSync(`${id}.${version}.nupkg`, body, 'binary')
        resolve()
      } else {
        reject(err)
      }
    })
  })
}

const createOption = (
  config: any,
  accessToken: string,
  apiPath: string,
  contentType: string = 'application/json',
): any => {
  const option = {
    // uri: url.resolve(servername, apiPath),
    uri: config.serverinfo.servername + apiPath,
    headers: headers(config, accessToken, contentType),
  }
  return addAdditionalOption(config, option)
}

export const createEnterpriseOption = (config: any): any => {
  const option_tmp = {
    uri: config.serverinfo.servername + '/api/Account/Authenticate',
    headers: {
      // 'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    // form: config.userinfo,
    json: config.userinfo,
  }
  return addAdditionalOption(config, option_tmp)
}

export const createCommunityOption = (config: any): any => {
  const form = Object.assign(config.serverinfo, {
    grant_type: 'refresh_token',
  })
  const option_tmp = {
    uri: 'https://account.uipath.com/oauth/token',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    json: form,
  }
  return addAdditionalOption(config, option_tmp)
}

export const createRobotOption = (config: any): any => {
  const option_tmp = {
    uri: config.serverinfo.servername + '/api/robotsservice/BeginSession',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'X-ROBOT-LICENSE': config.robotInfo.machineKey,
      'X-ROBOT-MACHINE-ENCODED': Buffer.from(config.robotInfo.machineName).toString('base64'),
      Accept: 'application/json',
    },
    json: { UserName: config.robotInfo.userName },
  }
  return addAdditionalOption(config, option_tmp)
}

const addAdditionalOption = (config: any, option: any): any => {
  if ('strictSSL' in config.serverinfo) {
    Object.assign(option, { strictSSL: config.serverinfo.strictSSL })
    // process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
  }
  if (config.proxy) {
    // プロパティ proxy があって
    if (config.proxy.useProxy) {
      // useProxy がtrue ならプロキシを設定する
      return Object.assign({}, option, {
        proxy: config.proxy.url,
        strictSSL: false,
      })
    }
  }
  return option
}

const headers = (config: any, accessToken: string, contentType: string): any => {
  const tenant_logical_name = config.serverinfo.tenant_logical_name
  let ret = {}
  if (config.robotInfo) {
    ret = {
      Authorization: 'UiRobot ' + accessToken,
      'content-type': contentType,
    }
    if (config.robotInfo.organizationUnit) {
      ret = Object.assign({}, ret, { 'X-UIPATH-OrganizationUnitId': config.robotInfo.organizationUnit })
    }
  } else {
    ret = {
      Authorization: 'Bearer ' + accessToken,
      'content-type': contentType,
    }
    if ('userinfo' in config) {
      if (config.userinfo.organizationUnit) {
        ret = Object.assign({}, ret, { 'X-UIPATH-OrganizationUnitId': config.userinfo.organizationUnit })
      }
    }
  }

  // しかし、organizationUnitIdFromAPI があればそれ優先
  if ('organizationUnitIdFromAPI' in config) {
    ret = Object.assign({}, ret, { 'X-UIPATH-OrganizationUnitId': config.organizationUnitIdFromAPI })
  }

  if (tenant_logical_name) {
    return Object.assign(ret, {
      'X-UiPath-TenantName': tenant_logical_name,
    })
  }
  return ret
}

export const createFilterStr = async (
  filters: {
    from?: Date
    to?: Date
    robotName?: string
    processName?: string
    windowsIdentity?: string
    level?: 'INFO' | 'TRACE' | 'WARN' | 'ERROR' | 'FATAL'
    machineName?: string
  },
  api: IOrchestratorApi,
): Promise<string[]> => {
  const ret: string[] = []
  if (filters.from) {
    const fromUTC = filters.from.toISOString()
    logger.debug(`from: ${fromUTC}`)
    ret.push(`TimeStamp ge ${fromUTC}`)
  }
  if (filters.to) {
    const toUTC = filters.to.toISOString()
    logger.debug(`  to: ${toUTC}`)
    ret.push(`TimeStamp lt ${toUTC}`)
  }
  if (filters.robotName) {
    ret.push(`RobotName eq '${filters.robotName}'`)
  }
  if (filters.processName) {
    ret.push(`ProcessName eq '${filters.processName}'`)
  }
  if (filters.windowsIdentity) {
    ret.push(`WindowsIdentity eq '${filters.windowsIdentity}'`)
  }
  if (filters.level) {
    ret.push(`Level eq '${filters.level}'`)
  }
  if (filters.machineName) {
    const machine = await api.machine.findByMachineName(filters.machineName)
    ret.push(`MachineId eq ${machine.Id}`)
  }
  return ret
}

export const createAuditFilterStr = async (
  filters: {
    action?: string
    userName?: string
    component?: string
    methodName?: string
    from?: Date
    to?: Date
  },
  api: IOrchestratorApi,
): Promise<string[]> => {
  const ret: string[] = []

  if (filters.from) {
    const fromUTC = filters.from.toISOString()
    logger.debug(`from: ${fromUTC}`)
    ret.push(`ExecutionTime ge ${fromUTC}`)
    // ret.push(`ExecutionTime lt ${fromUTC}`)
  }
  if (filters.to) {
    const toUTC = filters.to.toISOString()
    logger.debug(`  to: ${toUTC}`)
    ret.push(`ExecutionTime lt ${toUTC}`)
  }
  if (filters.action) {
    ret.push(`Action eq '${filters.action}'`)
  }
  if (filters.userName) {
    ret.push(`UserName eq '${filters.userName}'`)
  }
  if (filters.component) {
    ret.push(`Component eq '${filters.component}'`)
  }
  if (filters.methodName) {
    ret.push(`MethodName eq '${filters.methodName}'`)
  }
  return ret
}

if (!module.parent) {
  //   main()
}
