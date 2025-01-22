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
  return ['tcp', 'udp', 'icmp'].includes(protocol.toLowerCase());
}

function validatePort(port) {
  const portNum = parseInt(port);
  return portNum >= 1 && portNum <= 65000;
}

function validateFourCharField(value) {
  return value.length === 4;
}

function checkDuplicates() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getRange(12, 4, 200, 12).getValues(); // D12:O211
  const duplicates = [];
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === "") continue; // Skip empty rows (colonne D)
    if (data[i][11] !== "") continue; // Skip rows with comments in column O
    
    for (let j = i + 1; j < data.length; j++) {
      if (data[j][0] === "") continue; // Skip empty rows (colonne D)
      if (data[j][11] !== "") continue; // Skip rows with comments in column O
      
      // Vérification des doublons sur les colonnes D (IP source), G (IP destination), H (protocole) et J (port)
      if (data[i][0] === data[j][0] && // IP source (D)
          data[i][3] === data[j][3] && // IP destination (G)
          data[i][4] === data[j][4] && // Protocol (H)
          data[i][6] === data[j][6]) { // Port (J)
        duplicates.push({
          line1: i + 12,
          line2: j + 12,
          data: {
            sourceIp: data[i][0],
            destinationIp: data[i][3],
            protocol: data[i][4],
            port: data[i][6]
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
    let nextRow = 12;
    
    while (nextRow <= 211 && sheet.getRange(nextRow, 4).getValue() !== "") {
      nextRow++;
    }
    
    if (nextRow > 211) {
      return { success: false, message: "Impossible d'écrire après la ligne 211" };
    }
    
    // Créer un tableau 2D pour stocker toutes les valeurs
    const values = data.map(row => [
      row.sourceIp,         // Colonne D
      '',                   // Colonne E (vide)
      '',                   // Colonne F (vide)
      row.destinationIp,    // Colonne G
      row.protocol,         // Colonne H
      row.service,          // Colonne I
      row.port,            // Colonne J
      row.columnK,         // Colonne K
      row.columnL,         // Colonne L
      row.classification,   // Colonne M
      row.fourCharCode,    // Colonne N
      ''                    // Colonne O (vide)
    ]);
    
    // Écrire toutes les données en une seule opération
    if (values.length > 0) {
      const range = sheet.getRange(nextRow, 4, values.length, values[0].length);
      range.setValues(values);
    }
    
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
    sheet.getRange(lineNumber, 15).setValue(`Doublon avec la ligne ${referenceLine} - ignoré`); // Colonne O
    return { success: true, message: "Doublon marqué comme ignoré" };
  } catch (error) {
    return { success: false, message: "Erreur lors du marquage: " + error.toString() };
  }
}
