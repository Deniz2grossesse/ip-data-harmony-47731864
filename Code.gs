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
    data.forEach(row => {
      sheet.appendRow([
        row.sourceIp,
        row.destinationIp,
        row.protocol,
        row.port
      ]);
    });
    return { success: true, message: "Données enregistrées avec succès" };
  } catch (error) {
    return { success: false, message: "Erreur lors de l'enregistrement: " + error.toString() };
  }
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

      .form-group {
        margin-bottom: 1.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #1d1d1f;
      }

      input, select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #d2d2d7;
        border-radius: 8px;
        font-size: 1rem;
        transition: border-color 0.2s ease;
      }

      input:focus, select:focus {
        outline: none;
        border-color: #0071e3;
        box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.1);
      }

      .btn-primary {
        width: 100%;
        padding: 0.75rem 1.5rem;
        background-color: #0071e3;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }

      .btn-primary:hover {
        background-color: #0077ed;
      }

      .btn-secondary {
        width: 100%;
        padding: 0.75rem 1.5rem;
        background-color: #f5f5f7;
        color: #1d1d1f;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 1rem;
        transition: background-color 0.2s ease;
      }

      .btn-secondary:hover {
        background-color: #e8e8ed;
      }

      .rule-group {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        background-color: #f5f5f7;
      }

      .destination-group {
        padding: 1rem;
        margin: 0.5rem 0;
        border-radius: 8px;
        background-color: white;
        border: 1px solid #d2d2d7;
      }

      .port-protocol-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 0.5rem;
      }

      .preview-table {
        width: 100%;
        margin-top: 2rem;
        border-collapse: collapse;
        overflow-x: auto;
      }

      .preview-table th,
      .preview-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #d2d2d7;
      }

      .preview-table th {
        background-color: #f5f5f7;
        font-weight: 500;
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
        body {
          padding: 1rem;
        }
        
        .container {
          padding: 1rem;
        }

        .port-protocol-group {
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
          <div class="rule-group">
            <div class="form-group">
              <label>IP Source</label>
              <input type="text" class="sourceIp" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" 
                     title="Format IP valide requis (ex: 192.168.1.1)">
            </div>

            <div class="destinations-container">
              <div class="destination-group">
                <div class="form-group">
                  <label>IP Destination</label>
                  <input type="text" class="destinationIp" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$"
                         title="Format IP valide requis (ex: 192.168.1.1)">
                </div>
                
                <div class="port-protocol-pairs">
                  <div class="port-protocol-group">
                    <div class="form-group">
                      <label>Protocole</label>
                      <select class="protocol" required>
                        <option value="ssh">SSH</option>
                        <option value="https">HTTPS</option>
                        <option value="ping">PING</option>
                        <option value="smtp">SMTP</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label>Port</label>
                      <input type="number" class="port" required min="1" max="65535">
                    </div>
                  </div>
                </div>

                <button type="button" class="btn-secondary add-port-protocol">
                  Ajouter Protocole/Port
                </button>
              </div>
            </div>

            <button type="button" class="btn-secondary add-destination">
              Ajouter une destination
            </button>
          </div>
        </div>

        <button type="button" class="btn-secondary" id="addRule">
          Ajouter une nouvelle règle
        </button>

        <div class="preview-container">
          <h2>Aperçu des règles</h2>
          <table id="previewTable" class="preview-table">
            <thead>
              <tr>
                <th>IP Source</th>
                <th>IP Destination</th>
                <th>Protocole</th>
                <th>Port</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>

        <button type="button" onclick="validateAndSave()" class="btn-primary">
          Enregistrer
        </button>
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

      function createPortProtocolGroup() {
        const group = document.createElement('div');
        group.className = 'port-protocol-group';
        group.innerHTML = \`
          <div class="form-group">
            <label>Protocole</label>
            <select class="protocol" required>
              <option value="ssh">SSH</option>
              <option value="https">HTTPS</option>
              <option value="ping">PING</option>
              <option value="smtp">SMTP</option>
            </select>
          </div>
          <div class="form-group">
            <label>Port</label>
            <input type="number" class="port" required min="1" max="65535">
          </div>
        \`;
        return group;
      }

      function createDestinationGroup() {
        const group = document.createElement('div');
        group.className = 'destination-group';
        group.innerHTML = \`
          <div class="form-group">
            <label>IP Destination</label>
            <input type="text" class="destinationIp" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$">
          </div>
          <div class="port-protocol-pairs">
            <div class="port-protocol-group">
              <div class="form-group">
                <label>Protocole</label>
                <select class="protocol" required>
                  <option value="ssh">SSH</option>
                  <option value="https">HTTPS</option>
                  <option value="ping">PING</option>
                  <option value="smtp">SMTP</option>
                </select>
              </div>
              <div class="form-group">
                <label>Port</label>
                <input type="number" class="port" required min="1" max="65535">
              </div>
            </div>
          </div>
          <button type="button" class="btn-secondary add-port-protocol">
            Ajouter Protocole/Port
          </button>
        \`;
        return group;
      }

      function createRuleGroup() {
        const group = document.createElement('div');
        group.className = 'rule-group';
        group.innerHTML = \`
          <div class="form-group">
            <label>IP Source</label>
            <input type="text" class="sourceIp" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$">
          </div>
          <div class="destinations-container">
            <div class="destination-group">
              <div class="form-group">
                <label>IP Destination</label>
                <input type="text" class="destinationIp" required pattern="^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$">
              </div>
              <div class="port-protocol-pairs">
                <div class="port-protocol-group">
                  <div class="form-group">
                    <label>Protocole</label>
                    <select class="protocol" required>
                      <option value="ssh">SSH</option>
                      <option value="https">HTTPS</option>
                      <option value="ping">PING</option>
                      <option value="smtp">SMTP</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Port</label>
                    <input type="number" class="port" required min="1" max="65535">
                  </div>
                </div>
              </div>
              <button type="button" class="btn-secondary add-port-protocol">
                Ajouter Protocole/Port
              </button>
            </div>
          </div>
          <button type="button" class="btn-secondary add-destination">
            Ajouter une destination
          </button>
        \`;
        return group;
      }

      function updatePreviewTable() {
        const tbody = document.querySelector('#previewTable tbody');
        tbody.innerHTML = '';
        
        document.querySelectorAll('.rule-group').forEach(ruleGroup => {
          const sourceIp = ruleGroup.querySelector('.sourceIp').value;
          
          ruleGroup.querySelectorAll('.destination-group').forEach(destGroup => {
            const destinationIp = destGroup.querySelector('.destinationIp').value;
            
            destGroup.querySelectorAll('.port-protocol-group').forEach(portProtocolGroup => {
              const protocol = portProtocolGroup.querySelector('.protocol').value;
              const port = portProtocolGroup.querySelector('.port').value;
              
              if (sourceIp && destinationIp && protocol && port) {
                const row = tbody.insertRow();
                row.insertCell().textContent = sourceIp;
                row.insertCell().textContent = destinationIp;
                row.insertCell().textContent = protocol;
                row.insertCell().textContent = port;
              }
            });
          });
        });
      }

      function validateAndSave() {
        const rules = [];
        let hasError = false;

        document.querySelectorAll('.rule-group').forEach(ruleGroup => {
          const sourceIp = ruleGroup.querySelector('.sourceIp').value;
          
          if (!validateIpAddress(sourceIp)) {
            showNotification("Format d'adresse IP source invalide", true);
            hasError = true;
            return;
          }
          
          ruleGroup.querySelectorAll('.destination-group').forEach(destGroup => {
            const destinationIp = destGroup.querySelector('.destinationIp').value;
            
            if (!validateIpAddress(destinationIp)) {
              showNotification("Format d'adresse IP destination invalide", true);
              hasError = true;
              return;
            }
            
            destGroup.querySelectorAll('.port-protocol-group').forEach(portProtocolGroup => {
              const protocol = portProtocolGroup.querySelector('.protocol').value;
              const port = portProtocolGroup.querySelector('.port').value;
              
              if (port < 1 || port > 65535) {
                showNotification("Le port doit être entre 1 et 65535", true);
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
          });
        });
        
        if (hasError) return;
        
        google.script.run
          .withSuccessHandler(function(response) {
            if (response.success) {
              showNotification(response.message);
              document.getElementById('networkForm').reset();
              document.querySelector('#previewTable tbody').innerHTML = '';
              
              const rulesContainer = document.getElementById('rulesContainer');
              rulesContainer.innerHTML = '';
              rulesContainer.appendChild(createRuleGroup());
            } else {
              showNotification(response.message, true);
            }
          })
          .withFailureHandler(function(error) {
            showNotification("Erreur lors de l'enregistrement: " + error, true);
          })
          .saveData(rules);
      }

      document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-port-protocol')) {
          const portProtocolPairs = e.target.previousElementSibling;
          portProtocolPairs.appendChild(createPortProtocolGroup());
        } else if (e.target.classList.contains('add-destination')) {
          const destinationsContainer = e.target.previousElementSibling;
          destinationsContainer.appendChild(createDestinationGroup());
        } else if (e.target.id === 'addRule') {
          document.getElementById('rulesContainer').appendChild(createRuleGroup());
        }
      });

      document.addEventListener('input', function(e) {
        if (e.target.classList.contains('sourceIp') ||
            e.target.classList.contains('destinationIp') ||
            e.target.classList.contains('protocol') ||
            e.target.classList.contains('port')) {
          updatePreviewTable();
        }
      });
    </script>
  </body>
</html>`;

  return html;
}
