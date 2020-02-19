import OrchestratorApi from '../src/index'
// import logger from '../src/logger'

import config from 'config'

// async function main() {
//   const robot = await api.robot.find(1)
//   robot.Description = 'test3'
//   await api.robot.update(robot)
// }

describe('OrchestratorApi', () => {
  const api = new OrchestratorApi(config)

  beforeEach(async () => {
    await api.authenticate()
  })

  describe('license/Robot/User/Machine/Process/Schedules... のテスト', () => {
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
    it('Robot のテスト', async () => {
      // // ロボットを取得する
      const machinename = 'PBPC0124'
      const username = 'pb\\pbkino'
      const instances: any[] = await api.robot.findAll({
        $filter: `MachineName eq '${machinename}' and Username eq '${username}'`,
      })
      expect(instances.length).toBeGreaterThanOrEqual(1)

      for (const instance of instances) {
        // console.log(instance)
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
      if (api.isEnterprise) {
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
            console.log('Community版の場合は失敗するかもしれない')
            fail(error)
          }
        })
      } else {
        console.log('Community版のため、スキップ')
      }

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

  })

  describe('Enterprise判別テスト。と認証エラー系', () => {
    const api2 = new OrchestratorApi({
      userinfo: {
        tenancyName: 'default',
        usernameOrEmailAddress: 'aaa',
        password: 'bbb',
      },
      serverinfo: {
        servername: 'https://platform.uipath.com/', // ホントはEnterprise サーバでやるべきだけど気にしない
      },
    })

    it('Enterprise判別テスト。', async () => {
      expect(api2.isEnterprise).toBe(true)
      expect(api2.isCommunity).toBe(false)
    })

    it('認証エラーになることのテスト', async () => {
      try {
        await api2.authenticate()
        fail('認証エラーが発生せず')
      } catch (error) {
        expect(error.errorCode).toBe(1000)
        expect(error.message).toBe('Invalid credentials, failed to login.')
      }
    })
  })

  describe('Community判別テスト。と認証エラー系', () => {
    const api2 = new OrchestratorApi({
      serverinfo: {
        servername: 'https://platform.uipath.com/kinooqmollho/kinoorgDefault',
        refresh_token: 'xxx', // User Key
        tenant_logical_name: 'kinoorgxx',
        client_id: 'xxxx',
      },
    })

    it('Community判別テスト。', async () => {
      expect(api2.isCommunity).toBe(true)
      expect(api2.isEnterprise).toBe(false)
    })

    it('認証エラーになることのテスト', async () => {
      try {
        await api2.authenticate()
        fail('認証エラーが発生せず')
      } catch (error) {
        expect(error.error).toBe('access_denied')
        expect(error.error_description).toBe('Unauthorized')
      }
    })
  })

  describe('Robot判別テスト1。', () => {
    const api2 = new OrchestratorApi({
      robotInfo: {
        machineKey: 'xx',
        machineName: 'bbbb',
        userName: 'xxx',
      },
      userinfo: {
        tenancyName: 'default',
        usernameOrEmailAddress: 'aaa',
        password: 'bbb',
      },
      serverinfo: {
        servername: 'https://platform.uipath.com/', // ホントはEnterprise サーバでやるべきだけど気にしない
      },
    })

    it('Robot判別テスト。', async () => {
      expect(api2.isEnterprise).toBe(true)
      expect(api2.isCommunity).toBe(false)
      expect(api2.isRobot).toBe(true)
    })
  })

  describe('Robot判別テスト2.', () => {
    const api2 = new OrchestratorApi({
      robotInfo: {
        machineKey: 'xx',
        machineName: 'bbbb',
        userName: 'xxx',
      },
      serverinfo: {
        servername: 'https://platform.uipath.com/kinooqmollho/kinoorgDefault',
        refresh_token: 'xxx', // User Key
        tenant_logical_name: 'kinoorgxx',
        client_id: 'xxxx',
      },
    })

    it('Robot判別テスト2', async () => {
      expect(api2.isCommunity).toBe(true)
      expect(api2.isEnterprise).toBe(false)
      expect(api2.isRobot).toBe(true)
    })
  })
})
