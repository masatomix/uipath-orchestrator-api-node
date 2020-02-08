import request from 'request'
import logger from './logger'

export const getArray = (
  config_: any,
  accessToken: string,
  apiPath: string,
): Promise<Array<any>> => {
  const servername = config_.serverinfo.servername
  const options = {
    method: 'GET',
    uri: servername + apiPath,
    headers: headers(config_, accessToken),
  }
  return createArrayPromise(options)
}

export const getData = (config_: any, accessToken: string, apiPath: string): Promise<any> => {
  const servername = config_.serverinfo.servername
  const options = {
    method: 'GET',
    uri: servername + apiPath,
    headers: headers(config_, accessToken),
  }
  return createPromise(options)
}

export const putData = (
  config_: any,
  accessToken: string,
  apiPath: string,
  obj: any,
): Promise<any> => {
  const servername = config_.serverinfo.servername
  const options = {
    method: 'PUT',
    uri: servername + apiPath,
    headers: headers(config_, accessToken),
    form: obj,
  }
  return createPromise(options)
}

/**
 * 「APIのReturn値のvalueが配列であると見なしてvalueを配列で返すPromise」を返す
 * @param options
 */
const createArrayPromise = (options: any): Promise<Array<any>> => {
  // promiseを返す処理は毎回おなじ。Request処理して、コールバックで値を設定するPromiseを作って返すところを共通化
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(options, function(err: any, response: any, body: string) {
      if (err) {
        reject(err)
        return
      }
      logger.main.info(body)
      const obj = JSON.parse(body)
      resolve(obj.value) // valueプロパティが配列である想定。
    })
  })
  return promise
}

/**
 * 「APIのReturn値をそのまま返すPromise」を返す
 * @param options
 */
const createPromise = (options: any): Promise<Array<any>> => {
  const promise: Promise<any> = new Promise((resolve, reject) => {
    request(options, function(err: any, response: any, body: string) {
      if (err) {
        reject(err)
        return
      }
      logger.main.info(body)
      if (body === null || body === '') {
        resolve()
        return
      }
      const obj = JSON.parse(body)
      resolve(obj)
      return
    })
  })
  return promise
}

const headers = (config_: any, accessToken: string): any => {
  const tenant_logical_name = config_.serverinfo.tenant_logical_name
  if (tenant_logical_name) {
    return {
      Authorization: 'Bearer ' + accessToken,
      'content-type': 'application/json',
      // 'X-UIPATH-OrganizationUnitId': 1
      'X-UiPath-TenantName': tenant_logical_name,
    }
  }
  return {
    Authorization: 'Bearer ' + accessToken,
    // 'X-UIPATH-OrganizationUnitId': 1
  }
}

if (!module.parent) {
  //   main()
}
