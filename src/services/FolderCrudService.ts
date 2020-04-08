import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, getData, putData, postData, deleteData, xlsx2json } from '../utils'
import path from 'path'
import { IFolderCrudService } from '../Interfaces'

export class FolderCrudService extends BaseCrudService implements IFolderCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }

  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Folders', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Folders(${id})`)
  }

  _findByName(name: string): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Folders', {
      $filter: `DisplayName eq '${name}'`,
    })
  }

  async findByDisplayName(name: string): Promise<any> {
    const defs: any[] = await this._findByName(name)
    return defs[0]
  }

  create(folder: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Folders', folder)
  }

  update(folder: any): Promise<any> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Folders(${folder.Id})`, folder)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Folders(${id})`)
  }

  assignUsers(folderId: number, userIds: Array<number>): Promise<any> {
    return postData(
      this.parent.config,
      this.parent.accessToken,
      '/odata/Folders/UiPath.Server.Configuration.OData.AssignUsers',
      {
        assignments: {
          UserIds: userIds,
          RolesPerFolder: [{ FolderId: folderId }],
        },
      },
    )
  }
  removeUser(folderId: number, userId: number): Promise<any> {
    return postData(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Folders(${folderId})/UiPath.Server.Configuration.OData.RemoveUserFromFolder`,
      { userId: userId },
    )
  }

  getUsers(folderId: number, queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(
      this.parent.config,
      this.parent.accessToken,
      `/odata/Folders/UiPath.Server.Configuration.OData.GetUsersForFolder(key=${folderId},includeInherited=true)`,
      queries,
      asArray,
    )
  }

  getFolders(userName: string): Promise<any> {
    return this.parent.getData(
      `/odata/Folders/UiPath.Server.Configuration.OData.GetAllRolesForUser(username='${userName}',skip=0,take=30)`,
    )
  }
  
  // const cleanAll = async (api: IOrchestratorApi, folderIds: Array<number>, userDelete: boolean = false) => {
  //   // さっきassignしたユーザ、フォルダの削除
  //   for (const folderId of folderIds) {
  //     // このフォルダを閲覧出来るユーザを検索
  //     const users = await api.folder.getUsers(folderId) // adminも含まれる

  //     for (const user of users) {
  //       await api.folder.removeUser(folderId, user.Id)
  //       if (userDelete && user.UserEntity.UserName !== 'admin') {
  //         await api.user.delete(user.Id) //さっきつくったユーザも削除
  //       }
  //     }
  //     await api.folder.delete(folderId) // folderも削除
  //   }
  // }

  save2Excel(
    instances: any[],
    outputFullPath: string,
    templateFullPath: string = path.join(__dirname, 'templates', 'templateFolders.xlsx'),
    sheetName = 'Sheet1',
    applyStyles?: (instances: any[], workbook: any, sheetName: string) => void,
  ): Promise<string> {
    return super.save2Excel(instances, outputFullPath, templateFullPath, sheetName, applyStyles)
  }
}