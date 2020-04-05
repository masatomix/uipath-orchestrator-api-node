import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, getData, putData, postData, deleteData, xlsx2json } from '../utils'
import path from 'path'
import { IRobotCrudService } from '../Interfaces'

export class RobotCrudService extends BaseCrudService implements IRobotCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Robots', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Robots(${id})`)
  }

  _findByName(name: string): Promise<Array<any>> {
    return this.findAll({ $filter: `Name eq '${name}'` })
  }

  async findByRobotName(name: string): Promise<any> {
    const robos: any[] = await this._findByName(name)
    return robos[0]
  }

  create(robot: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Robots', robot)
  }

  update(robot: any): Promise<void> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Robots(${robot.Id})`, robot)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Robots(${id})`)
  }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateRobots.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }

  async upload(inputFullPath: string, sheetName = 'Sheet1', allProperty = false): Promise<any> {
    const robots = await xlsx2json(inputFullPath, sheetName)
    const promises = robots.map(async robot => {
      if (allProperty) {
        return this.create(robot)
      } else {
        // Machineがなかったら、つくるって処理も入れるべきだが一旦ナシで。
        // tmpを一度検索しているのは、Machine名検索だけだと、LicenseKey が空になるので、Idで再検索する。
        const tmp = await this.parent.machine.findByMachineName(robot.MachineName)
        const machine = await this.parent.machine.find(tmp.Id)
        // console.log(machine)
        return this.create({
          MachineName: robot.MachineName,
          LicenseKey: machine.LicenseKey,
          Name: robot.Name,
          Username: robot.Username,
          Type: robot.Type,
          RobotEnvironments: robot.RobotEnvironments,
        })
      }
    })
    return Promise.all(promises)
  }
}
