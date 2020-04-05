import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, createFilterStr, NetworkAccessError } from '../utils'
import path from 'path'
import { getLogger } from '../logger'
import { ILogCrudService } from '../Interfaces'

const logger = getLogger('main')

export class LogCrudService extends BaseCrudService implements ILogCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/RobotLogs', queries, asArray)
  }

  async findByFilter(
    filters: {
      from?: Date
      to?: Date
      robotName?: string
      processName?: string
      windowsIdentity?: string
      level?: 'TRACE' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
      machineName?: string
    },
    obj?: any,
    asArray: boolean = true,
  ): Promise<Array<any>> {
    const filterArray: string[] = await createFilterStr(filters, this.parent)
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

  async findStartEndLogs(
    filters: {
      from?: Date
      to?: Date
      robotName?: string
      processName?: string
      windowsIdentity?: string
      level?: 'TRACE' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'
      machineName?: string
    },
    obj?: any,
  ): Promise<Array<any>> {
    const results: any[] = await this.findByFilter(filters, obj)

    return Promise.all(
      results
        .filter((data: any) => {
          const message: string = data.Message
          const rawMessageObj = JSON.parse(data.RawMessage)
          if (rawMessageObj.hasOwnProperty('totalExecutionTimeInSeconds')) {
            return true
          } else if (message.match(/の実行を開始しました/) || message.match(/execution started/)) {
            return true
          }
          return false
        })
        .map(async (data: any) => {
          let machineName: string = ''
          try {
            const machine = await this.parent.machine.find(data.MachineId)
            machineName = machine.Name
          } catch (error) {
            logger.error(`StatusCode: ${error.statusCode}`)
            logger.error(error.body)
            if (error instanceof NetworkAccessError) {
              if (error.statusCode === 404) {
                logger.error(`MachinId: ${data.MachineId}`)
                // 404の場合は処理を継続
              } else {
                throw error
              }
            }
          }
          delete data.Level
          delete data.MachineId
          const rawMessageObj = JSON.parse(data.RawMessage)
          if (rawMessageObj.hasOwnProperty('totalExecutionTimeInSeconds')) {
            return Object.assign({}, data, {
              MachineName: machineName,
              LogType: 'end',
              TotalExecutionTimeInSeconds: rawMessageObj.totalExecutionTimeInSeconds,
            })
          } else {
            return Object.assign({}, data, {
              MachineName: machineName,
              LogType: 'start',
              TotalExecutionTimeInSeconds: 0,
            })
          }
        }),
    )
  }

  save2Excel(
    logs: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateLogs.xlsx'), // テンプレファイルは、指定されたファイルか、このソースがあるディレクトリ上のtemplateLogs.xlsxを使う
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    const applyStyles_ = applyStyles
      ? applyStyles
      : (logs_: any[], workbook: any, sheetName_: string) => {
          const sheet = workbook.sheet(sheetName_)
          const rowCount = logs_.length

          // A列に、J列にあるUTCデータから JST変換を行う関数を入れている。
          // I列は、なぜかゼロがNULL値になっているので、0を入れる処理を入れている。
          for (let i = 0; i < rowCount; i++) {
            const rowIndex = i + 2
            sheet
              .cell(`A${rowIndex}`)
              .formula(`=DATEVALUE(MIDB(J${rowIndex},1,10))+TIMEVALUE(MIDB(J${rowIndex},12,8))+TIME(9,0,0)`)
            if (logs_[i].TotalExecutionTimeInSeconds === 0) {
              sheet.cell(`I${rowIndex}`).value(0)
            }
          }

          // JSTの時刻を入れている箇所に、日付フォーマットを適用
          sheet.range(`A2:A${rowCount + 1}`).style('numberFormat', 'yyyy/mm/dd hh:mm:ss;@')
        }
    return super.save2Excel(logs, outputFullPath, templateFullPath, sheetName, applyStyles_)
  }
}
