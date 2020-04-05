import OrchestratorApi from '../src/index'

import config from 'config'

describe('OrchestratorApi_library', () => {
  const api = new OrchestratorApi(config)

  beforeEach(async () => {
    await api.authenticate()
  })

  it('Libraryのテスト', async () => {
    try {
      const instances = await api.library.findAll()
      expect(instances.length).toBeGreaterThanOrEqual(1)
      for (const instance of instances) {
        expect(instance.Key).not.toBeUndefined()
      }
      api.library.save2Excel(instances, './libraries.xlsx')
    } catch (error) {
      console.error(error)
    }
  })
})
