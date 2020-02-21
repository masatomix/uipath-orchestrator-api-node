import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'
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
    FullName: 'User LastName',
    EmailAddress: `${random}@example.com`,
    IsActive: true,
    Password: 'afjlaf#adA0!',
    RolesList: ['Robot'],
  }
  let testUserId: number = NaN
  if (api.isEnterprise) {
    try {
      // ユーザ作成
      let testUser = await api.user.create(user)
      testUserId = testUser.Id

      // 検索する
      testUser = await api.user.find(testUserId)
      logger.info(testUser)

      const expectedName: string = '名前(更新成功)'
      testUser.Name = expectedName

      // 更新をしてみる
      testUser = await api.user.update(testUser)
      // ちなみに、updateは戻り値は空
      logger.info('---')
      logger.info(testUser)
      logger.info('---')

      testUser = await api.user.find(testUserId)
      logger.info(testUser)

    } catch (error) {
      logger.error(error)
    } finally {
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