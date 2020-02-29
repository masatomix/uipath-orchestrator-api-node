import log4js from 'log4js'
import config from 'config'

const log4jsConfig = (config as any).log4js

if (log4jsConfig) {
  log4js.configure(log4jsConfig)
} else {
  log4js.configure({
    appenders: { main: { type: 'console' } },
    categories: { default: { appenders: ['main'], level: 'info' } },
  })
}

export default log4js.getLogger('main')
