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

function generatePowerShellScript() {
  const data = getSheetData();
  let scriptContent = "# Script de test de connectivité réseau\n\n";
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let scriptSheet = spreadsheet.getSheetByName('Scripts');
  
  // Créer la feuille si elle n'existe pas
  if (!scriptSheet) {
    scriptSheet = spreadsheet.insertSheet('Scripts');
    scriptSheet.getRange('A1').setValue('IP Source');
    scriptSheet.getRange('B1').setValue('Script');
  } else {
    // Effacer le contenu existant sauf les en-têtes
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
        let scriptLine = '';
        
        if (protocol.toLowerCase() === 'tcp' || protocol.toLowerCase() === 'udp') {
          scriptLine = `$result = Test-NetConnection -ComputerName ${destIp} -Port ${port} -InformationLevel "Detailed"\n`;
          scriptLine += `if ($result.TcpTestSucceeded) {\n`;
          scriptLine += `    Write-Host "Connexion réussie vers ${destIp}:${port} (${protocol})" -ForegroundColor Green\n`;
          scriptLine += `} else {\n`;
          scriptLine += `    Write-Host "Échec de la connexion vers ${destIp}:${port} (${protocol})" -ForegroundColor Red\n`;
          scriptLine += `}\n`;
        } else if (protocol.toLowerCase() === 'icmp') {
          scriptLine = `$ping = Test-Connection -ComputerName ${destIp} -Count 1 -Quiet\n`;
          scriptLine += `if ($ping) {\n`;
          scriptLine += `    Write-Host "Ping réussi vers ${destIp}" -ForegroundColor Green\n`;
          scriptLine += `} else {\n`;
          scriptLine += `    Write-Host "Échec du ping vers ${destIp}" -ForegroundColor Red\n`;
          scriptLine += `}\n`;
        }
        
        if (scriptLine) {
          scriptSheet.getRange(currentRow, 1).setValue(sourceIp); // IP Source en colonne A
          scriptSheet.getRange(currentRow, 2).setValue(scriptLine);
          currentRow++;
          
          scriptContent += `# Test depuis ${sourceIp}\n${scriptLine}\n`;
        }
      }
    }
  });
  
  // Ajuster la largeur des colonnes
  scriptSheet.autoResizeColumns(1, 2);
  
  return scriptContent;
}

function downloadPowerShellScript() {
  const scriptContent = generatePowerShellScript();
  const blob = Utilities.newBlob(scriptContent, 'text/plain', 'test_connectivity.ps1');
  return blob;
}

function generateTopology() {
  const data = getSheetData();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let topoSheet = spreadsheet.getSheetByName('Topologie');
  
  // Trouver la dernière ligne remplie
  let lastFilledRow = 12;
  for (let i = 0; i < data.length; i++) {
    if (data[i][0]) { // Si l'IP source existe
      lastFilledRow = i + 12;
    }
  }
  
  // Créer la feuille si elle n'existe pas
  if (!topoSheet) {
    topoSheet = spreadsheet.insertSheet('Topologie');
  } else {
    // Effacer le contenu existant
    topoSheet.clear();
  }
  
  // En-têtes pour les données de noeuds
  topoSheet.getRange('A1').setValue('Node');
  topoSheet.getRange('B1').setValue('Type');
  
  // En-têtes pour les connexions
  topoSheet.getRange('D1').setValue('Source');
  topoSheet.getRange('E1').setValue('Target');
  topoSheet.getRange('F1').setValue('Protocol');
  
  let nodeRow = 2;
  let edgeRow = 2;
  const nodes = new Set();
  
  // Ne traiter que les lignes de 12 jusqu'à lastFilledRow
  for (let i = 0; i <= lastFilledRow - 12; i++) {
    const line = data[i];
    if (line[0] && line[3] && !line[11]) { // Si IP source et destination existent et la ligne n'est pas ignorée
      // Ajouter les noeuds s'ils n'existent pas déjà
      if (!nodes.has(line[0])) {
        topoSheet.getRange(nodeRow, 1).setValue(line[0]);
        topoSheet.getRange(nodeRow, 2).setValue('Source');
        nodes.add(line[0]);
        nodeRow++;
      }
      
      if (!nodes.has(line[3])) {
        topoSheet.getRange(nodeRow, 1).setValue(line[3]);
        topoSheet.getRange(nodeRow, 2).setValue('Destination');
        nodes.add(line[3]);
        nodeRow++;
      }
      
      // Ajouter la connexion
      topoSheet.getRange(edgeRow, 4).setValue(line[0]); // Source
      topoSheet.getRange(edgeRow, 5).setValue(line[3]); // Target
      topoSheet.getRange(edgeRow, 6).setValue(line[4] || 'N/A'); // Protocol
      edgeRow++;
    }
  }
  
  // Formater la feuille
  topoSheet.autoResizeColumns(1, 6);
  topoSheet.getRange('A1:F1').setBackground('#f3f3f3').setFontWeight('bold');
  
  // Créer un graphique de type scatter
  const chartBuilder = topoSheet.newChart();
  const chart = chartBuilder
    .addRange(topoSheet.getRange(1, 1, nodeRow-1, 2)) // Données des noeuds
    .addRange(topoSheet.getRange(1, 4, edgeRow-1, 3)) // Données des connexions
    .setChartType(Charts.ChartType.SCATTER)
    .setOption('title', 'Topologie Réseau')
    .setOption('width', 800)
    .setOption('height', 600)
    .setOption('pointSize', 10)
    .setOption('series', {
      0: {type: 'scatter', pointShape: 'circle'},
      1: {type: 'line', lineWidth: 1}
    })
    .setPosition(5, 8, 0, 0)
    .build();
  
  topoSheet.insertChart(chart);
  
  return {
    success: true,
    message: "Topologie générée avec succès dans l'onglet 'Topologie'"
  };
}