class History {
  constructor(coinMarketCapApi, emailService, geminiApi) {
    this.sheetName = 'HISTORY'
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.sheetName)
    this.coinMarketCapApi = coinMarketCapApi
    this.emailService = emailService
    this.geminiApi = geminiApi

    this.threshold = 288 * 3 // = 864 * 5 = 4,320 / 60 = 72h 

    this.analysisThreshold = 288 * 7 // = 168h = 7 days
  }

  addCryptoMxnPrice(cryptoMxnPrices) {
    try {
      const now = new Date()
      const {
        btcMxnPrice,
        ethMxnPrice
      } = cryptoMxnPrices ? cryptoMxnPrices : this.coinMarketCapApi.getCryptoMxnPrices()
      Logger.log(`History.addCryptoMxnPrice(cryptoMxnPrices={btcMxnPrice:${btcMxnPrice}, ethMxnPrice:${ethMxnPrice}})`)
      const lastRow = this.sheet.getLastRow() + 1
      const newRowValues = this.buildHistoryRow(now, btcMxnPrice, ethMxnPrice, lastRow)

      this.sheet.insertRowAfter(lastRow - 1)
      this.sheet.getRange(lastRow, 1, 1, newRowValues[0].length).setValues(newRowValues)
      Logger.log(`History.addCryptoMxnPrice() -> New row at ${lastRow} with new values added`)

      const btcProfitMxn = this.sheet.getRange(`N${lastRow}`).getValue()
      const btcProfitMin = this.sheet.getRange(`Y${lastRow}`).getValue()
      this.sendAlertToSell('BTC', btcProfitMxn, btcProfitMin)

      const ethProfitMxn = this.sheet.getRange(`O${lastRow}`).getValue()
      const ethProfitMin = this.sheet.getRange(`AA${lastRow}`).getValue()
      this.sendAlertToSell('ETH', ethProfitMxn, ethProfitMin)

      this.analyzeTrend(lastRow, now)
    } catch (e) {
      Logger.log(`History.addCryptoMxnPrice() -> Error: ${e.message}`)
    }
  }

  buildHistoryRow(date, btcMxnPrice, ethMxnPrice, lastRow) {
    const time = `=A${lastRow}`
    const btcRawWallet = `=IF($A${lastRow}="","",B${lastRow}*SUMIFS(LEDGER!$D:$D, LEDGER!$C:$C, "BTC", LEDGER!$A:$A, "<=" & $A${lastRow}))`
    const ethRawWallet = `=IF($A${lastRow}="","",C${lastRow}*SUMIFS(LEDGER!$D:$D, LEDGER!$C:$C, "ETH", LEDGER!$A:$A, "<=" & $A${lastRow}))`
    const btcComission = `=E${lastRow}*-0.015 + E${lastRow}*-0.0075`
    const ethComission = `=F${lastRow}*-0.015 + F${lastRow}*-0.0075`
    const btcWallet = `=SUM(E${lastRow},G${lastRow})`
    const ethWallet = `=SUM(F${lastRow},H${lastRow})`
    const wallet = `=SUM(I${lastRow}:J${lastRow})`
    const btcInv = `=IF($A${lastRow}="","",SUMIFS(LEDGER!$B:$B, LEDGER!$C:$C, "BTC", LEDGER!$A:$A, "<=" & $A${lastRow}))`
    const ethInv = `=IF($A${lastRow}="","",SUMIFS(LEDGER!$B:$B, LEDGER!$C:$C, "ETH", LEDGER!$A:$A, "<=" & $A${lastRow}))`
    const btcProfit = `=SUM(E${lastRow},G${lastRow},L${lastRow})`
    const ethProfit = `=SUM(F${lastRow},H${lastRow},M${lastRow})`
    const profit = `=SUM(N${lastRow}:O${lastRow})`
    const inv = `=ABS(SUM(L${lastRow},M${lastRow}))`
    const profitMax = `=MAX($P$2:$P${lastRow})`
    const profitMin = `=MIN($P$2:$P${lastRow})`
    const profitAverage = lastRow > this.threshold
      ? `=AVERAGE($P${lastRow - (this.threshold - 1)}:$P${lastRow})`
      : `=AVERAGE($P$2:$P${lastRow})`
    const balance = `=SUM(Q${lastRow},P${lastRow})`
    const btcProfitAverage = lastRow > this.threshold
      ? `=AVERAGE($N${lastRow - (this.threshold - 1)}:N${lastRow})`
      : `=AVERAGE($N$2:N${lastRow})`

    const ethProfitAverage = lastRow > this.threshold
      ? `=AVERAGE($O${lastRow - (this.threshold - 1)}:O${lastRow})`
      : `=AVERAGE($O$2:O${lastRow})`
    const btcProfitMax = `=MAX($N$2:$N${lastRow})`
    const btcProfitMin = `=MIN($N$2:$N${lastRow})`
    const ethProfitMax = `=MAX($O$2:$O${lastRow})`
    const ethProfitMin = `=MIN($O$2:$O${lastRow})`
    const btcMax = `=MAX($B$2:$B$${lastRow})`
    const btcMin = `=MIN($B$2:$B$${lastRow})`
    const ethMax = `=MAX($C$2:$C$${lastRow})`
    const ethMin = `=MIN($C$2:$C$${lastRow})`

    return [[
      date, btcMxnPrice, ethMxnPrice, time, btcRawWallet, ethRawWallet,
      btcComission, ethComission, btcWallet, ethWallet, wallet,
      btcInv, ethInv, btcProfit, ethProfit, profit, inv, profitMax, profitMin,
      profitAverage, balance, btcProfitAverage, ethProfitAverage,
      btcProfitMax, btcProfitMin, ethProfitMax, ethProfitMin,
      btcMax, btcMin, ethMax, ethMin
    ]]
  }

  sendAlertToSell(cryptoType, profit, lowerLimit) {
    Logger.log(`History.sendAlertToSell(cryptoType=${cryptoType}, profit=${profit}), lowerLimit=${lowerLimit}`)

    if (profit === 0) {
      Logger.log(`History.sendAlertToSell() -> No need to sell ${cryptoType}, profit is zero`)
      return
    }

    return profit < lowerLimit
      ? this.emailService.sendHTMLEmailCryptoAlert(cryptoType, lowerLimit)
      : Logger.log(`History.sendAlertToSell() -> No need to sell ${cryptoType}, profit ($${profit}) > ${Number(lowerLimit).toFixed(2)}`)
  }

  analyzeTrend(lastRow, date) {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const seconds = (hours * 3600) + (minutes * 60)

    Logger.log(`hours=${hours}, minutes=${minutes}`)
    if (seconds > 360) {
      Logger.log(`History.analyzeTrend() -> Bypassed (${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')})`)
      return
    }

    const profitArray = (this.sheet.getRange(`S${lastRow - (this.analysisThreshold - 1)}:S${lastRow}`).getValues()).flat()
    const analysisResult = this.geminiApi.getTrendAnalysis(profitArray)
    const { sell, analysis } = analysisResult

    if (!sell) {
      return
    }
    this.emailService.sendHTMLProfitAlert(analysis)
  }
}



