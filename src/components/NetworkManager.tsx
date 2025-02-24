
import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

export default function NetworkManager() {
  const [formData, setFormData] = useState({
    department: '',
    projectCode: '',
    email: ''
  });
  const [errors, setErrors] = useState({
    department: '',
    projectCode: '',
    email: ''
  });
  const { toast } = useToast();

  const validateDepartment = (value: string) => {
    const regex = /^[a-zA-Z0-9]{1,4}$/;
    if (!value) {
      return "Le département est requis";
    }
    if (!regex.test(value)) {
      return "Le département doit contenir entre 1 et 4 caractères alphanumériques";
    }
    return "";
  };

  const validateProjectCode = (value: string) => {
    const regex = /^[a-zA-Z0-9]{4}$/;
    if (!value) {
      return "Le code projet est requis";
    }
    if (!regex.test(value)) {
      return "Le code projet doit contenir exactement 4 caractères alphanumériques";
    }
    return "";
  };

  const validateEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      return "L'email est requis";
    }
    if (!regex.test(value)) {
      return "Format d'email invalide";
    }
    return "";
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    let error = '';
    switch (field) {
      case 'department':
        error = validateDepartment(value);
        break;
      case 'projectCode':
        error = validateProjectCode(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));

    if (error) {
      toast({
        title: "Erreur de validation",
        description: error,
        variant: "destructive"
      });
    }
  };

  const handleMainInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const departmentError = validateDepartment(formData.department);
    const projectCodeError = validateProjectCode(formData.projectCode);
    const emailError = validateEmail(formData.email);

    if (departmentError || projectCodeError || emailError) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs avant de soumettre",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Informations enregistrées avec succès"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">One clic onboarding - easy NES</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6 bg-white shadow sm:rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                maxLength={4}
                required
                className={errors.department ? 'border-red-500' : ''}
                placeholder="DEPT"
              />
              {errors.department && (
                <p className="mt-1 text-sm text-red-500">{errors.department}</p>
              )}
            </div>

            <div>
              <label htmlFor="projectCode" className="block text-sm font-medium text-gray-700">
                Project/Application Code
              </label>
              <Input
                id="projectCode"
                value={formData.projectCode}
                onChange={(e) => handleChange('projectCode', e.target.value)}
                maxLength={4}
                required
                className={errors.projectCode ? 'border-red-500' : ''}
                placeholder="PROJ"
              />
              {errors.projectCode && (
                <p className="mt-1 text-sm text-red-500">{errors.projectCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Requestor's Email
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className={errors.email ? 'border-red-500' : ''}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6">
          {/* Grid des règles réseau */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            {/* IP Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source IP</label>
              <Input placeholder="IP source" />
            </div>
            
            {/* IP Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">IP Destination</label>
              <Input placeholder="IP destination" />
            </div>
            
            {/* Protocole */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Protocole</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Sélectionner</option>
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="icmp">ICMP</option>
              </select>
            </div>
            
            {/* Service */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <Input placeholder="Service" />
            </div>
            
            {/* Port */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <Input placeholder="Port" type="number" min="1" max="65535" />
            </div>
            
            {/* Authentication */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authentication</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Sélectionner</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
            
            {/* Flow encryption */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Flow encryption</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Sélectionner</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
            
            {/* Classification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Classification</label>
              <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Sélectionner</option>
                <option value="Amber">Amber</option>
                <option value="More sensitive data">More sensitive data</option>
              </select>
            </div>
            
            {/* APP code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">APP code</label>
              <Input placeholder="Code (4 chars)" maxLength={4} />
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => toast({ title: "Brouillon", description: "Chargement du brouillon..." })}>
              Reprendre le brouillon
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Vérification", description: "Vérification en cours..." })}>
              Vérifier
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Validation", description: "Validation en cours..." })}>
              Valider
            </Button>
            <Button variant="outline" onClick={() => toast({ title: "Génération", description: "Génération du script..." })}>
              Générer Script
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
