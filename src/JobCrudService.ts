import { IOrchestratorApi } from './IOrchestratorApi'
import { BaseCrudService } from '.'
import { getArray, getData, postData } from './utils'
import path from 'path'
import { IJobCrudService } from './Interfaces'

export class JobCrudService extends BaseCrudService implements IJobCrudService {
  constructor(parent_: IOrchestratorApi) {
    super(parent_)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Jobs', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Jobs(${id})`)
  }

  _startJobs(startInfo: any): Promise<any> {
    return postData(
      this.parent.config,
      this.parent.accessToken,
      '/odata/Jobs/UiPath.Server.Configuration.OData.StartJobs',
      startInfo,
    )
  }

  async startJobs(processKey: string, robotNames: string[], jobsCount: number = 0): Promise<any> {
    const release = await this.parent.release.findByProcessKey(processKey)
    let promise: Promise<any>
    if (robotNames && robotNames.length > 0) {
      // logger.debug('Specific')
      // logger.debug(robotNames)
      // logger.debug(robotNames.length)

      const robotIdsPromise: Promise<number>[] = robotNames.map(async element => {
        const instance = await this.parent.robot.findByRobotName(element)
        return instance.Id
      })

      const robotIds = await Promise.all(robotIdsPromise)
      promise = this._startJobs({
        startInfo: {
          ReleaseKey: release.Key,
          RobotIds: robotIds,
          JobsCount: 0,
          Strategy: 'Specific',
          InputArguments: '{}',
        },
      })
    } else {
      // logger.debug('JobsCount')
      // logger.debug(robotNames)
      // logger.debug(robotNames.length)
      promise = this._startJobs({
        startInfo: {
          ReleaseKey: release.Key,
          RobotIds: [],
          JobsCount: jobsCount,
          Strategy: 'JobsCount',
          InputArguments: '{}',
        },
      })
    }
    return promise
  }

  stopJob(jobId: number, force: boolean = false): Promise<any> {
    let strategy: string
    if (force) {
      strategy = '2'
    } else {
      strategy = '1'
    }
    return postData(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Jobs(${jobId})/UiPath.Server.Configuration.OData.StopJob`,
      {
        strategy: strategy,
      },
    )
  }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templateJobs.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<void> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }

  // create(machine: any): Promise<any> {
  //   return postData(this.parent.config, this.parent.accessToken, '/odata/Machines', machine)
  // }

  // update(machine: any): Promise<void> {
  //   return putData(this.parent.config, this.parent.accessToken, `/odata/Machines(${machine.Id})`, machine)
  // }
  // delete(id: number): Promise<any> {
  //   return deleteData(this.parent.config, this.parent.accessToken, `/odata/Machines(${id})`)
  // }
}
