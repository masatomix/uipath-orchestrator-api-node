import request from 'request'
import { getLogger } from './logger'
import fs from 'fs'
import path from 'path'
import { IOrchestratorApi } from './IOrchestratorApi'
const XlsxPopulate = require('xlsx-populate')
// import { Parser } from 'json2csv'
// import url from 'url'

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
      httpLogger.debug({ objects: options })
      logger.info(`method: ${options.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
        logger.error(body)
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
      httpLogger.debug({ objects: options })
      logger.info(`method: ${options.method}, statuCode: ${response.statusCode}`)
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
 * @param options
 */
const createJSONPromise = (options: any): Promise<Array<any>> => {
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(options, function(err: any, response: any, body: any) {
      if (err) {
        reject(err)
        return
      }
      httpLogger.debug({ objects: options })
      logger.info(`method: ${options.method}, statuCode: ${response.statusCode}`)
      if (response.statusCode >= 400) {
        logger.error(body)
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

export const createEnterpriseOption = (config: any): any => {
  const option_tmp = {
    uri: config.serverinfo.servername + '/api/Account/Authenticate',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    form: config.userinfo,
  }
  return addProxy(config, option_tmp)
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
    form: form,
  }
  return addProxy(config, option_tmp)
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
  return addProxy(config, option_tmp)
}

export const addProxy = (config_: any, option: any): any => {
  if (config_.proxy) {
    // プロパティ proxy があって
    if (config_.proxy.useProxy) {
      // useProxy がtrue ならプロキシを設定する
      return Object.assign({}, option, {
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

/**
 * Excelのシリアル値を、Dateへ変換します。
 * @param serialNumber シリアル値
 */
export const dateFromSn = (serialNumber: number): Date => {
  return XlsxPopulate.numberToDate(serialNumber)
}

export const toBoolean = function(boolStr: string | boolean): boolean {
  if (typeof boolStr === 'boolean') {
    return boolStr
  }
  return boolStr.toLowerCase() === 'true'
}

// XlsxPopulate
export const getHeaders = (workbook: any, sheetName: string): string[] => {
  return workbook
    .sheet(sheetName)
    .usedRange()
    .value()
    .shift()
}

// XlsxPopulate
export const getValuesArray = (workbook: any, sheetName: string): any[][] => {
  const valuesArray: any[][] = workbook
    .sheet(sheetName)
    .usedRange()
    .value()
  valuesArray.shift() // 先頭除去
  return valuesArray
}

/**
 * Excelファイルを読み込み、各行をデータとして配列で返すメソッド。
 * @param path Excelファイルパス
 * @param sheet シート名
 * @param format_func フォーマット関数。instanceは各行データが入ってくるので、任意に整形して返せばよい
 */
export const xlsx2json = async (
  inputFullPath: string,
  sheetName = 'Sheet1',
  format_func?: (instance: any) => any,
): Promise<Array<any>> => {
  const workbook: any = await XlsxPopulate.fromFileAsync(inputFullPath)
  const headings: string[] = getHeaders(workbook, sheetName)
  // console.log(headings.length)
  const valuesArray: any[][] = getValuesArray(workbook, sheetName)

  const instances = valuesArray.map((values: any[]) => {
    return values.reduce((box: any, column: any, index: number) => {
      // 列単位で処理してきて、ヘッダの名前で代入する。
      box[headings[index]] = column
      return box
    }, {})
  })

  if (format_func) {
    return instances.map(instance => format_func(instance))
  }
  return instances
}

/**
 * 引数のJSON配列を、指定したテンプレートを用いて、指定したファイルに出力します。
 * @param instances JSON配列
 * @param outputFullPath 出力Excelのパス
 * @param templateFullPath 元にするテンプレートExcelのパス
 * @param sheetName テンプレートExcelのシート名
 * @param applyStyles 出力時のExcelを書式フォーマットしたい場合に使用する。
 */
export const internalSave2Excel = async (
  instances: any[],
  outputFullPath: string,
  templateFullPath: string,
  sheetName: string,
  applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
): Promise<void> => {
  logger.debug(`template path: ${templateFullPath}`)
  // console.log(instances[0])
  // console.table(instances)

  let headings: string[] = []
  let workbook: any
  if (templateFullPath !== '') {
    // 指定された場合は、一行目の文字列群を使ってプロパティを作成する
    workbook = await XlsxPopulate.fromFileAsync(templateFullPath)
    headings = getHeaders(workbook, sheetName)
  } else {
    // templateが指定されない場合は、空ファイルをつくり、オブジェクトのプロパティでダンプする。
    workbook = await XlsxPopulate.fromBlankAsync()
    if (instances.length > 0) {
      headings = Object.keys(instances[0])
    }
  }

  if (instances.length > 0) {
    const csvArrays: any[][] = createCsvArrays(headings, instances)
    // console.table(csvArrays)
    const rowCount = instances.length
    const columnCount = headings.length
    const sheet = workbook.sheet(sheetName)

    if (sheet.usedRange()) {
      sheet.usedRange().clear() // Excel上のデータを削除して。
    }
    sheet.cell('A1').value(csvArrays)

    // データがあるところには罫線を引く(細いヤツ)
    const startCell = sheet.cell('A1')
    const endCell = startCell.relativeCell(rowCount, columnCount - 1)

    sheet.range(startCell, endCell).style('border', {
      top: { style: 'hair' },
      left: { style: 'hair' },
      bottom: { style: 'hair' },
      right: { style: 'hair' },
    })

    // よくある整形パタン。
    // sheet.range(`C2:C${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
    // sheet.range(`E2:F${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd') // 書式: 日付
    // sheet.range(`H2:H${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm') // 書式: 日付+時刻

    if (applyStyles) {
      applyStyles(instances, workbook, sheetName)
    }
  }

  logger.debug(outputFullPath)
  await workbook.toFileAsync(outputFullPath)
}

// 自前実装
function createCsvArrays(headings: string[], instances: any[]) {
  const csvArrays: any[][] = instances.map((instance: any): any[] => {
    // console.log(instance)
    const csvArray = headings.reduce((box: any[], header: string): any[] => {
      // console.log(`${instance[header]}: ${instance[header] instanceof Object}`)
      if (instance[header] instanceof Object) {
        box.push(JSON.stringify(instance[header]))
      } else {
        box.push(instance[header])
      }
      return box
    }, [])
    return csvArray
  })
  csvArrays.unshift(headings)
  return csvArrays
}

// // json2csvを使った実装
// function createCsvArrays1(headings: string[], instances: any[]) {
// https://www.npmjs.com/package/json2csv
//   const delimiter = String.fromCharCode(31) // 入力されない文字らしい
//   const options = { fields: headings, header: false, delimiter: delimiter, quote: '' }
//   const parser = new Parser(options)
//   const csvArrays: any[][] = instances.map((instance: any): any[] => parser.parse(instance).split(delimiter))
//   csvArrays.unshift(headings)
//   return csvArrays
// }

if (!module.parent) {
  //   main()
}
