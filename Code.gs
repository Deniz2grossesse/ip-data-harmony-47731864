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

// Cache des validations pour éviter les calculs répétitifs
const validationCache = new Map();

function validateIpFormat(ip) {
  if (validationCache.has(`ip_${ip}`)) {
    return validationCache.get(`ip_${ip}`);
  }
  
  const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!regex.test(ip)) {
    validationCache.set(`ip_${ip}`, false);
    return false;
  }
  
  const parts = ip.split('.');
  const result = parts.every(part => {
    const num = parseInt(part);
    return num >= 0 && num <= 255;
  });
  
  validationCache.set(`ip_${ip}`, result);
  return result;
}

function validateProtocol(protocol) {
  const protocols = ['tcp', 'udp', 'icmp'];
  return protocols.includes(protocol.toLowerCase());
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
  // Récupérer toutes les données en une seule fois
  const data = sheet.getRange(12, 4, 200, 12).getValues();
  const duplicates = [];
  const validRows = new Set();
  
  // Créer un index des lignes valides pour optimiser la recherche
  data.forEach((row, index) => {
    if (row[0] !== "" && row[11] === "") {
      validRows.add(index);
    }
  });
  
  // Utiliser l'index pour vérifier uniquement les lignes valides
  for (const i of validRows) {
    for (const j of validRows) {
      if (i >= j) continue;
      
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
  
  return {
    success: duplicates.length === 0,
    message: duplicates.length === 0 ? "Aucun doublon trouvé" : "Des doublons ont été trouvés",
    duplicates: duplicates
  };
}

function saveData(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let nextRow = 12;
    
    // Optimisation : Recherche de la prochaine ligne vide en une seule opération
    const values = sheet.getRange(12, 4, 200, 1).getValues();
    while (nextRow <= 211 && values[nextRow - 12][0] !== "") {
      nextRow++;
    }
    
    if (nextRow > 211) {
      return { success: false, message: "Impossible d'écrire après la ligne 211" };
    }
    
    // Préparation des données en mémoire
    const newValues = data.map(row => [
      row.sourceIp,         // D
      '',                   // E
      '',                   // F
      row.destinationIp,    // G
      row.protocol,         // H
      row.service,         // I
      row.port,            // J
      row.columnK,         // K
      row.columnL,         // L
      row.classification,   // M
      row.fourCharCode,    // N
      ''                    // O
    ]);
    
    // Écriture en une seule opération
    if (newValues.length > 0) {
      sheet.getRange(nextRow, 4, newValues.length, newValues[0].length).setValues(newValues);
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
    sheet.getRange(lineNumber, 15).setValue(`Doublon avec la ligne ${referenceLine} - ignoré`);
    return { success: true, message: "Doublon marqué comme ignoré" };
  } catch (error) {
    return { success: false, message: "Erreur lors du marquage: " + error.toString() };
  }
}