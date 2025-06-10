class Env {
  constructor() {
    this.sheetName = 'ENV'
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.sheetName)
    
    this.sheetLinkId = 'SHEET_LINK'
    this.coinMarketApiUrlId = 'COIN_MARKET_API_URL'
    this.coinMarketApiKeyId = 'COIN_MARKET_API_KEY'
    this.geminiApiUrlId = 'GEMINI_API_URL'
    this.geminiApiKeyId = 'GEMINI_API_KEY'
  }

  findValueBy(id) {
    return this.sheet.getDataRange().getValues().find(row => row[0] === id)[1]
  }

  getSheetLink() {
    return this.findValueBy(this.sheetLinkId)
  }

  getCoinMarketApiUrl() {
    return this.findValueBy(this.coinMarketApiUrlId)
  }

  getCoinMarketApiKey() {
    return this.findValueBy(this.coinMarketApiKeyId)
  }

  getGeminiApiUrl() {
    return this.findValueBy(this.geminiApiUrlId)
  }

  getGeminiApiKey() {
    return this.findValueBy(this.geminiApiKeyId)
  }
}
