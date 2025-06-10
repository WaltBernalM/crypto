class RecipientList {
  constructor() {
    this.sheetName = 'RECIPIENT_LIST'
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(this.sheetName)
  }

  getRecipientListEmails() {
    return this.sheet.getDataRange().getValues().flat()
  }
}
