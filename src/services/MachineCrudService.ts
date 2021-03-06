import { BaseCrudService, IOrchestratorApi } from '..'
import { getArray, getData, putData, postData, deleteData } from '../utils'
import { excel2json, json2excel, json2excelBlob } from 'excel-csv-read-write'
import path from 'path'
import { IMachineCrudService } from '../Interfaces'

export class MachineCrudService extends BaseCrudService implements IMachineCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Machines', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  }

  _findByMachineName(machineName: string): Promise<Array<any>> {
    return this.findAll({ $filter: `Name eq '${machineName}'` })
  }

  async findByMachineName(machineName: string): Promise<any> {
    const machines: any[] = await this._findByMachineName(machineName)
    return machines[0]
  }

  create(machine: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Machines', machine)
  }

  update(machine: any): Promise<void> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Machines(${machine.Id})`, machine)
  }
  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  }
  async save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateMachines.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    const savedInstancesP = instances.map(async (instance) => {
      const machine = await this.parent.machine.find(instance.Id)
      return Object.assign({}, instance, { LicenseKey: machine.LicenseKey })
    })
    const savedInstances = await Promise.all(savedInstancesP)

    const converters = {
      // RobotVersions: (value: any) => value[0].Count,
      // RobotVersions: (value: any) => value[0].Version,
    }
    return json2excel(savedInstances, outputFullPath, templateFullPath, sheetName, converters, applyStyles)
    // return super.save2Excel(savedInstances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
  async save2ExcelBlob(
    instances: any[],
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<Blob> {
    const savedInstancesP = instances.map(async (instance) => {
      const machine = await this.parent.machine.find(instance.Id)
      return Object.assign({}, instance, { LicenseKey: machine.LicenseKey })
    })
    const savedInstances = await Promise.all(savedInstancesP)

    const converters = {
      // RobotVersions: (value: any) => value[0].Count,
      // RobotVersions: (value: any) => value[0].Version,
    }
    return json2excelBlob(savedInstances,  sheetName, converters, applyStyles)
    // return super.save2Excel(savedInstances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
  async upload(inputFullPath: string, sheetName = 'Sheet1', allProperty = false): Promise<any[]> {
    const machines = await excel2json(inputFullPath, sheetName)
    const promises = machines.map((machine) => {
      if (allProperty) {
        return this.create(machine)
      } else {
        return this.create({
          Name: machine.Name,
          Description: machine.Description,
          Type: machine.Type,
        })
      }
    })
    return Promise.all(promises)
  }
}
