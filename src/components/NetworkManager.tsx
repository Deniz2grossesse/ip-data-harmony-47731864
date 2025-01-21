import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "./ui/use-toast";

const NetworkManager = () => {
  const [sourceIp, setSourceIp] = useState('');
  const [destinations, setDestinations] = useState(['']);
  const [protocol, setProtocol] = useState('TCP');
  const [port, setPort] = useState('');

  const validateIpAddress = (ip: string) => {
    const regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!regex.test(ip)) return false;
    
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const checkForDuplicates = async (rule: { sourceIp: string, destinationIp: string, protocol: string, port: string }) => {
    try {
      const result = await google.script.run
        .withSuccessHandler((response: { isDuplicate: boolean, lineNumber: number, message: string }) => {
          if (response.isDuplicate) {
            toast({
              title: "Erreur de doublon",
              description: `Cette règle existe déjà à la ligne ${response.lineNumber}`,
              variant: "destructive"
            });
            return true;
          }
          return false;
        })
        .withFailureHandler((error: Error) => {
          console.error('Erreur lors de la vérification des doublons:', error);
          toast({
            title: "Erreur",
            description: "Erreur lors de la vérification des doublons",
            variant: "destructive"
          });
          return true;
        })
        .checkForDuplicates([rule]);
      
      return result;
    } catch (error) {
      console.error('Erreur:', error);
      return true;
    }
  };

  const addDestination = () => {
    setDestinations([...destinations, '']);
  };

  const handleDestinationChange = async (index: number, value: string) => {
    if (!validateIpAddress(value)) {
      toast({
        title: "Erreur",
        description: "Format d'adresse IP destination invalide",
        variant: "destructive"
      });
      return;
    }

    const isDuplicate = await checkForDuplicates({
      sourceIp,
      destinationIp: value,
      protocol,
      port
    });

    if (!isDuplicate) {
      const newDestinations = [...destinations];
      newDestinations[index] = value;
      setDestinations(newDestinations);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateIpAddress(sourceIp)) {
      toast({
        title: "Erreur",
        description: "Format d'adresse IP source invalide",
        variant: "destructive"
      });
      return;
    }

    for (const destIp of destinations) {
      if (!validateIpAddress(destIp)) {
        toast({
          title: "Erreur",
          description: "Format d'adresse IP destination invalide",
          variant: "destructive"
        });
        return;
      }

      const isDuplicate = await checkForDuplicates({
        sourceIp,
        destinationIp: destIp,
        protocol,
        port
      });

      if (isDuplicate) {
        return;
      }
    }

    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      toast({
        title: "Erreur",
        description: "Le port doit être entre 1 et 65535",
        variant: "destructive"
      });
      return;
    }

    // Si on arrive ici, il n'y a pas de doublons et les données sont valides
    google.script.run
      .withSuccessHandler(() => {
        toast({
          title: "Succès",
          description: "Données enregistrées avec succès"
        });
      })
      .withFailureHandler((error: Error) => {
        toast({
          title: "Erreur",
          description: "Erreur lors de l'enregistrement: " + error,
          variant: "destructive"
        });
      })
      .saveData(destinations.map(destIp => ({
        sourceIp,
        destinationIp: destIp,
        protocol,
        port
      })));
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8 text-center">Gestionnaire de Règles Réseau</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Source IP</label>
          <Input
            type="text"
            value={sourceIp}
            onChange={(e) => setSourceIp(e.target.value)}
            placeholder="192.168.1.1"
          />
        </div>

        {destinations.map((dest, index) => (
          <div key={index}>
            <label className="block text-sm font-medium mb-2">Destination IP {index + 1}</label>
            <Input
              type="text"
              value={dest}
              onChange={(e) => handleDestinationChange(index, e.target.value)}
              placeholder="192.168.1.2"
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addDestination}
          className="w-full"
        >
          Ajouter une destination
        </Button>

        <div>
          <label className="block text-sm font-medium mb-2">Protocole</label>
          <Select value={protocol} onValueChange={setProtocol}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un protocole" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TCP">TCP</SelectItem>
              <SelectItem value="UDP">UDP</SelectItem>
              <SelectItem value="ICMP">ICMP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Port</label>
          <Input
            type="number"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            min="1"
            max="65535"
            placeholder="80"
          />
        </div>

        <Button type="submit" className="w-full">
          Enregistrer
        </Button>
      </form>
    </div>
  );
};

export default NetworkManager;