import log4js from 'log4js'
import config from 'config'

// const log4jsConfig: Configuration = config.get('log4js')
const log4jsConfig = (config as any).log4js


if (log4jsConfig) {
  log4js.configure(log4jsConfig)
} else {
  log4js.configure({
    appenders: { main: { type: 'console' } },
    categories: {
      default: { appenders: ['main'], level: 'info' },
      // http: { appenders: ['main'], level: 'debug' },
    },
  })
}

export const httpLogger = log4js.getLogger('http')
httpLogger.info('ココにHTTPのログを出力します。')

const mainLogger = log4js.getLogger()
mainLogger.info('ココにMainのログを出力します。')
export default mainLogger
