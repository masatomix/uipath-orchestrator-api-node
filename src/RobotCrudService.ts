import { IOrchestratorApi } from './IOrchestratorApi'
import { BaseCrudService } from '.'
import { getArray, getData, putData, postData, deleteData } from './utils'
import path from 'path'
import { IRobotCrudService } from './Interfaces'

export class RobotCrudService extends BaseCrudService implements IRobotCrudService {
  constructor(parent_: IOrchestratorApi) {
    super(parent_)
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
    templateFullPath: string = path.join(__dirname, 'templateRobots.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<void> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}
