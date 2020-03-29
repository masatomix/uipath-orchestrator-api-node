import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, getData, putData, postData, deleteData, xlsx2json } from '../utils'
import path from 'path'
import { IAssetCrudService } from '../Interfaces'

export class AssetCrudService extends BaseCrudService implements IAssetCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Assets', queries, asArray)
  }
  findAllEx(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(
      this.parent.config,
      this.parent.accessToken,
      '/odata/Assets',
      Object.assign({}, { $expand: 'RobotValues' }, queries),
      asArray,
    )
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Assets(${id})`)
  }

  // _findByUserName(userName: string): Promise<Array<any>> {
  //   return this.findAll({ $filter: `UserName eq '${userName}'` })
  // }

  // async findByUserName(userName: string): Promise<any> {
  //   const users: any[] = await this._findByUserName(userName)
  //   return users[0]
  // }

  update(asset: any): Promise<any> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Assets(${asset.Id})`, asset)
  }

  create(asset: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Assets', asset)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Assets(${id})`)
  }

  async save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateAssets.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<any> {
    const allRobotValues = instances.reduce((accumulator, current) => {
      // RobotValuesの列が来ないときもある。あるときだけ取得。
      if (current.RobotValues) {
        const robotValues = (current.RobotValues as Array<any>).map(
          robotValue => Object.assign({}, robotValue, { AssetName: current.Name }), //AssetNameというキー値を列追加
        )
        if (robotValues) {
          accumulator.push(...robotValues)
        }
      }
      return accumulator // コレ忘れる、、、
    }, [])
    // console.table(allRobotValues)

    // `perRobot_${outputFullPath}`,
    // `perRobot_${templateFullPath}`,
    const outputFullName = path.basename(outputFullPath)
    const templateFullName = path.basename(templateFullPath)
    const outputDir = path.dirname(outputFullPath)
    const templateDir = path.dirname(templateFullPath)

    // console.log(outputFullName)
    // console.log(templateFullName)
    // console.log(outputDir)
    // console.log(templateDir)

    return Promise.all([
      super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles),
      super.save2Excel(
        allRobotValues,
        path.join(outputDir, `perRobot_${outputFullName}`),
        path.join(templateDir, `perRobot_${templateFullName}`),
        sheetName,
        applyStyles,
      ),
    ])
  }

  async upload(inputFullPath: string, sheetName = 'Sheet1', allProperty = false): Promise<any> {
    // const instances = await xlsx2json(inputFullPath, sheetName)
    // const ps = instances.map(instance => {
    //   if (allProperty) {
    //     return this.create(instance)
    //   } else {
    //     return this.create({
    //       Name: instance.Name,
    //       ValueType: instance.ValueType,
    //       Value: instance.Value,
    //       StringValue: instance.StringValue,
    //       BoolValue: instance.BoolValue,
    //       IntValue: instance.IntValue,
    //       Description: instance.Description,
    //       ValueScope: instance.ValueScope,
    //       HasDefaultValue: instance.HasDefaultValue,
    //     })
    //   }
    // })
    // return Promise.all(ps)
    return this.uploadPerRobot(inputFullPath, '', sheetName, '', allProperty)
  }

  async uploadPerRobot(
    inputFullPath: string,
    perRobotInputFullPath: string,
    sheetName = 'Sheet1',
    perRobotSheetName = 'Sheet1',
    allProperty = false,
  ): Promise<any> {
    const instances = await xlsx2json(inputFullPath, sheetName, instance => {
      return Object.assign({}, instance, {
        Value: String(instance.Value),
        StringValue: String(instance.StringValue),
      })
    })

    let perRobotInstances: Array<any> = []
    if (perRobotInputFullPath !== '') {
      perRobotInstances = await xlsx2json(perRobotInputFullPath, perRobotSheetName, instance => {
        return Object.assign({}, instance, {
          Value: String(instance.Value),
          StringValue: String(instance.StringValue),
        })
      })
    }

    const ps = instances.map(async instance => {
      const perRobotValues = await this.findByAssetName(perRobotInstances, instance.Name)
      if (allProperty) {
        if (instance.ValueScope === 'PerRobot') {
          Object.assign(instance, {
            RobotValues: perRobotValues,
          })
        }
        return this.create(instance)
      } else {
        const target = {
          Name: instance.Name,
          ValueType: instance.ValueType,
          Value: instance.Value,
          StringValue: instance.StringValue,
          BoolValue: instance.BoolValue,
          IntValue: instance.IntValue,
          Description: instance.Description,
          ValueScope: instance.ValueScope,
          HasDefaultValue: instance.HasDefaultValue,
        }
        if (instance.ValueScope === 'PerRobot') {
          Object.assign(target, {
            RobotValues: perRobotValues,
          })
        }
        return this.create(target)
      }
    })
    return Promise.all(ps)
  }

  async findByAssetName(perRobotInstances: Array<any>, assetName: string): Promise<Array<any> | undefined> {
    if (perRobotInstances.length > 0) {
      // PerRobotのシートから、instance と同じAsset名の行たちを取得して、
      // 新しいJSONをつくってますが、robotIdを取得するところが非同期なので、戻り値がPromiseになっちゃう。
      // 従って roboPromises は、Promise<any> の配列になってる
      const roboPromises = perRobotInstances
        .filter(perRobotInstance => perRobotInstance.AssetName === assetName)
        .map(value => this.addRoboId(value, this.parent))

      // 全部が終了するPromiseに変換して、await で待つようにして、JSONを取得した
      const perRobotValues = await Promise.all(roboPromises)
      return perRobotValues
    }
  }

  async addRoboId(value: any, api: IOrchestratorApi): Promise<any> {
    const robot = await api.robot.findByRobotName(value.RobotName)
    return {
      RobotName: value.RobotName,
      RobotId: robot.Id,
      ValueType: value.ValueType,
      Value: value.Value,
      StringValue: value.StringValue,
      BoolValue: value.BoolValue,
      IntValue: value.IntValue,
    }
  }
}
