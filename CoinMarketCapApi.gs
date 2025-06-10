class CoinMarketCapApi {
  constructor(env) {
    this.env = env
    this.apiUrl = env.getCoinMarketApiUrl()
    this.apiKey = env.getCoinMarketApiKey()
  }

  getCryptoMxnPrices() {
    try {
      const options = {
        method: 'get',
        headers: { 'X-CMC_PRO_API_KEY': this.apiKey },
        muteHttpExceptions: true
      }

      const response = UrlFetchApp.fetch(this.apiUrl, options)
      const data = (JSON.parse(response.getContentText())).data

      const {
        BTC: { quote: { MXN : { price: btcMxnPrice } } },
        ETH: { quote: { MXN : { price: ethMxnPrice } } }
      } = data

      Logger.log(`CoinMarketCapApi.getCryptoMxnPrices() -> BTC=${Number(btcMxnPrice).toFixed(2)}, ETH=${Number(ethMxnPrice).toFixed(2)}`)

      return { btcMxnPrice, ethMxnPrice }
    } catch(e) {
      Logger.log(`CoinMarketCapApi.getCryptoMxnPrices() -> Error: ${e.message}`)
      return null
    }
  }
}