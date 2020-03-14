import config from 'config'
import OrchestratorApi from '../../index'

async function main() {
  const api = new OrchestratorApi(config)

  try {
    // まずは認証
    await api.authenticate()

    let instances: any[] = []

    // まずは全件検索
    instances = await api.setting.findAll()
    console.log('全件')
    console.table(instances)

    // キーで検索することもできます。
    instances = await api.setting.findByKey()('Alerts.Email.Enabled', 'Abp.Timing.TimeZone', 'Abp.Net.Mail.Smtp.Host')
    console.log('キー検索')
    console.table(instances)

    // ちなみに、前方一致です。
    instances = await api.setting.findByKey()('Abp.Net.Mail')
    console.log('前方一致検索結果')
    console.table(instances)

    // 結果をExcelに保存します。
    await api.setting.save2Excel(instances, 'settings.xlsx')

    // そのExcelから、設定情報を読み込んでみます。
    instances = await api.setting.readSettingsFromFile('settings.xlsx')
    console.log('Excel読み込み結果')
    console.table(instances)

    // 一行選択して、サーバの設定を変更してみます。()
    instances = await api.setting.findByKey()('Abp.Net.Mail.Smtp.Domain')
    console.log('更新前の値')
    console.table(instances)

    // 更新処理
    instances[0].Value = 'example.com'
    await api.setting.update(instances)

    instances = await api.setting.findByKey()('Abp.Net.Mail.Smtp.Domain')
    console.log('更新後の値')
    console.table(instances)

    // // 参考: 可変長引数へ配列を渡すやりかた。
    // const keys = ['Alerts.Email.Enabled', 'Abp.Timing.TimeZone', 'Abp.Net.Mail.Smtp.Host']
    // instances = await api.setting.findByKey()(...keys)
    // console.table(instances)
  } catch (error) {
    console.log(error)
  }
}

if (!module.parent) {
  (async () => {
    await main()
  })()
}
