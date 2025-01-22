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

// Cache pour stocker les données de la feuille
let sheetDataCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 1000 * 30; // 30 secondes

function getSheetData() {
  const now = new Date().getTime();
  if (sheetDataCache && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_DURATION) {
    return sheetDataCache;
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheetDataCache = sheet.getRange(12, 4, 200, 12).getValues();
  lastCacheUpdate = now;
  return sheetDataCache;
}

function checkDuplicates() {
  const data = getSheetData();
  const duplicates = [];
  const validRows = new Set();
  
  // Créer un index des lignes valides et un map pour la recherche rapide
  const rowMap = new Map();
  
  data.forEach((row, index) => {
    // Vérifier si la ligne est valide (a une IP source et n'est pas marquée comme ignorée)
    if (row[0] && !row[11]) { // Modification ici pour vérifier correctement les colonnes
      validRows.add(index);
      // Créer une clé unique pour chaque combinaison
      const key = `${row[0]}_${row[3]}_${row[4]}_${row[6]}`;
      if (rowMap.has(key)) {
        duplicates.push({
          line1: rowMap.get(key) + 12,
          line2: index + 12,
          data: {
            sourceIp: row[0],
            destinationIp: row[3],
            protocol: row[4],
            port: row[6]
          }
        });
      } else {
        rowMap.set(key, index);
      }
    }
  });
  
  return {
    success: duplicates.length === 0,
    message: duplicates.length === 0 ? "Aucun doublon trouvé" : "Des doublons ont été trouvés",
    duplicates: duplicates
  };
}

function saveData(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const values = getSheetData();
    let nextRow = 12;
    
    // Recherche optimisée de la prochaine ligne vide
    for (let i = 0; i < values.length; i++) {
      if (!values[i][0]) {
        nextRow = i + 12;
        break;
      }
    }
    
    if (nextRow > 211) {
      return { success: false, message: "Impossible d'écrire après la ligne 211" };
    }
    
    // Préparation des données en mémoire
    const newValues = data.map(row => [
      row.sourceIp,
      '',
      '',
      row.destinationIp,
      row.protocol,
      row.service,
      row.port,
      row.columnK,
      row.columnL,
      row.classification,
      row.fourCharCode,
      ''
    ]);
    
    // Écriture en une seule opération
    if (newValues.length > 0) {
      sheet.getRange(nextRow, 4, newValues.length, newValues[0].length).setValues(newValues);
      // Mise à jour du cache
      sheetDataCache = null;
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
    // Invalider le cache après la suppression
    sheetDataCache = null;
    return { success: true, message: "Ligne supprimée avec succès" };
  } catch (error) {
    return { success: false, message: "Erreur lors de la suppression: " + error.toString() };
  }
}

function markDuplicateAsIgnored(lineNumber, referenceLine) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.getRange(lineNumber, 15).setValue(`Doublon avec la ligne ${referenceLine} - ignoré`);
    // Invalider le cache après la modification
    sheetDataCache = null;
    return { success: true, message: "Doublon marqué comme ignoré" };
  } catch (error) {
    return { success: false, message: "Erreur lors du marquage: " + error.toString() };
  }
}