import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const verifyDuplicates = () => {
    setIsLoading(true);
    toast({
      title: "Vérification en cours",
      description: "Cette opération peut prendre quelques minutes...",
    });
    
    google.script.run
      .withSuccessHandler(function(response) {
        setIsLoading(false);
        const duplicatesContainer = document.getElementById('duplicatesContainer');
        const duplicatesTableBody = document.getElementById('duplicatesTableBody');
        
        if (!response.success && response.duplicates && response.duplicates.length > 0) {
          duplicatesTableBody.innerHTML = '';
          response.duplicates.forEach((duplicate, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
              <td>Doublons entre ligne ${duplicate.line1} et ${duplicate.line2}</td>
              <td>${duplicate.data.sourceIp}</td>
              <td>${duplicate.data.destinationIp}</td>
              <td>${duplicate.data.protocol}</td>
              <td>${duplicate.data.port}</td>
              <td>
                <div class="action-buttons">
                  <button onclick="ignoreDuplicate(${index})" class="ignore-button">Ignorer</button>
                  <button onclick="deleteDuplicate(${index})" class="delete-button">Supprimer</button>
                </div>
              </td>
            `;
            duplicatesTableBody.appendChild(row);
          });
          duplicatesContainer.classList.add('visible');
        } else {
          duplicatesContainer.classList.remove('visible');
        }
        showNotification(response.message, !response.success);
      })
      .withFailureHandler(function(error) {
        setIsLoading(false);
        showNotification('Erreur lors de la vérification: ' + error, true);
      })
      .checkDuplicates(currentSheetUrl);
  };

  const loadDraft = () => {
    setIsLoading(true);
    toast({
      title: "Chargement des brouillons",
      description: "Cette opération peut prendre quelques minutes...",
    });

    google.script.run
      .withSuccessHandler(function(response) {
        setIsLoading(false);
        if (response.success) {
          const drafts = response.drafts;
          if (drafts.length === 0) {
            showNotification('Aucun brouillon trouvé');
            return;
          }
          
          const firstDraft = drafts[0];
          document.getElementById('sourceIp').value = firstDraft.sourceIp === "N/A" ? "" : firstDraft.sourceIp;
          document.getElementById('destinationIp').value = firstDraft.destinationIp === "N/A" ? "" : firstDraft.destinationIp;
          document.getElementById('protocol').value = firstDraft.protocol === "N/A" ? "" : firstDraft.protocol.toLowerCase();
          document.getElementById('service').value = firstDraft.service === "N/A" ? "" : firstDraft.service;
          document.getElementById('port').value = firstDraft.port === "N/A" ? "" : firstDraft.port;
          document.getElementById('columnK').value = firstDraft.columnK === "N/A" ? "" : firstDraft.columnK;
          document.getElementById('columnL').value = firstDraft.columnL === "N/A" ? "" : firstDraft.columnL;
          document.getElementById('classification').value = firstDraft.classification === "N/A" ? "" : firstDraft.classification;
          document.getElementById('fourCharCode').value = firstDraft.fourCharCode === "N/A" ? "" : firstDraft.fourCharCode;
          
          for (let i = 1; i < drafts.length; i++) {
            const draft = drafts[i];
            duplicateField('source');
            
            const ruleLines = document.getElementsByClassName('rule-line');
            const lastLine = ruleLines[ruleLines.length - 1];
            
            lastLine.querySelector('.sourceIp').value = draft.sourceIp === "N/A" ? "" : draft.sourceIp;
            lastLine.querySelector('.destinationIp').value = draft.destinationIp === "N/A" ? "" : draft.destinationIp;
            lastLine.querySelector('.protocol').value = draft.protocol === "N/A" ? "" : draft.protocol.toLowerCase();
            lastLine.querySelector('.service').value = draft.service === "N/A" ? "" : draft.service;
            lastLine.querySelector('.port').value = draft.port === "N/A" ? "" : draft.port;
            lastLine.querySelector('.columnK').value = draft.columnK === "N/A" ? "" : draft.columnK;
            lastLine.querySelector('.columnL').value = draft.columnL === "N/A" ? "" : draft.columnL;
            lastLine.querySelector('.classification').value = draft.classification === "N/A" ? "" : draft.classification;
            lastLine.querySelector('.fourCharCode').value = draft.fourCharCode === "N/A" ? "" : draft.fourCharCode;
          }
          
          showNotification(`${drafts.length} brouillon(s) chargé(s)`);
        } else {
          showNotification(response.message, true);
        }
      })
      .withFailureHandler(function(error) {
        setIsLoading(false);
        showNotification('Erreur lors du chargement des brouillons: ' + error, true);
      })
      .getDraftData(currentSheetUrl);
  };

  return (
    <div className="min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
            <img 
              src="photo-1488590528505-98d2b5aba04b" 
              alt="Processing" 
              className="w-64 h-64 object-cover mx-auto mb-4 rounded-lg"
            />
            <h2 className="text-xl font-semibold mb-2">1 clic onboard</h2>
            <p className="text-gray-600">Cette opération peut prendre quelques minutes...</p>
          </div>
        </div>
      )}
      <div className="container">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your Blank App</h1>
        <p className="text-xl text-gray-600">Start building your amazing project here!</p>
      </div>
    </div>
  );
};

export default Index;
