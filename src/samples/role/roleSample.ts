import config from 'config'
import OrchestratorApi from '../../index'
// import { randomName } from '../sampleUtils'

async function sample() {
  const api = new OrchestratorApi(config)
  // まずは認証
  await api.authenticate()

  const roles = await api.role.findAll()
  console.table(roles)

  for (const role of roles) {
    const results = await api.getArray(
      `/odata/Roles/UiPath.Server.Configuration.OData.GetUserIdsForRole(key=${role.Id})`,
    )
    console.log(`${role.Name} RoleをもつユーザId:`)
    console.table(results)
  }

  // for (const role of roles) {
  //   const results = await api.getArray(`/odata/Roles/UiPath.Server.Configuration.OData.GetUsersForRole(key=${role.Id})`)
  //   console.log(`${role.Name} Roleをもつユーザ:`)
  //   console.table(results)
  // }

  // let r = await api.role.findDetail('Libraries', 'MLLogs')('', 'Delete')
  // console.table(r)
  // r = await api.role.findDetail()('Delete')
  // await api.role.findDetail()
  // console.table(r)

  let r = await api.role.findDetail()('')
  console.table(r)
}

if (!module.parent) {
  ;(async () => {
    await sample()
  })()
}
