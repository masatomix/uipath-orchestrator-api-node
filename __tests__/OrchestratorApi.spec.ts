import OrchestratorApi from '../src/index'

import config from 'config'

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

    it('Release のテスト', async () => {
      const instances = await api.release.findAll()
      expect(instances.length).toBeGreaterThanOrEqual(0)

      for (const instance of instances) {
        // console.log(instance)
        expect(instance.Id).not.toBeUndefined()
        expect(instance.Key).not.toBeUndefined()
        expect(instance.ProcessKey).not.toBeUndefined()
      }
    })

    it('Process のテスト', async () => {
      const instances = await api.process.findAll()
      expect(instances.length).toBeGreaterThanOrEqual(0)

      for (const instance of instances) {
        // console.log(instance)
        expect(instance.Id).not.toBeUndefined()
        expect(instance.IsActive).not.toBeUndefined()
        expect(instance.Version).not.toBeUndefined()
        expect(instance.Key).not.toBeUndefined()
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
