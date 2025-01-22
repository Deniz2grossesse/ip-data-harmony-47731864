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
  const data = sheet.getRange(12, 4, 200, 12).getValues(); // Commence à la ligne 12, colonne D
  const rules = [];
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[0] && row[3]) { // Vérifie si source IP (colonne D) et destination IP (colonne G) existent
      rules.push({
        sourceIp: row[0],      // Colonne D
        destinationIp: row[3], // Colonne G
        protocol: row[4],      // Colonne H
        service: row[5],       // Colonne I
        port: row[6]          // Colonne J
      });
    }
  }
  
  return rules;
}