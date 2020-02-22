import OrchestratorApi from '../src/index'

import config from 'config'

describe('OrchestratorApi_general', () => {
  const api = new OrchestratorApi(config)

  beforeEach(async () => {
    await api.authenticate()
  })

  it('Foldersのテスト', async () => {
    const instances = await api.getArray('/odata/Folders')
    expect(instances.length).toBeGreaterThanOrEqual(0)

    for (const instance of instances) {
      // console.log(instance)
      expect(instance.DisplayName).not.toBeUndefined()
    }
  })

  it('GetLicenseStats のテスト', async () => {
    const isOData = false
    const instances = await api.getArray(
      '/api/Stats/GetLicenseStats',
      { tenantId: 1, days: 100 },
      isOData,
    )
    console.table(instances)
  })

  it('GetCountStats のテスト', async () => {
    const isOData = false
    const instances = await api.getArray('/api/Stats/GetCountStats', isOData)
    console.table(instances)
  })

  it('GetSessionsStats のテスト', async () => {
    const isOData = false
    const instances = await api.getArray('/api/Stats/GetSessionsStats', isOData)
    console.table(instances)
  })
  it('GetJobsStats のテスト', async () => {
    const isOData = false
    const instances = await api.getArray('/api/Stats/GetJobsStats', isOData)
    console.table(instances)
  })
})
