function doGet() {
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Gestionnaire de Règles Réseau')
      .setFaviconUrl('https://www.google.com/images/icons/product/sheets-32.png');
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function saveData(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    let nextRow = 11;
    
    // Trouver la prochaine ligne disponible
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
      
      const rowData = {
        row: row,
        sourceIp: sourceIp,
        destinationIp: destinationIp,
        protocol: protocol,
        port: port
      };
      
      if (!validateIpFormat(sourceIp)) {
        errors.push(`Ligne ${row}: Format IP source invalide`);
      }
      if (!validateIpFormat(destinationIp)) {
        errors.push(`Ligne ${row}: Format IP destination invalide`);
      }
      if (!['ssh', 'https', 'ping', 'smtp'].includes(protocol)) {
        errors.push(`Ligne ${row}: Protocole invalide`);
      }
      if (port < 1 || port > 65000) {
        errors.push(`Ligne ${row}: Port invalide`);
      }
      
      data.push(rowData);
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

function validateIpFormat(ip) {
  const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!regex.test(ip)) return false;
  
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part);
    return num >= 0 && num <= 255;
  });
}

function createFile() {
  const html = `<!DOCTYPE html>
<html>
  <head>
    <base target="_top">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background-color: #f5f5f7;
        padding: 2rem;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      h1 {
        font-size: 1.8rem;
        color: #1d1d1f;
        margin-bottom: 2rem;
        text-align: center;
      }

      .rule-line {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1rem;
        align-items: start;
      }

      .form-group {
        width: 100%;
        margin-bottom: 1rem;
        position: relative;
      }

      .btn-add-container {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }

      .btn-add {
        padding: 0.5rem;
        background-color: #34c759;
        color: white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
        border: none;
      }

      .verification-results {
        margin-top: 2rem;
        padding: 1rem;
        background-color: #f5f5f7;
        border-radius: 8px;
      }

      .error {
        color: #ff3b30;
        margin-top: 0.5rem;
      }

      .notification {
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 2rem;
        border-radius: 8px;
        background-color: #34c759;
        color: white;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transform: translateY(150%);
        transition: transform 0.3s ease;
      }

      .notification.show {
        transform: translateY(0);
      }

      .notification.error {
        background-color: #ff3b30;
      }

      .hidden {
        display: none;
      }

      @media (max-width: 768px) {
        .rule-line {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Gestionnaire de Règles Réseau</h1>
      
      <form id="networkForm">
        <div id="rulesContainer">
          <div class="rule-line">
            <div class="form-group">
              <label>IP Source</label>
              <input type="text" class="sourceIp" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" 
                     title="Format IP valide requis (ex: 192.168.1.1)">
            </div>
            <div class="form-group">
              <label>IP Destination</label>
              <input type="text" class="destinationIp" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$"
                     title="Format IP valide requis (ex: 192.168.1.1)">
              <div class="btn-add-container">
                <button type="button" class="btn-add add-destination" title="Ajouter destination">+</button>
              </div>
            </div>
            <div class="form-group">
              <label>Protocole</label>
              <select class="protocol" required>
                <option value="ssh">SSH</option>
                <option value="https">HTTPS</option>
                <option value="ping">PING</option>
                <option value="smtp">SMTP</option>
              </select>
              <div class="btn-add-container">
                <button type="button" class="btn-add add-protocol" title="Ajouter protocole">+</button>
              </div>
            </div>
            <div class="form-group">
              <label>Port</label>
              <input type="number" class="port" required min="1" max="65000">
              <div class="btn-add-container">
                <button type="button" class="btn-add add-port" title="Ajouter port">+</button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-top: 2rem;">
          <button type="button" class="btn btn-primary" onclick="validateAndSave()">
            Écrire sur le fichier
          </button>
          <button type="button" class="btn btn-secondary" onclick="verifyCoherence()">
            Vérifier la cohérence
          </button>
          <button type="button" class="btn btn-secondary" onclick="showEntries()">
            Vérifier champs saisis
          </button>
        </div>

        <div id="verificationResults" class="verification-results hidden"></div>
      </form>
    </div>

    <div id="notification" class="notification hidden"></div>

    <script>
      function validateIpAddress(ip) {
        const regex = /^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$/;
        if (!regex.test(ip)) return false;
        
        const parts = ip.split('.');
        return parts.every(part => {
          const num = parseInt(part, 10);
          return num >= 0 && num <= 255;
        });
      }

      function showNotification(message, isError = false) {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.classList.remove('hidden');
        notification.classList.toggle('error', isError);
        notification.classList.add('show');
        
        setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => {
            notification.classList.add('hidden');
          }, 300);
        }, 3000);
      }

      function createRuleLine(sourceIp = '', destinationIp = '', protocol = 'ssh', port = '') {
        const line = document.createElement('div');
        line.className = 'rule-line';
        line.innerHTML = \`
          <div class="form-group">
            <label>IP Source</label>
            <input type="text" class="sourceIp" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" 
                   title="Format IP valide requis (ex: 192.168.1.1)" value="\${sourceIp}">
          </div>
          <div class="form-group">
            <label>IP Destination</label>
            <input type="text" class="destinationIp" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$"
                   title="Format IP valide requis (ex: 192.168.1.1)" value="\${destinationIp}">
            <div class="btn-add-container">
              <button type="button" class="btn-add add-destination" title="Ajouter destination">+</button>
            </div>
          </div>
          <div class="form-group">
            <label>Protocole</label>
            <select class="protocol" required>
              <option value="ssh" \${protocol === 'ssh' ? 'selected' : ''}>SSH</option>
              <option value="https" \${protocol === 'https' ? 'selected' : ''}>HTTPS</option>
              <option value="ping" \${protocol === 'ping' ? 'selected' : ''}>PING</option>
              <option value="smtp" \${protocol === 'smtp' ? 'selected' : ''}>SMTP</option>
            </select>
            <div class="btn-add-container">
              <button type="button" class="btn-add add-protocol" title="Ajouter protocole">+</button>
            </div>
          </div>
          <div class="form-group">
            <label>Port</label>
            <input type="number" class="port" required min="1" max="65000" value="\${port}">
            <div class="btn-add-container">
              <button type="button" class="btn-add add-port" title="Ajouter port">+</button>
            </div>
          </div>
        \`;
        return line;
      }

      function validateAndSave() {
        const rules = [];
        let hasError = false;

        document.querySelectorAll('.rule-line').forEach(line => {
          const sourceIp = line.querySelector('.sourceIp').value;
          const destinationIp = line.querySelector('.destinationIp').value;
          const protocol = line.querySelector('.protocol').value;
          const port = line.querySelector('.port').value;
          
          if (!validateIpAddress(sourceIp)) {
            showNotification("Format d'adresse IP source invalide", true);
            hasError = true;
            return;
          }
          
          if (!validateIpAddress(destinationIp)) {
            showNotification("Format d'adresse IP destination invalide", true);
            hasError = true;
            return;
          }
          
          if (port < 1 || port > 65000) {
            showNotification("Le port doit être entre 1 et 65000", true);
            hasError = true;
            return;
          }
          
          rules.push({
            sourceIp,
            destinationIp,
            protocol,
            port
          });
        });
        
        if (hasError) return;
        
        google.script.run
          .withSuccessHandler(function(response) {
            if (response.success) {
              showNotification(response.message);
              document.getElementById('networkForm').reset();
              const rulesContainer = document.getElementById('rulesContainer');
              rulesContainer.innerHTML = '';
              rulesContainer.appendChild(createRuleLine());
            } else {
              showNotification(response.message, true);
            }
          })
          .withFailureHandler(function(error) {
            showNotification("Erreur lors de l'enregistrement: " + error, true);
          })
          .saveData(rules);
      }

      function verifyCoherence() {
        google.script.run
          .withSuccessHandler(function(response) {
            const results = document.getElementById('verificationResults');
            results.innerHTML = '';
            results.classList.remove('hidden');
            
            if (response.success) {
              if (response.errors.length > 0) {
                const errorsList = response.errors.map(error => `<div class="error">${error}</div>`).join('');
                results.innerHTML = \`<h3>Erreurs trouvées:</h3>\${errorsList}\`;
              } else {
                results.innerHTML = '<div>Toutes les données sont cohérentes</div>';
              }
            } else {
              results.innerHTML = \`<div class="error">${response.message}</div>\`;
            }
          })
          .withFailureHandler(function(error) {
            showNotification("Erreur lors de la vérification: " + error, true);
          })
          .verifySheetData();
      }

      function showEntries() {
        const rules = [];
        document.querySelectorAll('.rule-line').forEach(line => {
          const sourceIp = line.querySelector('.sourceIp').value;
          const destinationIp = line.querySelector('.destinationIp').value;
          const protocol = line.querySelector('.protocol').value;
          const port = line.querySelector('.port').value;
          
          if (sourceIp && destinationIp && protocol && port) {
            rules.push({ sourceIp, destinationIp, protocol, port });
          }
        });
        
        const results = document.getElementById('verificationResults');
        results.innerHTML = '';
        results.classList.remove('hidden');
        
        if (rules.length > 0) {
          const rulesList = rules.map(rule => 
            \`<div>Source: \${rule.sourceIp} | Destination: \${rule.destinationIp} | Protocole: \${rule.protocol} | Port: \${rule.port}</div>\`
          ).join('');
          results.innerHTML = \`<h3>Entrées saisies:</h3>\${rulesList}\`;
        } else {
          results.innerHTML = '<div>Aucune entrée valide saisie</div>';
        }
      }

      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-destination')) {
          const currentLine = e.target.closest('.rule-line');
          const sourceIp = currentLine.querySelector('.sourceIp').value;
          const port = currentLine.querySelector('.port').value;
          const protocol = currentLine.querySelector('.protocol').value;
          
          const newLine = createRuleLine(sourceIp, '', protocol, port);
          currentLine.after(newLine);
        } else if (e.target.classList.contains('add-protocol')) {
          const currentLine = e.target.closest('.rule-line');
          const sourceIp = currentLine.querySelector('.sourceIp').value;
          const destinationIp = currentLine.querySelector('.destinationIp').value;
          const port = currentLine.querySelector('.port').value;
          
          const newLine = createRuleLine(sourceIp, destinationIp, '', port);
          currentLine.after(newLine);
        } else if (e.target.classList.contains('add-port')) {
          const currentLine = e.target.closest('.rule-line');
          const sourceIp = currentLine.querySelector('.sourceIp').value;
          const destinationIp = currentLine.querySelector('.destinationIp').value;
          const protocol = currentLine.querySelector('.protocol').value;
          
          const newLine = createRuleLine(sourceIp, destinationIp, protocol, '');
          currentLine.after(newLine);
        }
      });
    </script>
  </body>
</html>`;

  return html;
}
