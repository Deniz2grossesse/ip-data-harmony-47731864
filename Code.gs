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
  const lastRow = sheet.getLastRow();
  const existingData = sheet.getRange(11, 1, lastRow - 10, 4).getValues();
  
  for (let newRule of data) {
    for (let i = 0; i < existingData.length; i++) {
      const row = existingData[i];
      if (row[0] === "" && row[1] === "" && row[2] === "" && row[3] === "") continue;
      
      // Vérification exacte (doublon complet)
      if (row[0] === newRule.sourceIp && 
          row[1] === newRule.destinationIp && 
          row[2] === newRule.protocol && 
          row[3] === newRule.port) {
        return { 
          isDuplicate: true, 
          lineNumber: i + 11,
          message: `Doublon trouvé en ligne ${i + 11}`
        };
      }
      
      // Vérification pour même source IP, protocole, port mais destination IP différente
      if (row[0] === newRule.sourceIp && 
          row[2] === newRule.protocol && 
          row[3] === newRule.port && 
          row[1] !== newRule.destinationIp) {
        return { 
          isDuplicate: true, 
          lineNumber: i + 11,
          message: `Règle similaire trouvée en ligne ${i + 11} avec une IP destination différente (${row[1]})`
        };
      }
    }
  }
  return { isDuplicate: false, lineNumber: null, message: null };
}

function saveData(data) {
  try {
    const duplicateCheck = checkForDuplicates(data);
    if (duplicateCheck.isDuplicate) {
      return { 
        success: false, 
        message: duplicateCheck.message,
        isDuplicate: true,
        lineNumber: duplicateCheck.lineNumber
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