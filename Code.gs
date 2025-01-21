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

function checkDuplicates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getRange(11, 1, 140, 4).getValues();
  const duplicates = [];
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === "") continue; // Skip empty rows
    
    for (let j = i + 1; j < data.length; j++) {
      if (data[j][0] === "") continue; // Skip empty rows
      
      if (data[i][0] === data[j][0] && 
          data[i][1] === data[j][1] && 
          data[i][2] === data[j][2] && 
          data[i][3] === data[j][3]) {
        duplicates.push({
          line1: i + 11,
          line2: j + 11
        });
      }
    }
  }
  
  if (duplicates.length === 0) {
    return { success: true, message: "Aucun doublon trouvé" };
  } else {
    const duplicateMessages = duplicates.map(dup => 
      `doublons entre ligne ${dup.line1} et ${dup.line2}`
    );
    return { 
      success: false, 
      message: duplicateMessages.join('\n')
    };
  }
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