import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, getData, putData, postData, deleteData } from '../utils'
import { excel2json } from 'excel-csv-read-write'
import path from 'path'
import { IUserCrudService } from '../Interfaces'

export class UserCrudService extends BaseCrudService implements IUserCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Users', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Users(${id})`)
  }

  _findByUserName(userName: string): Promise<Array<any>> {
    return this.findAll({ $filter: `UserName eq '${userName}'` })
  }

  async findByUserName(userName: string): Promise<any> {
    const users: any[] = await this._findByUserName(userName)
    return users[0]
  }

  update(user: any): Promise<any> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Users(${user.Id})`, user)
  }

  create(user: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Users', user)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Users(${id})`)
  }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateUsers.xlsx'), // テンプレファイルは、指定されたファイルか、このソースがあるディレクトリ上のtemplateUsers.xlsxを使う
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }

  async upload(inputFullPath: string, sheetName = 'Sheet1', allProperty = false): Promise<any> {
    const users = await excel2json(inputFullPath, sheetName)
    const promises = users.map(user => {
      if (allProperty) {
        return this.create(user)
      } else {
        return this.create({
          Name: user.Name,
          Surname: user.Surname,
          UserName: user.UserName,
          // FullName: 'User LastName',
          EmailAddress: user.EmailAddress,
          IsActive: user.IsActive,
          Password: user.Password,
          RolesList: JSON.parse(user.RolesList),
        })
      }
    })
    return Promise.all(promises)
  }
}
