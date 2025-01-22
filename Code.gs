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
  
  // Message de scan
  SpreadsheetApp.getUi().alert('Scan en cours depuis la ligne 12...');
  
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
  
  // Message de fin de scan
  SpreadsheetApp.getUi().alert('Scan effectué, la topologie va s\'afficher');
  
  return rules;
}

function downloadPowerShellScript() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const ui = SpreadsheetApp.getUi();
  
  // Afficher le message
  ui.alert('Auto NES génère les scripts de tests');
  
  // Récupérer les règles
  const rules = getNetworkRules();
  
  // Effacer les anciennes données dans les colonnes A et B
  sheet.getRange("A:B").clearContent();
  
  // Écrire les en-têtes
  sheet.getRange("A1").setValue("Source IP");
  sheet.getRange("B1").setValue("Script PowerShell");
  
  let row = 2; // Commencer à la ligne 2 après les en-têtes
  
  rules.forEach(rule => {
    // Écrire l'IP source
    sheet.getRange(row, 1).setValue(rule.sourceIp);
    
    // Générer le script PowerShell en fonction du protocole
    let script = '';
    if (rule.protocol.toLowerCase() === 'tcp') {
      script = `Test-NetConnection -ComputerName ${rule.destinationIp} -Port ${rule.port} -InformationLevel "Detailed"`;
    } else if (rule.protocol.toLowerCase() === 'icmp') {
      script = `Test-Connection -TargetName ${rule.destinationIp} -Count 4 -Protocol ICMP`;
    } else if (rule.protocol.toLowerCase() === 'udp') {
      script = `Test-NetConnection -ComputerName ${rule.destinationIp} -Port ${rule.port} -InformationLevel "Detailed"`;
    }
    
    // Écrire le script PowerShell
    sheet.getRange(row, 2).setValue(script);
    
    row++;
  });
  
  // Message de confirmation
  ui.alert('Scripts générés avec succès !');
}
