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

function downloadPowerShellScript() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const newSheet = ss.insertSheet('Scripts PowerShell ' + new Date().toLocaleString());
  const ui = SpreadsheetApp.getUi();
  
  // Afficher le message de début
  ui.alert('Génération des scripts de test en cours...');
  
  // Récupérer les règles
  const rules = getNetworkRules();
  
  // Écrire les en-têtes
  newSheet.getRange("A1").setValue("Source IP");
  newSheet.getRange("B1").setValue("Script PowerShell");
  
  let row = 2; // Commencer à la ligne 2 après les en-têtes
  
  rules.forEach(rule => {
    // Écrire l'IP source
    newSheet.getRange(row, 1).setValue(rule.sourceIp);
    
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
    newSheet.getRange(row, 2).setValue(script);
    
    row++;
  });
  
  // Ajuster la largeur des colonnes
  newSheet.autoResizeColumns(1, 2);
  
  // Message de confirmation
  ui.alert('Scripts générés avec succès dans un nouvel onglet !');
  
  // Activer le nouvel onglet
  newSheet.activate();
}