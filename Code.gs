function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Gestionnaire de Règles Réseau')
      .setFaviconUrl('https://www.google.com/images/icons/product/sheets-32.png');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function saveData(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    data.forEach(row => {
      sheet.appendRow([
        row.sourceIp,
        row.destinationIp,
        row.protocol,
        row.port
      ]);
    });
    return { success: true, message: "Données enregistrées avec succès" };
  } catch (error) {
    return { success: false, message: "Erreur lors de l'enregistrement: " + error.toString() };
  }
}