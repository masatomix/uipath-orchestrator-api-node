import { IOrchestratorApi } from './IOrchestratorApi'
import { BaseCrudService } from '.'
import { getArray, getData, putData, postData, deleteData } from './utils'
import { IRoleCrudService } from './Interfaces'

export class RoleCrudService extends BaseCrudService implements IRoleCrudService {
  constructor(parent_: IOrchestratorApi) {
    super(parent_)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Roles', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Roles(${id})`)
  }

  findDetail(...keys: string[]): (...methods: ('' | 'View' | 'Edit' | 'Create' | 'Delete')[]) => Promise<Array<any>> {
    return async (...methods: ('' | 'View' | 'Edit' | 'Create' | 'Delete')[]): Promise<Array<any>> => {
      // まずは条件で検索
      const apiResults: any[] = await this.parent.getArray(`/odata/Permissions`)

      let filterResults = apiResults
      if (keys.length > 0) {
        const tmpResults = keys // keyごとにFilterして
          .map(key => apiResults.filter(apiResult => (apiResult.Name as string).startsWith(key)))
          .reduce((accumulator, current) => {
            accumulator.push(...current) // 配列同士を結合
            return accumulator
          }, [])
        const resultSet = new Set(tmpResults) //ココで重複を除去
        // 最後は配列に戻して完成
        filterResults = Array.from(resultSet)
      }

      if (methods.length === 0) {
        console.log('引数なし')
        return filterResults
      }
      return filterResults.filter(filterResult => {
        for (const method of methods) {
          if (method === '') {
            if (!(filterResult.Name as string).includes('.')) {
              return true
            }
          } else {
            if ((filterResult.Name as string).includes(method)) {
              return true
            }
          }
        }
        return false
      })
    }
  }

  // _findByUserName(userName: string): Promise<Array<any>> {
  //   return this.findAll({ $filter: `UserName eq '${userName}'` })
  // }

  // async findByUserName(userName: string): Promise<any> {
  //   const users: any[] = await this._findByUserName(userName)
  //   return users[0]
  // }

  update(role: any): Promise<any> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Roles(${role.Id})`, role)
  }

  create(role: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Roles', role)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Roles(${id})`)
  }

  // save2Excel(
  //   instances: any[],
  //   outputFullPath: string,
  //   templateFullPath: string = path.join(__dirname, 'templateRoles.xlsx'), // テンプレファイルは、指定されたファイルか、このソースがあるディレクトリ上のtemplateUntitled.xlsxを使う
  //   sheetName = 'Sheet1',
  //   applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  // ): Promise<void> {
  //   const applyStyles_ = applyStyles
  //     ? applyStyles
  //     : (instances_: any[], workbook: any, sheetName_: string) => {
  //         // Object.keys(instances_[0]).forEach(key => console.log(key))
  //         const sheet = workbook.sheet(sheetName_)
  //         const rowCount = instances_.length

  //         // sheet.range(`C2:C${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
  //         // sheet.range(`E2:F${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd') // 書式: 日付
  //         // sheet.range(`H2:H${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm') // 書式: 日付+時刻

  //       }

  //   // Excelに書き出すときは、Booleanを文字として書き出します。
  //   const convertedDatas = instances.map(instance =>
  //     Object.assign(instance, {
  //       // Booleanだけは、Excelでfalseが表示出来ず。文字列化することにした。
  //       IsEmailConfirmed: String(instance.IsEmailConfirmed),
  //       IsActive: String(instance.IsActive),
  //       IsExternalLicensed: String(instance.IsExternalLicensed),
  //       MayHaveUserSession: String(instance.MayHaveUserSession),
  //       MayHaveRobotSession: String(instance.MayHaveRobotSession),
  //       BypassBasicAuthRestriction: String(instance.BypassBasicAuthRestriction),
  //       RolesList: JSON.stringify(instance.RolesList),
  //       LoginProviders: JSON.stringify(instance.LoginProviders),
  //       RobotProvision: JSON.stringify(instance.RobotProvision),
  //       NotificationSubscription: JSON.stringify(instance.NotificationSubscription),
  //     }),
  //   )
  //   return this.parent.util.save2Excel(convertedDatas, outputFullPath, templateFullPath, sheetName, applyStyles_)
  // }
}
