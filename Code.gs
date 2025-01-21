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
  const data = sheet.getRange(11, 1, 140, 5).getValues(); // Ajout de la colonne E
  const duplicates = [];
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === "") continue; // Skip empty rows
    if (data[i][4] !== "") continue; // Skip rows with comments in column E
    
    for (let j = i + 1; j < data.length; j++) {
      if (data[j][0] === "") continue; // Skip empty rows
      if (data[j][4] !== "") continue; // Skip rows with comments in column E
      
      if (data[i][0] === data[j][0] && 
          data[i][1] === data[j][1] && 
          data[i][2] === data[j][2] && 
          data[i][3] === data[j][3]) {
        duplicates.push({
          line1: i + 11,
          line2: j + 11,
          data: {
            sourceIp: data[i][0],
            destinationIp: data[i][1],
            protocol: data[i][2],
            port: data[i][3]
          }
        });
      }
    }
  }
  
  if (duplicates.length === 0) {
    return { success: true, message: "Aucun doublon trouvé", duplicates: [] };
  } else {
    return { 
      success: false, 
      message: "Des doublons ont été trouvés",
      duplicates: duplicates
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

function deleteRow(rowNumber) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.deleteRow(rowNumber);
    return { success: true, message: "Ligne supprimée avec succès" };
  } catch (error) {
    return { success: false, message: "Erreur lors de la suppression: " + error.toString() };
  }
}

function markDuplicateAsIgnored(lineNumber, referenceLine) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.getRange(lineNumber, 5).setValue(`Doublon avec la ligne ${referenceLine} - ignoré`);
    return { success: true, message: "Doublon marqué comme ignoré" };
  } catch (error) {
    return { success: false, message: "Erreur lors du marquage: " + error.toString() };
  }
}