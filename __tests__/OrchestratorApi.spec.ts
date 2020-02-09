import OrchestratorApi from '../src/index'
// import logger from '../src/logger'

import config from 'config'

const api = new OrchestratorApi(config)

// async function main() {
//   const robot = await api.robot.find(1)
//   robot.Description = 'test3'
//   await api.robot.update(robot)
// }

beforeEach(async () => {
  await api.authenticate()
})

describe('OrchestratorApi のテスト', () => {
  it('license のテスト', async () => {
    // ライセンスを取得する
    const license: any = await api.license.find()
    expect(license.Allowed).not.toBeUndefined()
    expect(license.Used).not.toBeUndefined()
    console.log(license.Allowed)
    console.log(license.Used)
  })

  it('Robot のテスト', async () => {
    // // ロボットを取得する
    const instances: any[] = await api.robot.findAll()
    expect(instances.length).toBeGreaterThanOrEqual(1)

    for (const instance of instances) {
      const robotId: number = instance.Id
      const robot = await api.robot.find(robotId)
      // console.log('RobotId:', robot.Id)
      expect(robot.Id).toBe(robotId)
    }
  })

  describe('User登録テスト', () => {
    const user = {
      Name: 'user002',
      Surname: 'LastName002',
      UserName: 'てすと',
      FullName: 'User002_LastName002',
      EmailAddress: 'masatomix@example.com',
      IsActive: true,
      Password: 'afjlaf#adA0!',
      RolesList: ['Robot'],
      // TenantId: 1,
    }
    it('User登録/更新テスト', async () => {
      try {
        // ユーザ作成
        let testUser = await api.user.create(user)
        const testUserId = testUser.Id
        expect(testUser.UserName).toBe(user.UserName) // 戻り値がテストユーザと同じであること

        const expectedName: string = 'テストさん'
        // 検索する
        testUser = await api.user.find(testUserId)
        testUser.Name = expectedName
        // 更新をしてみる
        testUser = await api.user.update(testUser)
        // updateは戻り値は空
        expect(testUser).toBeUndefined()

        testUser = await api.user.find(testUserId)
        expect(testUser.Name).toBe(expectedName)
      } catch (error) {
        fail(error)
      }
    })

    afterEach(async () => {
      try {
        const result: any[] = await api.user.findByUserName(user.UserName)
        expect(result.length).toBe(1)
        expect(result[0].UserName).toBe(user.UserName)

        await api.user.delete(result[0].Id)
      } catch (error) {
        fail(error)
      }
    })
  })

  it('Machine のテスト', async () => {
    // Machineを取得する
    const instances = await api.machine.findAll()
    expect(instances.length).toBeGreaterThanOrEqual(1)

    for (const instance of instances) {
      // console.log(instance)
      expect(instance.Name).not.toBeUndefined()
    }
  })

  it('Process のテスト', async () => {
    const instances = await api.process.findAll()
    expect(instances.length).toBeGreaterThanOrEqual(0)

    for (const instance of instances) {
      // console.log(instance)
      expect(instance.ProcessKey).not.toBeUndefined()
    }
  })

  it('Schedules のテスト', async () => {
    const instances = await api.schedule.findAll()
    expect(instances.length).toBeGreaterThanOrEqual(0)

    for (const instance of instances) {
      // console.log(instance)
      expect(instance.ReleaseKey).not.toBeUndefined()
    }
  })

  it('汎用メソッド のテスト', async () => {
    const instances = await api.getArray('/odata/Folders')
    expect(instances.length).toBeGreaterThanOrEqual(0)

    for (const instance of instances) {
      // console.log(instance)
      expect(instance.DisplayName).not.toBeUndefined()
    }
  })
})
