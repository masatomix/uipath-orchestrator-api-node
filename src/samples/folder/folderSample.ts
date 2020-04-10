import config from 'config'
import OrchestratorApi from '../../index'
import { randomName } from '../sampleUtils'
import { IOrchestratorApi } from '../../IOrchestratorApi'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()

  // サンプル1: Folderの検索
  await searchSample(api)

  // サンプル2: ユーザ、Folderを作成して、アサインして、フォルダを削除
  await createAndAssignAndDeleteSample(api)

  // サンプル3: ユーザを作成、Folderをふたつ作成、それらにアサインして、
  // ユーザがみられるフォルダを表示、さいごにフォルダを削除
  await assignAndPrint(api)
}

const searchSample = async (api: IOrchestratorApi) => {
  try {
    const folders: any[] = await api.folder.findAll()
    console.table(folders)

    const folder: any = await api.folder.findByDisplayName('Default') // 画面の名前で検索できる
    console.log(folder)
  } catch (error) {
    console.error(error)
  }
}

const createAndAssignAndDeleteSample = async (api: IOrchestratorApi) => {
  let folderId
  try {
    const user = await createTestUser(api)
    const folder = await createTestFolder(api)
    // finallyで削除するので、folderId/userId を保持しておく
    folderId = folder.Id

    // folderにユーザをアサイン
    await api.folder.assignUsers(folder.Id, [user.Id])

    // Assignしたユーザを検索
    const results = await api.folder.getUsers(folder.Id)
    for (const result of results) {
      console.log(result)
    }
  } catch (error) {
    console.error(error)
  } finally {
    const userDelete = true
    api.folder.removeFolders([folderId], userDelete)
    // cleanAll(api, [folderId], userDelete) // フォルダを削除する便利メソッド。
  }
}

const assignAndPrint = async (api: IOrchestratorApi) => {
  const folderIds = []
  try {
    const user = await createTestUser(api)
    for (let index = 0; index < 3; index++) {
      const folder = await createTestFolder(api)
      // finallyで削除するので、folderId を保持しておく
      folderIds.push(folder.Id)
      await api.folder.assignUsers(folder.Id, [user.Id])
    }
    const folders = await api.folder.getFolders(user.UserName)
    console.log(JSON.stringify(folders))
  } catch (error) {
    console.error(error)
  } finally {
    const userDelete = true
    api.folder.removeFolders(folderIds, userDelete)
    // cleanAll(api, folderIds, userDelete)
  }
}

const cleanAll = async (api: IOrchestratorApi, folderIds: Array<number>, userDelete: boolean = false) => {
  // さっきassignしたユーザ、フォルダの削除
  for (const folderId of folderIds) {
    // このフォルダを閲覧出来るユーザを検索
    const users = await api.folder.getUsers(folderId) // adminも含まれる

    for (const user of users) {
      await api.folder.removeUser(folderId, user.Id)
      if (userDelete && user.UserEntity.UserName !== 'admin') {
        await api.user.delete(user.Id) //さっきつくったユーザも削除
      }
    }
    await api.folder.delete(folderId) // folderも削除
  }
}

const createTestFolder = (api: IOrchestratorApi): Promise<any> => {
  const newFolder = api.folder.create({
    DisplayName: randomName(),
    Description: 'テスト',
    PermissionModel: 'InheritFromTenant', // よくわからない
    ProvisionType: 'Manual', // よくわからない
  })
  return newFolder
}

const createTestUser = (api: IOrchestratorApi): Promise<any> => {
  const random = randomName('user_')
  const user = {
    Name: 'user001',
    Surname: 'LastName001',
    UserName: `${random}`,
    // FullName: 'User LastName', ココはName+Surnameで勝手に更新される
    EmailAddress: `${random}@example.com`,
    IsActive: true,
    Password: 'afjlaf#adA0!', // (初期状態は)割と強固なパスでないとはじかれる
    RolesList: ['Robot'],
  }
  return api.user.create(user)
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
