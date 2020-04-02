import { IOrchestratorApi } from '../IOrchestratorApi'
import { BaseCrudService } from '..'
import { getArray, getData, putData, postData, deleteData } from '../utils'
import { IRoleCrudService } from '../Interfaces'

export class RoleCrudService extends BaseCrudService implements IRoleCrudService {
  constructor(parent: IOrchestratorApi) {
    super(parent)
  }
  findAll(queries?: any, asArray: boolean = true): Promise<Array<any>> {
    return getArray(this.parent.config, this.parent.accessToken, '/odata/Roles', queries, asArray)
  }

  find(id: number): Promise<any> {
    return getData(this.parent.config, this.parent.accessToken, `/odata/Roles(${id})`)
  }

  findDetail(...keys: string[]): (...methods: ('' | 'View' | 'Edit' | 'Create' | 'Delete')[]) => Promise<Array<any>> {
    return async (...methods: ('' | 'View' | 'Edit' | 'Create' | 'Delete')[]): Promise<Array<any>> => {
      // まずは条件で検索
      const apiResults: any[] = await this.parent.getArray(`/odata/Permissions`)

      let filterResults = apiResults
      if (keys.length > 0) {
        const tmpResults = keys // keyごとにFilterして
          .map(key => apiResults.filter(apiResult => (apiResult.Name as string).startsWith(key)))
          .reduce((accumulator, current) => {
            accumulator.push(...current) // 配列同士を結合
            return accumulator
          }, [])
        const resultSet = new Set(tmpResults) //ココで重複を除去
        // 最後は配列に戻して完成
        filterResults = Array.from(resultSet)
      }

      if (methods.length === 0) {
        console.log('引数なし')
        return filterResults
      }
      return filterResults.filter(filterResult => {
        for (const method of methods) {
          if (method === '') {
            if (!(filterResult.Name as string).includes('.')) {
              return true
            }
          } else {
            if ((filterResult.Name as string).includes(method)) {
              return true
            }
          }
        }
        return false
      })
    }
  }

  // _findByUserName(userName: string): Promise<Array<any>> {
  //   return this.findAll({ $filter: `UserName eq '${userName}'` })
  // }

  // async findByUserName(userName: string): Promise<any> {
  //   const users: any[] = await this._findByUserName(userName)
  //   return users[0]
  // }

  update(role: any): Promise<any> {
    return putData(this.parent.config, this.parent.accessToken, `/odata/Roles(${role.Id})`, role)
  }

  create(role: any): Promise<any> {
    return postData(this.parent.config, this.parent.accessToken, '/odata/Roles', role)
  }

  delete(id: number): Promise<any> {
    return deleteData(this.parent.config, this.parent.accessToken, `/odata/Roles(${id})`)
  }
}
