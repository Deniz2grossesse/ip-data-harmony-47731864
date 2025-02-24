
import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

const NetworkManager = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
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

    // Success case
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
        <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-lg p-6">
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <Input
              id="department"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              maxLength={4}
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
              className={errors.email ? 'border-red-500' : ''}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <Button type="submit" className="w-full">
            Enregistrer
          </Button>
        </form>
      </main>
    </div>
  );
};

export default NetworkManager;
