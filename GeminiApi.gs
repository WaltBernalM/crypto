class GeminiApi {
  constructor(env) {
    this.env = env
    this.apiKey = this.env.getGeminiApiKey()
    this.apiUrl = this.env.getGeminiApiUrl() + this.apiKey
  }

  getTrendAnalysis(array) {
    try {
      const payload = {
        contents: [{
          parts: [{
            text: `By the trend of profit you're inside the following array, could it be better to sell?
            Array = ${array}.
            Reply solely in JSON structure, nothing else added (remove the "'''json'''" thing), with the following structure: { sell: Boolean, analysis: String }.
            `
          }]
        }]
      }

      const options = {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      }

      const response = UrlFetchApp.fetch(this.apiUrl, options)
      const json = JSON.parse(response.getContentText())

      const responseText = json.candidates[0].content.parts[0].text
      const jsonString = responseText.replace(/```json|```/g, '').trim()
      return JSON.parse(jsonString)
    } catch (e) {
      Logger.log(`GeminiApi.getPrompt() -> Error: ${e.message}`)
      return null
    }
  }
}
