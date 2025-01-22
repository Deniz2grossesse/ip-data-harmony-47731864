function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Network Rules Manager')
    .setFaviconUrl('https://www.google.com/images/favicon.ico');
}

function showNetworkRulesUI() {
  const html = HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Network Rules Manager')
    .setWidth(1000)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Gestionnaire de règles réseau');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function showTopologyView() {
  const html = HtmlService.createTemplateFromFile('topology')
    .evaluate()
    .setTitle('Vue Topologique')
    .setWidth(1000)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'Vue Topologique du Réseau');
}

function getNetworkRules() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const rules = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[1]) { // Vérifie si source IP et destination IP existent
      rules.push({
        sourceIp: row[0],
        destinationIp: row[1],
        protocol: row[2],
        service: row[3],
        port: row[4]
      });
    }
  }
  
  return rules;
}