import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
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

  const addDestination = () => {
    setDestinations([...destinations, '']);
  };

  const handleDestinationChange = (index: number, value: string) => {
    const newDestinations = [...destinations];
    newDestinations[index] = value;
    setDestinations(newDestinations);
  };

  const handleSubmit = (e: React.FormEvent) => {
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

    // Here you would handle the data submission
    toast({
      title: "Succès",
      description: "Données enregistrées avec succès"
    });
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
          <Select
            value={protocol}
            onValueChange={setProtocol}
          >
            <Select.Trigger>
              <Select.Value placeholder="Sélectionnez un protocole" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="TCP">TCP</Select.Item>
              <Select.Item value="UDP">UDP</Select.Item>
              <Select.Item value="ICMP">ICMP</Select.Item>
            </Select.Content>
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