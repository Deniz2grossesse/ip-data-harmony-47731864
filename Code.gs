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

function validateIpFormat(ip) {
  const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part);
    return num >= 0 && num <= 255;
  });
}

function validateProtocol(protocol) {
  return ['ssh', 'https', 'ping', 'smtp'].includes(protocol);
}

function validatePort(port) {
  const portNum = parseInt(port);
  return portNum >= 1 && portNum <= 65000;
}

function checkForDuplicates(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const existingData = sheet.getRange(11, 1, 140, 4).getValues();
  
  for (const newRule of data) {
    for (const row of existingData) {
      if (row[0] === '' && row[1] === '' && row[2] === '' && row[3] === '') continue;
      
      if (row[0] === newRule.sourceIp && 
          row[1] === newRule.destinationIp && 
          row[2] === newRule.protocol && 
          row[3].toString() === newRule.port.toString()) {
        return {
          hasDuplicate: true,
          duplicate: {
            sourceIp: row[0],
            destinationIp: row[1],
            protocol: row[2],
            port: row[3]
          }
        };
      }
    }
  }
  return { hasDuplicate: false };
}

function saveData(data) {
  try {
    // Check for duplicates before saving
    const duplicateCheck = checkForDuplicates(data);
    if (duplicateCheck.hasDuplicate) {
      return { 
        success: false, 
        message: "Règle en doublon détectée",
        duplicate: duplicateCheck.duplicate
      };
    }
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let nextRow = 11;
    
    while (nextRow <= 150 && sheet.getRange(nextRow, 1).getValue() !== "") {
      nextRow++;
    }
    
    if (nextRow > 150) {
      return { success: false, message: "Impossible d'écrire après la ligne 150" };
    }
    
    data.forEach(row => {
      if (nextRow <= 150) {
        sheet.getRange(nextRow, 1).setValue(row.sourceIp);
        sheet.getRange(nextRow, 2).setValue(row.destinationIp);
        sheet.getRange(nextRow, 3).setValue(row.protocol);
        sheet.getRange(nextRow, 4).setValue(row.port);
        nextRow++;
      }
    });
    return { success: true, message: "Données enregistrées avec succès" };
  } catch (error) {
    return { success: false, message: "Erreur lors de l'enregistrement: " + error.toString() };
  }
}