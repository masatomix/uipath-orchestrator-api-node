import config from 'config'
import OrchestratorApi from '../../index'
import { randomName } from '../sampleUtils'

async function sample() {
  const api = new OrchestratorApi(config)
  // まずは認証
  await api.authenticate()

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
  let testUserId: number = NaN
  if (api.isEnterprise) {
    try {
      // サンプル ユーザ登録
      let testUser = await api.user.create(user)
      testUserId = testUser.Id
      console.log(testUser)

      // サンプル ユーザ検索
      testUser = await api.user.find(testUserId)
      console.log(testUser)

      const expectedName: string = '名前(更新成功)'
      testUser.Name = expectedName

      // サンプル ユーザの更新
      testUser = await api.user.update(testUser)
      // ちなみに、updateは戻り値はundefined
      console.log('---')
      console.log(testUser)
      console.log('---')

      // そのユーザが検索できることを確認
      testUser = await api.user.find(testUserId)
      console.log(testUser)
    } catch (error) {
      console.error(error)
    } finally {
      // サンプル ユーザ削除
      await api.user.delete(testUserId)
    }
  } else {
    console.log('Community版のため、スキップ')
  }
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
