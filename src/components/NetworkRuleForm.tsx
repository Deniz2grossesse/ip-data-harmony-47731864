import React, { useState } from 'react';
import { NetworkRule } from '../utils/dataManager';
import { validateIpFormat, validatePort } from '../utils/validation';
import { toast } from "../components/ui/use-toast";

const NetworkRuleForm = () => {
  const [rules, setRules] = useState<NetworkRule[]>([{
    sourceIp: '',
    destinationIp: '',
    protocol: 'ssh',
    port: 0
  }]);

  const handleAddRule = (index: number, field: keyof NetworkRule) => {
    const newRule = { ...rules[index] };
    const newRules = [...rules];
    newRules.splice(index + 1, 0, newRule);
    setRules(newRules);
  };

  const handleInputChange = (index: number, field: keyof NetworkRule, value: string | number) => {
    const newRules = [...rules];
    newRules[index] = {
      ...newRules[index],
      [field]: value
    };
    setRules(newRules);
  };

  const validateAndSave = () => {
    let hasError = false;

    rules.forEach(rule => {
      if (!validateIpFormat(rule.sourceIp)) {
        toast({
          title: "Erreur",
          description: "Format d'adresse IP source invalide",
          variant: "destructive"
        });
        hasError = true;
      }
      
      if (!validateIpFormat(rule.destinationIp)) {
        toast({
          title: "Erreur",
          description: "Format d'adresse IP destination invalide",
          variant: "destructive"
        });
        hasError = true;
      }
      
      if (!validatePort(Number(rule.port))) {
        toast({
          title: "Erreur",
          description: "Le port doit être entre 1 et 65000",
          variant: "destructive"
        });
        hasError = true;
      }
    });
    
    if (hasError) return;
    
    google.script.run
      .withSuccessHandler((response) => {
        if (response.success) {
          toast({
            title: "Succès",
            description: response.message
          });
          setRules([{
            sourceIp: '',
            destinationIp: '',
            protocol: 'ssh',
            port: 0
          }]);
        } else {
          toast({
            title: "Erreur",
            description: response.message,
            variant: "destructive"
          });
        }
      })
      .withFailureHandler((error) => {
        toast({
          title: "Erreur",
          description: "Erreur lors de l'enregistrement: " + error,
          variant: "destructive"
        });
      })
      .saveData(rules);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Gestionnaire de Règles Réseau</h1>
      
      <form className="space-y-6">
        {rules.map((rule, index) => (
          <div key={index} className="grid grid-cols-4 gap-4">
            <div className="flex flex-col">
              <label className="mb-2">IP Source</label>
              <input
                type="text"
                value={rule.sourceIp}
                onChange={(e) => handleInputChange(index, 'sourceIp', e.target.value)}
                pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                className="border p-2 rounded"
              />
              <button
                type="button"
                onClick={() => handleAddRule(index, 'sourceIp')}
                className="mt-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                +
              </button>
            </div>
            
            <div className="flex flex-col">
              <label className="mb-2">IP Destination</label>
              <input
                type="text"
                value={rule.destinationIp}
                onChange={(e) => handleInputChange(index, 'destinationIp', e.target.value)}
                pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                className="border p-2 rounded"
              />
              <button
                type="button"
                onClick={() => handleAddRule(index, 'destinationIp')}
                className="mt-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                +
              </button>
            </div>
            
            <div className="flex flex-col">
              <label className="mb-2">Protocole</label>
              <select
                value={rule.protocol}
                onChange={(e) => handleInputChange(index, 'protocol', e.target.value)}
                className="border p-2 rounded"
              >
                <option value="ssh">SSH</option>
                <option value="https">HTTPS</option>
                <option value="ping">PING</option>
                <option value="smtp">SMTP</option>
              </select>
              <button
                type="button"
                onClick={() => handleAddRule(index, 'protocol')}
                className="mt-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                +
              </button>
            </div>
            
            <div className="flex flex-col">
              <label className="mb-2">Port</label>
              <input
                type="number"
                value={rule.port}
                onChange={(e) => handleInputChange(index, 'port', Number(e.target.value))}
                min="1"
                max="65000"
                className="border p-2 rounded"
              />
              <button
                type="button"
                onClick={() => handleAddRule(index, 'port')}
                className="mt-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>
        ))}

        <div className="flex justify-center gap-4 mt-6">
          <button
            type="button"
            onClick={validateAndSave}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Écrire sur le fichier
          </button>
          <button
            type="button"
            onClick={() => {
              google.script.run
                .withSuccessHandler((response) => {
                  if (response.success) {
                    if (response.errors.length > 0) {
                      toast({
                        title: "Erreurs trouvées",
                        description: response.errors.join('\n'),
                        variant: "destructive"
                      });
                    } else {
                      toast({
                        title: "Succès",
                        description: "Toutes les données sont cohérentes"
                      });
                    }
                  } else {
                    toast({
                      title: "Erreur",
                      description: response.message,
                      variant: "destructive"
                    });
                  }
                })
                .withFailureHandler((error) => {
                  toast({
                    title: "Erreur",
                    description: "Erreur lors de la vérification: " + error,
                    variant: "destructive"
                  });
                })
                .verifySheetData();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Vérifier la cohérence
          </button>
        </div>
      </form>
    </div>
  );
};

export default NetworkRuleForm;