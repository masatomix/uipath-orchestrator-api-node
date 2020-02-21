import OrchestratorApi from '../index'


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

