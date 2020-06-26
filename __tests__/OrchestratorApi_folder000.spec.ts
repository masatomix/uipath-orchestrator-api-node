import OrchestratorApi from '../src/index'
import { getLogger } from '../src/logger'
import { randomName } from '../src/samples/sampleUtils'
import config from 'config'
import path from 'path'
import { IOrchestratorApi } from '../src/IOrchestratorApi'
import { excel2json } from 'excel-csv-read-write'

const logger = getLogger('main')

describe('OrchestratorApi_folder000', () => {
  const api = new OrchestratorApi(config)

  let expecteds: Array<any> = []

  beforeEach(async () => {
    await api.authenticate()
    const dataPath = path.join(__dirname, 'testData', 'folders000.xlsx')
    expecteds = await excel2json(dataPath)
    console.table(expecteds)
  })

  it('Normal Case.', async () => {
    jest.setTimeout(10000)
    // // サンプル1: Folderの検索
    // await searchSample(api)

    // // サンプル2: ユーザ、Folderを作成して、アサインして、フォルダを削除
    // await createAndAssignAndDeleteSample(api)

    // // サンプル3: ユーザを作成、Folderをふたつ作成、それらにアサインして、
    // // ユーザがみられるフォルダを表示、さいごにフォルダを削除
    // await assignAndPrint(api)

    try {
      // Step0. 登録
      const state1 = await api.folder.findAll()
      console.table(state1)
      const createPromises = expecteds.map((expected) =>
        api.folder.create({
          DisplayName: expected.DisplayName,
          FullyQualifiedName: expected.FullyQualifiedName,
          Description: expected.Description,
          ProvisionType: expected.ProvisionType,
          PermissionModel: expected.PermissionModel,
        }),
      )
      const folders = await Promise.all(createPromises)
      const user = await createTestUser(api)
      for (const folder of folders) {
        await api.folder.assignUsers(folder.Id, [user.Id])
      }

      // Step1. 期待値と比較
      for (const [index, expected] of expecteds.entries()) {
        assertEqualsFolder(expected, folders[index])
      }

      const state2 = await api.folder.findAll()
      expect(state2.length).toEqual(state1.length + expecteds.length)

      // Step2. 削除
      const deletePromises = folders.map((folder) => {
        return api.folder.removeFolders([folder.Id], true)
      })
      await Promise.all(deletePromises)

      // Step3. 元に戻ったことの確認
      const state3 = await api.folder.findAll()
      expect(state3.length).toEqual(state1.length)
    } catch (error) {
      logger.error({ objects: error })
      fail(error)
    }
  })

  // it('Normal Case(upload).', async () => {
  //   try {
  //     // Step0. 登録
  //     const state1 = await api.machine.findAll()
  //     const machines = await api.machine.upload(path.join(__dirname, 'testData', 'machines000.xlsx'))

  //     // Step1. 期待値と比較
  //     for (const [index, expected] of expecteds.entries()) {
  //       assertEqualsMachine(expected, machines[index])
  //     }

  //     const state2 = await api.machine.findAll()
  //     expect(state2.length).toEqual(state1.length + expecteds.length)

  //     // Step2. 削除
  //     const deletePromises = machines.map((machine) => {
  //       return api.machine.delete(machine.Id)
  //     })
  //     await Promise.all(deletePromises)

  //     // Step3. 元に戻ったことの確認
  //     const state3 = await api.machine.findAll()
  //     expect(state3.length).toEqual(state1.length)
  //   } catch (error) {
  //     logger.error({ objects: error })
  //     fail(error)
  //   }
  // })

  afterEach(async () => {
    // console.table(expecteds)
    const deletePromises = expecteds
      .map((expected) => api.folder.findByDisplayName(expected.DisplayName)) // 検索してPromise取得
      .map((findPromise) => findPromise.then((folder) => (folder ? folder.Id : null)))
    const folderIds = await Promise.all(deletePromises) // そのPromiseをawaitでまつ
    console.log(folderIds)
    await api.folder.removeFolders(
      folderIds.filter((folderId) => folderId !== null),
      true,
    )
  })
})

const assertEqualsFolder = (expectedInstance: any, actualInstance: any) => {
  // console.log(expectedInstance)
  // console.log(actualInstance)
  delete actualInstance['@odata.context']

  // テストデータにはちゃんとした値が入っていない(か入れられない)ため、なにか値が入っていればOKとした(null/undefinedはダメ)
  expectedInstance.Id = expect.anything()
  // 登録には使わないので、値が入っていればなんでもイイ

  // 空セルの置き換え
  // undifined -> null へ置き換える
  Object.assign(expectedInstance, {
    ParentId: expectedInstance.ParentId ? expectedInstance.ParentId : null, // undefined -> nullへ。
  })

  // // デフォルト値への置き換え
  // Object.assign(expectedInstance, {
  //   Type: expectedInstance.Type ? expectedInstance.Type : 'Standard', // undefined -> 'Standard' へ
  // })

  expect(actualInstance).toEqual(expectedInstance)
}

// const searchSample = async (api: IOrchestratorApi) => {
//   try {
//     const folders: any[] = await api.folder.findAll()
//     console.table(folders)

//     const folder: any = await api.folder.findByDisplayName('Default') // 画面の名前で検索できる
//     console.log(folder)
//   } catch (error) {
//     console.error(error)
//   }
// }

// const createAndAssignAndDeleteSample = async (api: IOrchestratorApi) => {
//   let folderId
//   try {
//     const user = await createTestUser(api)
//     const folder = await createTestFolder(api)
//     // finallyで削除するので、folderId/userId を保持しておく
//     folderId = folder.Id

//     // folderにユーザをアサイン
//     await api.folder.assignUsers(folder.Id, [user.Id])

//     // Assignしたユーザを検索
//     const results = await api.folder.getUsers(folder.Id)
//     for (const result of results) {
//       console.log(result)
//     }
//   } catch (error) {
//     console.error(error)
//   } finally {
//     const userDelete = true
//     api.folder.removeFolders([folderId], userDelete) // フォルダを削除する便利メソッド。
//   }
// }

// const assignAndPrint = async (api: IOrchestratorApi) => {
//   const folderIds = []
//   try {
//     const user = await createTestUser(api)
//     for (let index = 0; index < 3; index++) {
//       const folder = await createTestFolder(api)
//       // finallyで削除するので、folderId を保持しておく
//       folderIds.push(folder.Id)
//       await api.folder.assignUsers(folder.Id, [user.Id])
//     }
//     const folders = await api.folder.getFolders(user.UserName)
//     console.log(JSON.stringify(folders))
//   } catch (error) {
//     console.error(error)
//   } finally {
//     const userDelete = true
//     api.folder.removeFolders(folderIds, userDelete) // フォルダを削除する便利メソッド。
//   }
// }

// const createTestFolder = (api: IOrchestratorApi): Promise<any> => {
//   const newFolder = api.folder.create({
//     DisplayName: randomName(),
//     Description: 'テスト',
//     PermissionModel: 'InheritFromTenant', // よくわからない
//     ProvisionType: 'Manual', // よくわからない
//   })
//   return newFolder
// }

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
