import OrchestratorApi from '../index'
import path from 'path'
import fs from 'fs'
import request from 'request'

export function createMachine(machineName: string, api_: OrchestratorApi) {
  return api_.machine.create({ Name: machineName }) // 登録する
}

export const randomName = (prefix?: string): string => {
  if (prefix) {
    return prefix + randomValue()
  } else {
    return randomValue()
  }
}

const randomValue = (): string => {
  const length: number = 4
  const random: string = Math.floor(Math.random() * 1000).toString()
  return ('0'.repeat(length) + random).slice(-length)
}

// マシン名、ロボット名、そのWindowsアカウントとも一意になる任意の名称RobotのObjを作成するメソッド。
export function createRobotData(testMachine: any) {
  const random = randomName()
  return {
    MachineName: testMachine.Name, // 取得したマシン名
    LicenseKey: testMachine.LicenseKey, // 取得したライセンスキー
    Name: `${randomName('test_')}_${random}`, // ランダム値
    Username: `xx\\xxxx_${random}`, // ランダム値
    Type: 'Development', //未指定だとNonProduction
    // RobotEnvironments: ''
  }
}

export const downloadFile = (url: string): Promise<string> => {
  const option = {
    uri: url,
    method: 'GET',
    encoding: null,
  }
  return new Promise((resolve, reject) => {
    request(option, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        fs.writeFileSync(path.basename(url), body, 'binary')
        resolve(path.basename(url))
      } else {
        reject(error)
      }
    })
  })
}
