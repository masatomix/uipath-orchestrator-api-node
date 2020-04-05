import OrchestratorApi from '../src/index'
import { randomName } from '../src/samples/sampleUtils'
import config from 'config'
import { getLogger } from '../src/logger'

const logger = getLogger('main')

describe('OrchestratorApi_user', () => {
  const api = new OrchestratorApi(config)

  let testUserId: number

  beforeEach(async () => {
    await api.authenticate()
    testUserId = NaN
  })

  it('ユーザの登録・検索・更新・削除のテスト', async () => {
    jest.setTimeout(10000)
    const random = randomName('user_')

    if (api.isEnterprise) {
      try {
        const expectedUser = {
          Name: 'user001',
          Surname: 'LastName001',
          UserName: `${random}`,
          // FullName: 'User LastName',
          EmailAddress: `${random}@example.com`,
          IsActive: true,
          Password: 'afjlaf#adA0!',
          RolesList: ['Robot'],
        }

        // サンプル ユーザ登録
        const createdUser = await api.user.create(expectedUser)
        testUserId = createdUser.Id
        assertEqualsUser(expectedUser, createdUser)

        // サンプル ユーザ検索
        const findUser = await api.user.find(testUserId)
        assertEqualsUser(expectedUser, findUser)

        const expectedName: string = '名前(更新成功)'
        findUser.Name = expectedName

        // サンプル ユーザの更新
        const updatedUser = await api.user.update(findUser)
        // ちなみに、updateは戻り値は空
        expect(updatedUser).toBeUndefined()

        // そのユーザが検索できて、変更されていることを確認
        const actualUser4 = await api.user.find(findUser.Id)
        assertEqualsUser2(findUser, actualUser4)
      } catch (error) {
        logger.error({ objects: error })
        fail(error)
      } finally {
        // ユーザ削除
        await api.user.delete(testUserId)
      }
    } else {
      console.log('Community版のため、スキップ')
    }
  })
})

const assertEqualsUser = (expected: any, actual: any) => {
  const expectedFields = Object.assign({}, expected, {
    IsActive: true,
    Type: 'User',
    FullName: `${expected.Name} ${expected.Surname}`,
    Password: null,
  })

  const actualFields = {
    Name: actual.Name,
    Surname: actual.Surname,
    UserName: actual.UserName,
    FullName: actual.FullName,
    EmailAddress: actual.EmailAddress,
    RolesList: actual.RolesList,
    IsActive: actual.IsActive,
    Type: actual.Type,
    Password: actual.Password,
  }
  expect(actualFields).toEqual(expectedFields)
}

const assertEqualsUser2 = (expected: any, actual: any) => {
  // フルネームは勝手に更新されるみたいなので。期待値も変更。
  expected.FullName = `${expected.Name} ${expected.Surname}`
  expect(actual).toEqual(expected)
}
