// Configuration de l'interface utilisateur
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

// Validations
function validateIpFormat(ip) {
  if (!ip) return false;
  const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part);
    return num >= 0 && num <= 255;
  });
}

function validateProtocol(protocol) {
  const validProtocols = ['ssh', 'https', 'ping', 'smtp'];
  return validProtocols.includes(protocol?.toLowerCase());
}

function validatePort(port) {
  if (!port) return false;
  const portNum = parseInt(port);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65000;
}

// Gestion des doublons
function checkForDuplicates(data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const existingData = sheet.getRange(11, 1, Math.max(lastRow - 10, 0), 4).getValues();
  
  for (let newRule of data) {
    for (let i = 0; i < existingData.length; i++) {
      const row = existingData[i];
      if (!row[0] && !row[1] && !row[2] && !row[3]) continue;
      
      if (row[0] === newRule.sourceIp && 
          row[1] === newRule.destinationIp && 
          row[2] === newRule.protocol) {
        return { 
          isDuplicate: true, 
          lineNumber: i + 11,
          message: `Doublon trouvé en ligne ${i + 11}`
        };
      }
    }
  }
  return { isDuplicate: false, lineNumber: null, message: null };
}

// Sauvegarde des données
function saveData(data) {
  try {
    // Validation des données
    for (const rule of data) {
      if (!validateIpFormat(rule.sourceIp) || 
          !validateIpFormat(rule.destinationIp) || 
          !validateProtocol(rule.protocol) || 
          !validatePort(rule.port)) {
        return { 
          success: false, 
          message: "Format de données invalide"
        };
      }
    }

    // Vérification des doublons
    const duplicateCheck = checkForDuplicates(data);
    if (duplicateCheck.isDuplicate) {
      return { 
        success: false, 
        message: duplicateCheck.message,
        isDuplicate: true,
        lineNumber: duplicateCheck.lineNumber
      };
    }

    // Sauvegarde dans la feuille
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let nextRow = 11;
    
    while (nextRow <= 150 && sheet.getRange(nextRow, 1).getValue() !== "") {
      nextRow++;
    }
    
    if (nextRow > 150) {
      return { 
        success: false, 
        message: "Impossible d'écrire après la ligne 150" 
      };
    }
    
    data.forEach(row => {
      if (nextRow <= 150) {
        const rowData = [row.sourceIp, row.destinationIp, row.protocol, row.port];
        sheet.getRange(nextRow, 1, 1, 4).setValues([rowData]);
        nextRow++;
      }
    });
    
    return { 
      success: true, 
      message: "Données enregistrées avec succès" 
    };
  } catch (error) {
    return { 
      success: false, 
      message: "Erreur lors de l'enregistrement: " + error.toString() 
    };
  }
}