import log4js from 'log4js'

log4js.configure({
    appenders: { main: { type: 'file', filename: './logs/main.log', 'pattern': '-yyyy-MM-dd' } },
    categories: { default: { appenders: ['main'], level: 'trace' } }
})

const logger: any = {}
logger.main = log4js.getLogger('main')

export default logger