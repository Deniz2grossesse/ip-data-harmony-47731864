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