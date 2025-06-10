class EmailService {
  constructor(recipientList, env) {
    this.recipientList = recipientList
    this.recipientListEmails = this.recipientList.getRecipientListEmails()

    this.env = env
    this.sheetLink = this.env.getSheetLink()
  }

  sendByRecipientList(subject, htmlContent) {
    this.recipientListEmails.forEach((recipient) => {
      try {
        MailApp.sendEmail({
          to: recipient,
          subject: subject,
          htmlBody: htmlContent,
        })
        Logger.log(
          `EmailService.sendByRecipientList() -> email sent to ${recipient}`
        )
      } catch (e) {
        Logger.log(`EmailService.sendByRecipientList() -> Error: ${e.message}`)
      }
    })
  }

  sendHTMLEmailCryptoAlert(cryptoType, lowerLimit) {
    Logger.log(
      `EmailService.sendHTMLEmailCryptoAlert(cryptoType=${cryptoType}, lowerLimit=${lowerLimit})`
    )
    const subject = `Alert to sell Crypto: ${cryptoType}`
    const htmlContent = `
      <p>The profit of ${cryptoType} dropped to ${Number(lowerLimit).toFixed(
      2
    )}.</p>
      <p>Please evaluate the option to sell.</p>
      <br/>
      <p>For more details please review <a href='${
        this.sheetLink
      }'>this file</a>.</p>
    `

    this.sendByRecipientList(subject, htmlContent)
  }

  sendHTMLProfitAlert(analysis) {
    Logger.log(`EmailService.sendHTMLProfitAlert(analysis=${analysis})`)
    const subject = `Crypto Profit Analysis`
    const htmlContent = `<p>${analysis}</p>`
    this.sendByRecipientList(subject, htmlContent)
  }
}
