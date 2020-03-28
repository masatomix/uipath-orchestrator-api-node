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
      expect(instance.DisplayName).not.toBeUndefined()
    }
  })

  it('GetLicenseStats のテスト', async () => {
    const isOData = false
    const instances = await api.getArray('/api/Stats/GetLicenseStats', { tenantId: 1, days: 100 }, isOData)
    console.log('GetLicenseStats(Gets the licensing usage statistics)')
    // ┌─────────┬───────────┬───────┬───────────────────────┐
    // │ (index) │ robotType │ count │       timestamp       │
    // ├─────────┼───────────┼───────┼───────────────────────┤
    // │    0    │     3     │   1   │ '2019-11-26T00:00:00' │
    // │    1    │     3     │   1   │ '2019-12-01T00:00:00' │
    // │    2    │     3     │   1   │ '2019-12-02T00:00:00' │
    // │    3    │     3     │   1   │ '2019-12-18T00:00:00' │
    // │    4    │     3     │   2   │ '2019-12-19T00:00:00' │
    // │    5... │     3     │   1   │ '2019-12-20T00:00:00' │
    // │   40    │     3     │   1   │ '2020-02-21T00:00:00' │
    // │   41    │     3     │   1   │ '2020-02-22T00:00:00' │
    // └─────────┴───────────┴───────┴───────────────────────┘
    console.table(instances)
  })

  it('GetCountStats のテスト', async () => {
    const isOData = false
    const instances = await api.getArray('/api/Stats/GetCountStats', {}, isOData)
    console.log(
      'GetCountStats(Returns the name and the total number of entities registered in Orchestrator for a set of entities.)',
    )
    // ┌─────────┬─────────────┬───────┬────────────────┐
    // │ (index) │    title    │ count │ hasPermissions │
    // ├─────────┼─────────────┼───────┼────────────────┤
    // │    0    │ 'Processes' │   0   │      true      │
    // │    1    │  'Assets'   │   0   │      true      │
    // │    2    │  'Queues'   │   3   │      true      │ Queue定義自体の数
    // │    3    │ 'Schedules' │   0   │      true      │
    // └─────────┴─────────────┴───────┴────────────────┘
    console.table(instances)
  })

  it('GetSessionsStats のテスト', async () => {
    const isOData = false
    const instances = await api.getArray('/api/Stats/GetSessionsStats', {}, isOData)
    console.log(
      'GetSessionsStats(Returns the total number of Available, Busy, Disconnected and Unresponsive robots respectively. )',
    )
    // ┌─────────┬────────────────┬───────┬────────────────┐
    // │ (index) │     title      │ count │ hasPermissions │
    // ├─────────┼────────────────┼───────┼────────────────┤
    // │    0    │  'Available'   │   0   │      true      │
    // │    1    │     'Busy'     │   0   │      true      │
    // │    2    │ 'Disconnected' │   2   │      true      │
    // │    3    │ 'Unresponsive' │   1   │      true      │
    // └─────────┴────────────────┴───────┴────────────────┘
    console.table(instances)
  })

  it('GetJobsStats のテスト', async () => {
    const isOData = false
    const instances = await api.getArray('/api/Stats/GetJobsStats', {}, isOData)
    console.log('GetJobsStats(Returns the total number of Successful, Faulted and Canceled jobs respectively.)')
    // ┌─────────┬──────────────┬───────┬────────────────┐
    // │ (index) │    title     │ count │ hasPermissions │
    // ├─────────┼──────────────┼───────┼────────────────┤
    // │    0    │ 'Successful' │ 9541  │      true      │
    // │    1    │  'Faulted'   │ 2372  │      true      │
    // │    2    │  'Stopped'   │  10   │      true      │
    // └─────────┴──────────────┴───────┴────────────────┘
    console.table(instances)
  })
})
