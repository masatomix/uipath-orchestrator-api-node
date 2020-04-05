import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, getData, postData, xlsx2json } from '../utils'
import path from 'path'
import { ISettingCrudService } from '../Interfaces'

export class SettingCrudService extends BaseCrudService implements ISettingCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Settings', queries, asArray)
  }

  find(id: string): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Settings('${id}')`)
  }

  // 可変長配列。使う側は、
  // findByKey('Abp.Net.Mail.Smtp', 'Abp.Net.Mail.Smtp.Host')とか、
  // これはあんま見ないけど
  // findByKey(...['Abp.Net.Mail.Smtp', 'Abp.Net.Mail.Smtp.Host']) とか。
  // keyは前方一致させている
  findByKey(queries?: any): (...keys: string[]) => Promise<Array<any>> {
    return async (...keys: string[]) => {
      // まずは条件で検索
      const apiResults: any[] = await this.findAll(queries)
      return this._findByKeyFromArray(apiResults, ...keys)
    }
  }

  findByKeyFromArray(apiResults: any[]): (...keys: string[]) => Array<any> {
    return (...keys: string[]) => {
      return this._findByKeyFromArray(apiResults, ...keys)
    }
  }

  private _findByKeyFromArray(apiResults: any[], ...keys: string[]): Array<any> {
    // 案1
    const tmpResults = keys // keyごとにFilterして
      .map(key => apiResults.filter(apiResult => (apiResult.Id as string).startsWith(key)))
      .reduce((accumulator, current) => {
        accumulator.push(...current) // 配列同士を結合
        return accumulator
      }, [])
    const resultSet = new Set(tmpResults) //ココで重複を除去
    // 案2
    // const resultSet = new Set()
    // // わたされたkeyごとに、filterして、SetにAdd.
    // for (const key of keys) {
    //   apiResults
    //     .filter(apiResult => (apiResult.Id as string).startsWith(key))
    //     .map(filterResult => {
    //       resultSet.add(filterResult) // ココで重複が除去
    //     })
    // }
    // 最後は配列に戻して完成
    return Array.from(resultSet)
  }

  update(settingObjs: any[]): Promise<any> {
    return postData(
      this.parent.config,
      this.parent.accessToken,
      '/odata/Settings/UiPath.Server.Configuration.OData.UpdateBulk',
      { settings: settingObjs },
    )
  }

  readSettingsFromFile(fullPath: string, sheetName = 'Sheet1'): Promise<any[]> {
    return xlsx2json(fullPath, sheetName, instance => {
      const value = instance.Value ? instance.Value : ''
      const scope = instance.Scope ? instance.Scope : null
      return {
        Id: instance.Id,
        Name: instance.Name,
        Value: String(value), // データによっては数値になっちゃったりするのでString化
        Scope: scope,
      }
    })
  }

  async getWebSettings(): Promise<Array<any>> {
    const keyValues = await this.parent.getData('/odata/Settings/UiPath.Server.Configuration.OData.GetWebSettings')
    const keys: Array<string> = keyValues.Keys
    const values: Array<any> = keyValues.Values
    return keys.map((key, index) => {
      return {
        Id: key,
        Value: values[index],
      }
    })
  }

  save2Excel(
    settings: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateSettings.xlsx'), // テンプレファイルは、指定されたファイルか、このソースがあるディレクトリ上のtemplateSettings.xlsxを使う
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    const applyStyles_ = applyStyles
      ? applyStyles
      : (settings_: any[], workbook: any, sheetName_: string) => {
          const sheet = workbook.sheet(sheetName_)
          const rowCount = settings_.length

          sheet.range(`C2:C${rowCount + 1}`).style('numberFormat', '@') // 書式: 文字(コレをやらないと、見かけ上文字だが、F2で抜けると数字になっちゃう)
          // sheet.range(`E2:F${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd') // 書式: 日付
          // sheet.range(`H2:H${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm') // 書式: 日付+時刻
        }
    return super.save2Excel(settings, outputFullPath, templateFullPath, sheetName, applyStyles_)
  }
}
