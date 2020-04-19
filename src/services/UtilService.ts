import { IOrchestratorApi } from '../IOrchestratorApi'
import { IUtilService } from '../Interfaces'
import path from 'path'
import { xlsx2json } from '../utils'

export class UtilService implements IUtilService {
  constructor(public api: IOrchestratorApi) {}

  async excelDownload(outputFullDir: string): Promise<string[]> {
    const promises: Array<Promise<string>> = []

    promises.push(...this._excelDownload(outputFullDir))

    const folders = await this.api.folder.findAll()
    for (const folder of folders) {
      promises.push(...this._excelDownloadPerFolder(outputFullDir, folder.Id))
    }
    return Promise.all(promises)
  }

  _excelDownloadPerFolder(outputFullDir: string, organizationUnitId: number): Array<Promise<string>> {
    const promises: Array<Promise<string>> = []

    this.api.organizationUnitId = organizationUnitId

    promises.push(
      this.api.robot
        .findAll()
        .then((instances) =>
          this.api.robot.save2Excel(instances, path.join(outputFullDir, `robots_${organizationUnitId}.xlsx`)),
        ),
    )

    promises.push(
      this.api.environment
        .findAll()
        .then((instances) =>
          this.api.environment.save2Excel(
            instances,
            path.join(outputFullDir, `environments_${organizationUnitId}.xlsx`),
          ),
        ),
    )

    promises.push(
      this.api.release
        .findAll()
        .then((instances) =>
          this.api.release.save2Excel(instances, path.join(outputFullDir, `releases_${organizationUnitId}.xlsx`)),
        ),
    )

    promises.push(
      this.api.job
        .findAllEx()
        .then((instances) =>
          this.api.job.save2Excel(instances, path.join(outputFullDir, `jobs_${organizationUnitId}.xlsx`)),
        ),
    )

    promises.push(
      this.api.asset
        .findAllEx()
        .then((instances) =>
          this.api.asset.save2Excel(instances, path.join(outputFullDir, `assets_${organizationUnitId}.xlsx`)),
        ),
    )

    promises.push(
      this.api.queueDefinition
        .findAll()
        .then((instances) =>
          this.api.queueDefinition.save2Excel(
            instances,
            path.join(outputFullDir, `queueDefinitions_${organizationUnitId}.xlsx`),
          ),
        ),
    )

    return promises
  }

  _excelDownload(outputFullDir: string): Array<Promise<string>> {
    const promises: Array<Promise<string>> = []

    promises.push(
      this.api.machine
        .findAll()
        .then((instances) => this.api.machine.save2Excel(instances, path.join(outputFullDir, 'machines.xlsx'))),
    )

    promises.push(
      this.api.user
        .findAll()
        .then((instances) => this.api.user.save2Excel(instances, path.join(outputFullDir, 'users.xlsx'))),
    )

    promises.push(
      this.api.process
        .findAll()
        .then((instances) => this.api.process.save2Excel(instances, path.join(outputFullDir, 'processes.xlsx'))),
    )

    promises.push(
      this.api.library
        .findAll()
        .then((instances) => this.api.library.save2Excel(instances, path.join(outputFullDir, 'libraries.xlsx'))),
    )

    promises.push(
      this.api.setting
        .findAll()
        .then((instances) => this.api.setting.save2Excel(instances, path.join(outputFullDir, 'settings.xlsx'))),
    )

    promises.push(
      this.api.folder
        .findAll()
        .then((instances) => this.api.folder.save2Excel(instances, path.join(outputFullDir, 'folders.xlsx'))),
    )

    return promises
  }

  excelDownloadForHost(outputFullDir: string): Promise<string[]> {
    const promises: Array<Promise<string>> = []

    promises.push(
      this.api.hostLicense
        .findAll()
        .then((instances) => this.api.hostLicense.save2Excel(instances, path.join(outputFullDir, 'hostLicenses.xlsx'))),
    )
    promises.push(
      this.api.tenant
        .findAll()
        .then((instances) => this.api.tenant.save2Excel(instances, path.join(outputFullDir, 'tenants.xlsx'))),
    )

    return Promise.all(promises)
  }

  /**
   * 指定したパスにあるExcelファイルを読み込んで、console.table を使ってコンソールにダンプします。
   * @param fullPaths
   */
  async excel2Console(...fullPaths: Array<string>): Promise<void> {
    const promises: Array<Promise<void>> = []
    for (const fullPath of fullPaths) {
      promises.push(
        xlsx2json(fullPath).then((instances) => {
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
