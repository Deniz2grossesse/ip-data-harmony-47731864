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

function saveData(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const values = getSheetData();
    let nextRow = 12;
    
    for (let i = 0; i < values.length; i++) {
      if (!values[i][0]) {
        nextRow = i + 12;
        break;
      }
    }
    
    if (nextRow > 211) {
      return { success: false, message: "Impossible d'écrire après la ligne 211" };
    }
    
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
    
    if (newValues.length > 0) {
      sheet.getRange(nextRow, 4, newValues.length, newValues[0].length).setValues(newValues);
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
    sheetDataCache = null;
    return { success: true, message: "Doublon marqué comme ignoré" };
  } catch (error) {
    return { success: false, message: "Erreur lors du marquage: " + error.toString() };
  }
}