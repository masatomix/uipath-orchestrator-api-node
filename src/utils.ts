import request from 'request'
import logger, { httpLogger } from './logger'
import fs from 'fs'
import path from 'path'
import OrchestratorApi from './index'
// import url from 'url'

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

export const getData = (config_: any, accessToken: string, apiPath: string): Promise<any> => {
  const option = createOption(config_, accessToken, apiPath)
  return createStrPromise(Object.assign(option, { method: 'GET' }))
}

export const getArray = (
  config_: any,
  accessToken: string,
  apiPath: string,
  queries?: any,
  isOdata: boolean = true,
): Promise<Array<any>> => {
  let optionTmp = createOption(config_, accessToken, apiPath)
  optionTmp = Object.assign(optionTmp, { method: 'GET' })

  let option = optionTmp
  if (queries) {
    option = Object.assign(optionTmp, { qs: queries })
  }
  return createArrayPromise(option, isOdata)
}

export const postData = (config_: any, accessToken: string, apiPath: string, obj: any): Promise<any> => {
  const option = createOption(config_, accessToken, apiPath)
  return createJSONPromise(
    Object.assign(option, {
      method: 'POST',
      json: obj,
    }),
  )
}

export const uploadData = async (
  config_: any,
  accessToken: string,
  apiPath: string,
  fullPath: string,
  isOdata: boolean = true,
): Promise<any> => {
  const option = createOption(config_, accessToken, apiPath, 'multipart/form-data')

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
  config_: any,
  accessToken: string,
  apiPath: string,
  id: string,
  version: string,
): Promise<any> => {
  const option = createOption(config_, accessToken, apiPath)
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

export const putData = (config_: any, accessToken: string, apiPath: string, obj: any): Promise<any> => {
  const option = createOption(config_, accessToken, apiPath)
  return createJSONPromise(
    Object.assign(option, {
      method: 'PUT',
      json: obj,
    }),
  )
}

export const deleteData = (config_: any, accessToken: string, apiPath: string): Promise<any> => {
  const option = createOption(config_, accessToken, apiPath)
  return createJSONPromise(
    Object.assign(option, {
      method: 'DELETE',
    }),
  )
}

/**
 * 「APIのReturn値のvalueが配列であると見なしてvalueを配列で返すPromise」を返す
 * @param options
 * @param isOdata  stat系APIは、OData形式ではなく、どうもただの配列で返ってくるので、valueプロパティを返すかそのまま返すかの判定フラグに使う
 */
const createArrayPromise = (options: any, isOdata: boolean): Promise<Array<any>> => {
  // promiseを返す処理は毎回おなじ。Request処理して、コールバックで値を設定するPromiseを作って返すところを共通化
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(options, function(err: any, response: any, body: string) {
      if (err) {
        reject(err)
        return
      }
      httpLogger.debug('option:', options)
      logger.info(`method: ${options.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
        reject(new NetworkAccessError(response.statusCode, body))
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
 * @param options
 */
const createStrPromise = (options: any): Promise<Array<any>> => {
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(options, function(err: any, response: any, body: string) {
      if (err) {
        reject(err)
        return
      }
      httpLogger.debug('option:', options)
      logger.info(`method: ${options.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
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
 * @param options
 */
const createJSONPromise = (options: any): Promise<Array<any>> => {
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(options, function(err: any, response: any, body: any) {
      if (err) {
        reject(err)
        return
      }
      httpLogger.debug('option:', options)
      logger.info(`method: ${options.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
        reject(new NetworkAccessError(response.statusCode, body))
      }

      // PUTのばあい、StatusCodeが200で、Bodyが空のためundefinedになったが正常終了させる。
      if (response.statusCode === 200 && !body) {
        resolve()
        return
      }
      if (body.errorCode || body.errorCode === 0) {
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
      httpLogger.debug('option:', option)
      logger.info(`method: ${option.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
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
  config_: any,
  accessToken: string,
  apiPath: string,
  contentType: string = 'application/json',
): any => {
  const servername = config_.serverinfo.servername
  const option = {
    // uri: url.resolve(servername, apiPath),
    uri: servername + apiPath,
    headers: headers(config_, accessToken, contentType),
  }
  return addProxy(config_, option)
}

export const addProxy = (config_: any, option: any): any => {
  if (config_.proxy) {
    // プロパティ proxy があって
    if (config_.proxy.useProxy) {
      // useProxy がtrue ならプロキシを設定する
      return Object.assign(option, {
        proxy: config_.proxy.url,
        strictSSL: false,
      })
    }
  }
  return option
}

const headers = (config_: any, accessToken: string, contentType: string): any => {
  const tenant_logical_name = config_.serverinfo.tenant_logical_name
  let ret = {}
  if (config_.robotInfo) {
    ret = {
      Authorization: 'UiRobot ' + accessToken,
      'content-type': contentType,
    }
    if (config_.robotInfo.organizationUnit) {
      ret = Object.assign({}, ret, { 'X-UIPATH-OrganizationUnitId': config_.robotInfo.organizationUnit })
    }
  } else {
    ret = {
      Authorization: 'Bearer ' + accessToken,
      'content-type': contentType,
    }
    if (config_.userinfo.organizationUnit) {
      ret = Object.assign({}, ret, { 'X-UIPATH-OrganizationUnitId': config_.userinfo.organizationUnit })
    }
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
  api: OrchestratorApi,
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
  api: OrchestratorApi,
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

export const applyStyles = (logs: any[], workbook: any, sheetName: string) => {
  const sheet = workbook.getWorkbook().sheet(sheetName)
  const rowCount = logs.length

  // A列に、J列にあるUTCデータから JST変換を行う関数を入れている。
  // I列は、なぜかゼロがNULL値になっているので、0を入れる処理を入れている。
  for (let i = 0; i < rowCount; i++) {
    const rowIndex = i + 2
    sheet
      .cell(`A${rowIndex}`)
      .formula(`=DATEVALUE(MIDB(J${rowIndex},1,10))+TIMEVALUE(MIDB(J${rowIndex},12,8))+TIME(9,0,0)`)
    if (logs[i].TotalExecutionTimeInSeconds === 0) {
      sheet.cell(`I${rowIndex}`).value(0)
    }
  }

  // JSTの時刻を入れている箇所に、日付フォーマットを適用
  sheet.range(`A2:A${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm:ss;@')

  // データがあるところには罫線を引く(細いヤツ)
  sheet.range(`A2:K${rowCount + 1}`).style('border', {
    top: { style: 'hair' },
    left: { style: 'hair' },
    bottom: { style: 'hair' },
    right: { style: 'hair' },
  })
}

if (!module.parent) {
  //   main()
}
