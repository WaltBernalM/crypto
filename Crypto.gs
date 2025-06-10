class Crypto {
  constructor() {
    this.env = new Env()
    this.recipientList = new RecipientList()
    this.coinMarketCapApi = new CoinMarketCapApi(this.env)
    this.emailService = new EmailService(this.recipientList, this.env)
    this.geminiApi = new GeminiApi(this.env)
    this.history = new History(this.coinMarketCapApi, this.emailService, this.geminiApi)
  }

  setCryptoMxnPrices() {
    this.history.addCryptoMxnPrice()
  }
}
