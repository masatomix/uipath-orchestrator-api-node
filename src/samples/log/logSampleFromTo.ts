import config from 'config'
import OrchestratorApi from '../../index'
import logger from '../../logger'

async function sample() {
  const api = new OrchestratorApi(config)
  await api.authenticate()
  try {
    let from = '2020-03-02T13:45:20Z' // UTC指定でリクエスト。JST(日本時間)で+9h、つまり22:45 のログを検索する
    let to = '2020-03-02T13:45:24Z' // UTC指定でリクエスト
    printLog(api, new Date(from), new Date(to))

    // もしくは UTCなどを指定しない場合は、実行環境のTimeZoneが使われる(つまり日本時間で検索する)
    from = '2020/03/02 00:00' // JavaScriptのDate関数はこれくらいの表記揺れは対応可能ってことか
    to = '2020-03-03 00:00' // JavaScriptのDate関数はこれくらいの表記揺れは対応可能ってことか
    printLog(api, new Date(from), new Date(to))

    // ただしこう指定すると、どうやらUTCの3/2 0時〜3/3 0時となり、結果日本時間で
    // 3/2 9:00〜3/3 9:00 となるのでご注意
    from = '2020-03-02'
    to = '2020-03-03'
    printLog(api, new Date(from), new Date(to))

    // さらにこう指定すれば、どうやらJSTの3/2 0時〜3/3 0時となり、結果日本時間で
    // 3/2 0:00〜3/3 9:00 となるのでご注意
    from = '2020/03/02'
    to = '2020/03/03'
    printLog(api, new Date(from), new Date(to))

    // ちなみに実際にOCに渡される値はそれぞれ、以下の通りでした！

    //from: 2020-03-02T13:45:20.000Z
    //  to: 2020-03-02T13:45:24.000Z

    //from: 2020-03-01T15:00:00.000Z
    //  to: 2020-03-02T15:00:00.000Z

    //from: 2020-03-02T00:00:00.000Z
    //  to: 2020-03-03T00:00:00.000Z

    //from: 2020-03-01T15:00:00.000Z
    //  to: 2020-03-02T15:00:00.000Z

    // ちなみにプログラムが中でやってることは、ほぼ下記と等価
    // const fromUTC = new Date(from).toISOString()
    // const toUTC = new Date(to).toISOString()
    // logs = await api.log.findAll({
    //   $filter: `TimeStamp ge ${fromUTC} and TimeStamp lt ${toUTC}`,
    // })
  } catch (error) {
    logger.error(error)
  }
}

async function printLog(api: OrchestratorApi, from: Date, to: Date) {
  // 渡したFrom/Toでフィルタリングかつトップ5件を表示
  const logs: any[] = await api.log.findByFilter({ from: from, to: to }, { $top: 5 })
  console.log(logs[0])

  logs.map(log => delete log.RawMessage) // 表で出力するとき RawMessage ちょっとジャマなので削除

  console.table(logs)
  console.log(`${logs.length} 件でした`)
}

if (!module.parent) {
  (async () => {
    await sample()
  })()
}
