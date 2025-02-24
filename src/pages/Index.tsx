
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Index = () => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
      toast({
        title: "Erreur",
        description: "URL invalide. Veuillez entrer une URL Google Sheets valide.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    toast({
      title: "Chargement",
      description: "Connexion au fichier Google Sheets en cours..."
    });

    // @ts-ignore (google.script.run is injected by Google Apps Script)
    google.script.run
      .withSuccessHandler((response: any) => {
        setIsLoading(false);
        toast({
          title: "Succès",
          description: "Fichier Google Sheets connecté avec succès"
        });
      })
      .withFailureHandler((error: Error) => {
        setIsLoading(false);
        toast({
          title: "Erreur",
          description: error.toString(),
          variant: "destructive"
        });
      })
      .getSheetData(sheetUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">One clic onboarding - easy NES</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div>
                  <label htmlFor="sheetUrl" className="block text-sm font-medium text-gray-700">
                    URL du fichier Google Sheets
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <Input
                      type="text"
                      id="sheetUrl"
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="flex-1"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Chargement..." : "Connecter le fichier"}
                </Button>
              </form>
            </div>
          </div>

          {isLoading && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
                <img 
                  src="/placeholder.svg"
                  alt="Processing" 
                  className="w-64 h-64 object-cover mx-auto mb-4 rounded-lg"
                />
                <h2 className="text-xl font-semibold mb-2">1 clic onboard</h2>
                <p className="text-gray-600">Cette opération peut prendre quelques minutes...</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
