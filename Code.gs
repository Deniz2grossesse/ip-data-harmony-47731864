function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('Network Rules Manager')
    .setFaviconUrl('https://www.google.com/images/favicon.ico');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
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

function saveData(data) {
  try {
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

function verifySheetData() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = [];
    const errors = [];
    
    for (let row = 11; row <= 150; row++) {
      const sourceIp = sheet.getRange(row, 1).getValue();
      if (!sourceIp) continue;
      
      const destinationIp = sheet.getRange(row, 2).getValue();
      const protocol = sheet.getRange(row, 3).getValue();
      const port = sheet.getRange(row, 4).getValue();
      
      if (!validateIpFormat(sourceIp)) {
        errors.push(`Ligne ${row}: Format IP source invalide`);
      }
      if (!validateIpFormat(destinationIp)) {
        errors.push(`Ligne ${row}: Format IP destination invalide`);
      }
      if (!validateProtocol(protocol)) {
        errors.push(`Ligne ${row}: Protocole invalide`);
      }
      if (!validatePort(port)) {
        errors.push(`Ligne ${row}: Port invalide`);
      }
      
      data.push({
        row: row,
        sourceIp: sourceIp,
        destinationIp: destinationIp,
        protocol: protocol,
        port: port
      });
    }
    
    return {
      success: true,
      data: data,
      errors: errors
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la vérification: " + error.toString()
    };
  }
}