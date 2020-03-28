import Logger from 'bunyan'
import config from 'config'

export const getLogger = function(name: string): Logger {
  const conf = config as any
  if (conf['logging']) {
    const settings: Array<any> = conf['logging']
    const targets = settings.filter(setting => setting.name === name)

    if (targets && targets.length > 0) {
      const logger = Logger.createLogger(targets[0])
      logger.info(`[ ${name} ] のログをココに出力します。`)
      return logger
    }
  }
  const nullLogger = Logger.createLogger({
    name: name,
    level: 'error',
  })
  return nullLogger
}
