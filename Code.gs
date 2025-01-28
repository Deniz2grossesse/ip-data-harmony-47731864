function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('One clic onboarding - easy NES')
    .setFaviconUrl('https://www.google.com/images/favicon.ico');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Cache des validations pour éviter les calculs répétitifs
const validationCache = new Map();

// Cache pour stocker les données de la feuille
let sheetDataCache = null;
let lastCacheUpdate = null;
const CACHE_DURATION = 1000 * 30; // 30 secondes

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

function getSheetData(sheetUrl) {
  const now = new Date().getTime();
  if (sheetDataCache && lastCacheUpdate && (now - lastCacheUpdate) < CACHE_DURATION) {
    return sheetDataCache;
  }

  let sheet;
  if (sheetUrl) {
    try {
      const spreadsheet = SpreadsheetApp.openByUrl(sheetUrl);
      sheet = spreadsheet.getActiveSheet();
    } catch (error) {
      throw new Error("Impossible d'ouvrir le fichier. Vérifiez l'URL et les permissions.");
    }
  } else {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  }
  
  sheetDataCache = sheet.getRange(12, 4, 200, 12).getValues();
  lastCacheUpdate = now;
  return sheetDataCache;
}

function getDraftData(sheetUrl) {
  try {
    let sheet;
    if (sheetUrl) {
      try {
        const spreadsheet = SpreadsheetApp.openByUrl(sheetUrl);
        sheet = spreadsheet.getActiveSheet();
      } catch (error) {
        return { success: false, message: "Impossible d'ouvrir le fichier. Vérifiez l'URL et les permissions." };
      }
    } else {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    const data = sheet.getRange(12, 4, 200, 12).getValues();
    const drafts = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const [sourceIp, , , destIp, protocol, service, port, columnK, columnL, classification, fourCharCode] = row;
      
      const isIncomplete = !sourceIp || !destIp || !protocol || !service || !port || 
                          !columnK || !columnL || !classification || !fourCharCode ||
                          !validateIpFormat(sourceIp) || !validateIpFormat(destIp) ||
                          !validatePort(port) || !validateFourCharField(fourCharCode);
      
      if (isIncomplete && (sourceIp || destIp || protocol || service || port || columnK || columnL || classification || fourCharCode)) {
        drafts.push({
          lineNumber: i + 12,
          sourceIp: sourceIp || "N/A",
          destinationIp: destIp || "N/A",
          protocol: protocol || "N/A",
          service: service || "N/A",
          port: port || "N/A",
          columnK: columnK || "N/A",
          columnL: columnL || "N/A",
          classification: classification || "N/A",
          fourCharCode: fourCharCode || "N/A"
        });
      }
    }
    
    return { 
      success: drafts.length > 0, 
      message: drafts.length > 0 ? `${drafts.length} brouillon(s) trouvé(s)` : "Aucun brouillon trouvé",
      drafts: drafts 
    };
  } catch (error) {
    return { success: false, message: "Erreur lors de la récupération des brouillons: " + error.toString() };
  }
}

