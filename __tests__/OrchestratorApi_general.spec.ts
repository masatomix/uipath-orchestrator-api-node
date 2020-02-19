import OrchestratorApi from '../src/index'

import config from 'config'



describe('OrchestratorApi_general', () => {
  const api = new OrchestratorApi(config)

  beforeEach(async () => {
    await api.authenticate()
  })

  describe('OrchestratorApi のテスト', () => {
    it('汎用メソッド のテスト', async () => {
      const instances = await api.getArray('/odata/Folders')
      expect(instances.length).toBeGreaterThanOrEqual(0)

      for (const instance of instances) {
        // console.log(instance)
        expect(instance.DisplayName).not.toBeUndefined()
      }
    })
  })

  it('汎用メソッド のテスト', async () => {
    const isOData = false
    const instances = await api.getArray('/api/Stats/GetLicenseStats',
      { 'tenantId': 1, days: 100 }, isOData)
    console.table(instances)
  })

})
