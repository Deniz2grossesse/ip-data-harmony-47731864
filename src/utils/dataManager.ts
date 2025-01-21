import { validateIpFormat, validateProtocol, validatePort } from './validation';

export interface NetworkRule {
  sourceIp: string;
  destinationIp: string;
  protocol: string;
  port: number;
}

export const saveNetworkRules = (data: NetworkRule[]) => {
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

export const verifySheetData = () => {
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
      
      const rowData = {
        row,
        sourceIp,
        destinationIp,
        protocol,
        port
      };
      
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
      
      data.push(rowData);
    }
    
    return {
      success: true,
      data,
      errors
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la vérification: " + error.toString()
    };
  }
}