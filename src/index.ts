import request from 'request'
import logger from './logger'



interface IOrchestratorApi {
    authenticate: () => Promise<string>
    getRobots: () => Promise<Array<any>>
    getLicense: () => Promise<any>
}


class OrchestratorApi implements IOrchestratorApi {
    private config: any
    private accessToken: string = ''
    constructor(config_: any) {
        this.config = config_
    }
    authenticate(): Promise<string> {
        const servername = this.config.serverinfo.servername
        logger.main.info(this.config.userinfo.tenancyName)
        logger.main.info(this.config.userinfo.usernameOrEmailAddress)
        logger.main.info(this.config.userinfo.password)
        logger.main.info(servername)

        const auth_options = {
            uri: servername + '/api/Account/Authenticate',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json'
            },
            form: this.config.userinfo,
            // strictSSL: false
        }

        const me = this
        const promise: Promise<string> = new Promise((resolve, reject) => {
            request.post(auth_options, function (err, response, body) {
                if (err) {
                    reject(err)
                    return
                }
                const obj = JSON.parse(body)
                if (!obj.success) {
                    reject(obj)
                    return
                }

                const access_token = obj.result
                me.accessToken = access_token
                logger.main.info(access_token)
                resolve(access_token)
            })
        })
        return promise
    }

    getLicense(): Promise<any> {
        const servername = this.config.serverinfo.servername
        const options = {
            method: 'GET',
            uri: servername + '/odata/Settings/UiPath.Server.Configuration.OData.GetLicense',
            headers: {
                Authorization: 'Bearer ' + this.accessToken,
            }
        }
        return this.createPromise(options)
    }

    getRobots(): Promise<Array<any>> {
        const servername = this.config.serverinfo.servername
        const options = {
            method: 'GET',
            uri: servername + '/odata/Robots',
            headers: {
                Authorization: 'Bearer ' + this.accessToken,
                // 'X-UIPATH-OrganizationUnitId': 1
            }
        }
        return this.createArrayPromise(options)
    }

    createArrayPromise = (options: any): Promise<Array<any>> => {
        // promiseを返す処理は毎回おなじ。Request処理して、コールバックで値を設定するPromiseを作って返すところを共通化
        const promise: Promise<any> = new Promise((resolve, reject) => {
            request(options, function (err: any, response: any, body: string) {
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

    createPromise = (options: any): Promise<Array<any>> => {
        const promise: Promise<any> = new Promise((resolve, reject) => {
            request(options, function (err: any, response: any, body: string) {
                if (err) {
                    reject(err)
                    return
                }
                logger.main.info(body)
                const obj = JSON.parse(body)
                resolve(obj)
            })
        })
        return promise
    }
}

export = OrchestratorApi



import config from 'config'

async function main() {
    const api = new OrchestratorApi(config)
    // まずは認証
    await api.authenticate()

    // ロボットを取得する
    const robots: any[] = await api.getRobots()
    for (const robot of robots) {
        console.log(robot)
    }

    // ライセンスを取得する
    const license: any = await api.getLicense()
    console.log(license)

    
}

if (!module.parent) {
    main()
}

