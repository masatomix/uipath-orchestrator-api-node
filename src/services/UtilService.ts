import { IOrchestratorApi } from '../IOrchestratorApi'
import { IUtilService } from '../Interfaces'
import path from 'path'
import { xlsx2json } from '../utils'

export class UtilService implements IUtilService {
  constructor(public api: IOrchestratorApi) {}

  async excelDownload(outputFullDir: string): Promise<void> {
    const promises: Array<Promise<void>> = []

    promises.push(
      this.api.machine
        .findAll()
        .then(instances => this.api.machine.save2Excel(instances, path.join(outputFullDir, 'machines.xlsx'))),
    )

    promises.push(
      this.api.robot
        .findAll()
        .then(instances => this.api.robot.save2Excel(instances, path.join(outputFullDir, 'robots.xlsx'))),
    )

    promises.push(
      this.api.environment
        .findAll()
        .then(instances => this.api.environment.save2Excel(instances, path.join(outputFullDir, 'environments.xlsx'))),
    )

    promises.push(
      this.api.user
        .findAll()
        .then(instances => this.api.user.save2Excel(instances, path.join(outputFullDir, 'users.xlsx'))),
    )

    promises.push(
      this.api.release
        .findAll()
        .then(instances => this.api.release.save2Excel(instances, path.join(outputFullDir, 'releases.xlsx'))),
    )

    promises.push(
      this.api.process
        .findAll()
        .then(instances => this.api.process.save2Excel(instances, path.join(outputFullDir, 'processes.xlsx'))),
    )

    promises.push(
      this.api.library
        .findAll()
        .then(instances => this.api.library.save2Excel(instances, path.join(outputFullDir, 'libraries.xlsx'))),
    )

    promises.push(
      this.api.job
        .findAllEx()
        .then(instances => this.api.job.save2Excel(instances, path.join(outputFullDir, 'jobs.xlsx'))),
    )

    promises.push(
      this.api.asset
        .findAllEx()
        .then(instances => this.api.asset.save2Excel(instances, path.join(outputFullDir, 'assets.xlsx'))),
    )

    promises.push(
      this.api.setting
        .findAll()
        .then(instances => this.api.setting.save2Excel(instances, path.join(outputFullDir, 'settings.xlsx'))),
    )

    promises.push(
      this.api.queueDefinition
        .findAll()
        .then(instances =>
          this.api.queueDefinition.save2Excel(instances, path.join(outputFullDir, 'queueDefinitions.xlsx')),
        ),
    )

    await Promise.all(promises)

    // ////////////
    // let instances: Array<any>
    // instances = await this.api.machine.findAll()
    // await this.api.machine.save2Excel(instances, path.join(outputFullDir, 'machines.xlsx'))

    // instances = await this.api.robot.findAll()
    // await this.api.robot.save2Excel(instances, path.join(outputFullDir, 'robots.xlsx'))

    // instances = await this.api.user.findAll()
    // await this.api.user.save2Excel(instances, path.join(outputFullDir, 'users.xlsx'))

    // instances = await this.api.release.findAll()
    // await this.api.release.save2Excel(instances, path.join(outputFullDir, 'releases.xlsx'))

    // instances = await this.api.process.findAll()
    // await this.api.process.save2Excel(instances, path.join(outputFullDir, 'processes.xlsx'))

    // instances = await this.api.job.findAll()
    // await this.api.job.save2Excel(instances, path.join(outputFullDir, 'jobs.xlsx'))

    // instances = await this.api.asset.findAllEx()
    // await this.api.asset.save2Excel(instances, path.join(outputFullDir, 'assets.xlsx'))

    // instances = await this.api.setting.findAll()
    // await this.api.setting.save2Excel(instances, path.join(outputFullDir, 'settings.xlsx'))

    // instances = await this.api.queueDefinition.findAll()
    // await this.api.queueDefinition.save2Excel(instances, path.join(outputFullDir, 'queueDefinitions.xlsx'))

    return new Promise((resolve, reject) => resolve())
  }

  async excelDownloadForHost(outputFullDir: string): Promise<void> {
    const promises: Array<Promise<void>> = []

    promises.push(
      this.api.hostLicense
        .findAll()
        .then(instances => this.api.hostLicense.save2Excel(instances, path.join(outputFullDir, 'hostLicenses.xlsx'))),
    )
    promises.push(
      this.api.tenant
        .findAll()
        .then(instances => this.api.tenant.save2Excel(instances, path.join(outputFullDir, 'tenants.xlsx'))),
    )

    await Promise.all(promises)
    return new Promise((resolve, reject) => resolve())
  }

  /**
   * 指定したパスにあるExcelファイルを読み込んで、console.table を使ってコンソールにダンプします。
   * @param fullPaths
   */
  async excel2Console(...fullPaths: Array<string>): Promise<void> {
    const promises: Array<Promise<void>> = []
    for (const fullPath of fullPaths) {
      promises.push(
        xlsx2json(fullPath).then(instances => {
          console.log(`path : ${path.resolve(fullPath)}`)
          console.log(`count: ${instances.length}`)
          console.table(instances)
        }),
      )
    }
    await Promise.all(promises)
    return new Promise((resolve, reject) => resolve())
  }
}
