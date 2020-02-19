import request from 'request'
import logger from './logger'
// import url from 'url'

export const getData = (config_: any, accessToken: string, apiPath: string): Promise<any> => {
  const option = createOption(config_, accessToken, apiPath)
  return createStrPromise(Object.assign(option, { method: 'GET' }))
}

export const getArray = (
  config_: any,
  accessToken: string,
  apiPath: string,
  queries?: any,
  isOdata: boolean = true
): Promise<Array<any>> => {
  let optionTmp = createOption(config_, accessToken, apiPath)
  optionTmp = Object.assign(optionTmp, { method: 'GET' })

  let option = optionTmp
  if (queries) {
    option = Object.assign(optionTmp, { qs: queries })
  }
  return createArrayPromise(option, isOdata)
}

export const postData = (
  config_: any,
  accessToken: string,
  apiPath: string,
  obj: any,
): Promise<any> => {
  const option = createOption(config_, accessToken, apiPath)
  return createJSONPromise(
    Object.assign(option, {
      method: 'POST',
      json: obj,
    }),
  )
}

export const putData = (
  config_: any,
  accessToken: string,
  apiPath: string,
  obj: any,
): Promise<any> => {
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
    request(options, function (err: any, response: any, body: string) {
      if (err) {
        reject(err)
        return
      }
      if (response.statusCode >= 400) {
        logger.main.error(body)
        reject(body)
      }
      logger.main.info(body)
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
      logger.main.info(options.method)
      logger.main.info(body)
      if (response.statusCode >= 400) {
        logger.main.error(body)
        reject(body)
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
      logger.main.info(`method: ${options.method}, statuCode: ${response.statusCode}`)
      logger.main.info(body)
      if (response.statusCode >= 400) {
        logger.main.error(body)
        reject(body)
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

const createOption = (config_: any, accessToken: string, apiPath: string): any => {
  const servername = config_.serverinfo.servername
  const option = {
    // uri: url.resolve(servername, apiPath),
    uri: servername + apiPath,
    headers: headers(config_, accessToken),
    // proxy: 'http://xxx:8888',
    // strictSSL: false,
  }
  return option
}

const headers = (config_: any, accessToken: string): any => {
  const tenant_logical_name = config_.serverinfo.tenant_logical_name
  let ret = {}
  if (config_.robotInfo) {
    ret = {
      Authorization: 'UiRobot ' + accessToken,
      'content-type': 'application/json',
      // 'X-UIPATH-OrganizationUnitId': 1
    }
  } else {
    ret = {
      Authorization: 'Bearer ' + accessToken,
      'content-type': 'application/json',
      // 'X-UIPATH-OrganizationUnitId': 1
    }
  }
  if (tenant_logical_name) {
    return Object.assign(ret, {
      'X-UiPath-TenantName': tenant_logical_name,
    })
  }
  return ret
}

if (!module.parent) {
  //   main()
}