function checkDuplicates(sheetUrl) {
  const data = getSheetData(sheetUrl);
  const duplicates = [];
  const validRows = new Set();
  const rowMap = new Map();
  
  data.forEach((row, index) => {
    if (row[0] && !row[11]) {
      validRows.add(index);
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

function saveData(data, sheetUrl) {
  try {
    let sheet;
    if (sheetUrl) {
      try {
        const spreadsheet = SpreadsheetApp.openByUrl(sheetUrl);
        sheet = spreadsheet.getActiveSheet();
      } catch (error) {
        return { success: false, message: "Impossible d'ouvrir le fichier. Vérifiez l'URL et les permissions." };
      }
    } else {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    const values = getSheetData(sheetUrl);
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

function deleteRow(rowNumber, sheetUrl) {
  try {
    let sheet;
    if (sheetUrl) {
      try {
        const spreadsheet = SpreadsheetApp.openByUrl(sheetUrl);
        sheet = spreadsheet.getActiveSheet();
      } catch (error) {
        return { success: false, message: "Impossible d'ouvrir le fichier. Vérifiez l'URL et les permissions." };
      }
    } else {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    sheet.deleteRow(rowNumber);
    sheetDataCache = null;
    return { success: true, message: "Ligne supprimée avec succès" };
  } catch (error) {
    return { success: false, message: "Erreur lors de la suppression: " + error.toString() };
  }
}

function markDuplicateAsIgnored(lineNumber, referenceLine, sheetUrl) {
  try {
    let sheet;
    if (sheetUrl) {
      try {
        const spreadsheet = SpreadsheetApp.openByUrl(sheetUrl);
        sheet = spreadsheet.getActiveSheet();
      } catch (error) {
        return { success: false, message: "Impossible d'ouvrir le fichier. Vérifiez l'URL et les permissions." };
      }
    } else {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    sheet.getRange(lineNumber, 15).setValue(`Doublon avec la ligne ${referenceLine} - ignoré`);
    sheetDataCache = null;
    return { success: true, message: "Doublon marqué comme ignoré" };
  } catch (error) {
    return { success: false, message: "Erreur lors du marquage: " + error.toString() };
  }
}

function generatePowerShellScript(sheetUrl) {
  const data = getSheetData(sheetUrl);
  let scriptContent = "# Script de test de connectivité réseau\n\n";
  
  let sheet;
  if (sheetUrl) {
    try {
      const spreadsheet = SpreadsheetApp.openByUrl(sheetUrl);
      sheet = spreadsheet.getActiveSheet();
    } catch (error) {
      throw new Error("Impossible d'ouvrir le fichier. Vérifiez l'URL et les permissions.");
    }
  } else {
    sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  }
  
  let scriptSheet = sheet.getParent().getSheetByName('Scripts');
  
  if (!scriptSheet) {
    scriptSheet = sheet.getParent().insertSheet('Scripts');
    scriptSheet.getRange('A1').setValue('Ligne');
    scriptSheet.getRange('B1').setValue('Script');
  } else {
    const lastRow = scriptSheet.getLastRow();
    if (lastRow > 1) {
      scriptSheet.getRange(2, 1, lastRow - 1, 2).clearContent();
    }
  }
  
  let currentRow = 2; // Commencer après les en-têtes
  
  data.forEach((row, index) => {
    if (row[0] && !row[11]) { // Si la ligne est valide et non ignorée
      const sourceIp = row[0];
      const destIp = row[3];
      const protocol = row[4];
      const port = row[6];
      
      if (protocol && port) {
        let scriptLine = `# Test depuis ${sourceIp} vers ${destIp}\n`;
        scriptLine += `# Exécuter ce script depuis la machine ${sourceIp}\n\n`;
        
        if (protocol.toLowerCase() === 'tcp' || protocol.toLowerCase() === 'udp') {
          scriptLine += `Write-Host "Test de connectivité ${protocol} depuis ${sourceIp} vers ${destIp}:${port}" -ForegroundColor Yellow\n`;
          scriptLine += `$result = Test-NetConnection -ComputerName ${destIp} -Port ${port} -InformationLevel "Detailed"\n`;
          scriptLine += `if ($result.TcpTestSucceeded) {\n`;
          scriptLine += `    Write-Host "Connexion ${protocol} réussie depuis ${sourceIp} vers ${destIp}:${port}" -ForegroundColor Green\n`;
          scriptLine += `} else {\n`;
          scriptLine += `    Write-Host "Échec de la connexion ${protocol} depuis ${sourceIp} vers ${destIp}:${port}" -ForegroundColor Red\n`;
          scriptLine += `}\n`;
        } else if (protocol.toLowerCase() === 'icmp') {
          scriptLine += `Write-Host "Test ICMP depuis ${sourceIp} vers ${destIp}" -ForegroundColor Yellow\n`;
          scriptLine += `$ping = Test-Connection -ComputerName ${destIp} -Count 1 -Quiet\n`;
          scriptLine += `if ($ping) {\n`;
          scriptLine += `    Write-Host "Ping réussi depuis ${sourceIp} vers ${destIp}" -ForegroundColor Green\n`;
          scriptLine += `} else {\n`;
          scriptLine += `    Write-Host "Échec du ping depuis ${sourceIp} vers ${destIp}" -ForegroundColor Red\n`;
          scriptLine += `}\n`;
        }
        
        if (scriptLine) {
          scriptSheet.getRange(currentRow, 1).setValue(index + 12); // +12 car les données commencent à la ligne 12
          scriptSheet.getRange(currentRow, 2).setValue(scriptLine);
          currentRow++;
          
          scriptContent += `# Test de la règle ligne ${index + 12}\n${scriptLine}\n`;
        }
      }
    }
  });
  
  // Ajuster la largeur des colonnes
  scriptSheet.autoResizeColumns(1, 2);
  
  return scriptContent;
}

function downloadPowerShellScript(sheetUrl) {
  const scriptContent = generatePowerShellScript(sheetUrl);
  const blob = Utilities.newBlob(scriptContent, 'text/plain', 'test_connectivity.ps1');
  return blob;
}
