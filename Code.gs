function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Gestionnaire de Règles Réseau')
      .setFaviconUrl('https://www.google.com/images/icons/product/sheets-32.png');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}