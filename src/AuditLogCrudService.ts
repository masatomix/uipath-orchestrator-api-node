import { IOrchestratorApi } from './IOrchestratorApi'
import  { BaseCrudService } from '.'
import { getArray, getData, putData, postData, deleteData, createAuditFilterStr } from './utils'
import path from 'path'

export class AuditLogCrudService extends BaseCrudService {
    constructor(parent_: IOrchestratorApi) {
      super(parent_)
    }
  
    findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
      return getArray(this.parent.config, this.parent.accessToken, '/odata/AuditLogs', queries, asArray)
    }
  
    async findByFilter(
      filters: {
        action?: string
        userName?: string
        component?: string
        methodName?: string
        from?: Date
        to?: Date
      },
      obj?: any,
      asArray: boolean = true,
    ): Promise<Array<any>> {
      const filterArray: string[] = await createAuditFilterStr(filters, this.parent)
      const filter = filterArray.join(' and ')
  
      if (filter === '') {
        return this.findAll(obj, asArray)
      }
  
      let condition: any = {}
      if (obj) {
        condition = obj
        condition['$filter'] = filter
      } else {
        condition = { $filter: filter }
      }
      return this.findAll(condition, asArray)
    }
  
    save2Excel(
      instances: any[],
      outputFullPath: string,
      templateFullPath: string = path.join(__dirname, 'templateAuditLog.xlsx'),
      sheetName = 'Sheet1',
      applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
    ): Promise<void> {
      const applyStyles_ = applyStyles
        ? applyStyles
        : (instances_: any[], workbook: any, sheetName_: string) => {
            // Object.keys(instances_[0]).forEach(key => console.log(key))
            const sheet = workbook.sheet(sheetName_)
            const rowCount = instances_.length
  
            // A列に、J列にあるUTCデータから JST変換を行う関数を入れている。
            // I列は、なぜかゼロがNULL値になっているので、0を入れる処理を入れている。
            for (let i = 0; i < rowCount; i++) {
              const rowIndex = i + 2
              sheet
                .cell(`A${rowIndex}`)
                .formula(`=DATEVALUE(MIDB(D${rowIndex},1,10))+TIMEVALUE(MIDB(D${rowIndex},12,8))+TIME(9,0,0)`)
            }
  
            // JSTの時刻を入れている箇所に、日付フォーマットを適用
            sheet.range(`A2:A${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm:ss;@')
          }
      return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles_)
    }
  }