import { useState } from 'react';
import { SimulatorForm } from '@/components/SimulatorForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { calculateSimples, CalculationResult, AnexoType } from '@/lib/simplesNacional';
import { Calculator } from 'lucide-react';

export default function Home() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (data: {
    monthlyRevenue: number;
    rbt12: number;
    anexo: AnexoType;
  }) => {
    setIsLoading(true);
    // Simular delay para feedback visual
    setTimeout(() => {
      const calculationResult = calculateSimples(
        data.monthlyRevenue,
        data.rbt12,
        data.anexo
      );
      setResult(calculationResult);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Calculator className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Simulador Tributário</h1>
                <p className="text-sm text-muted-foreground">Simples Nacional</p>
              </div>
            </div>
            <nav className="flex gap-4">
              <a href="/" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Simulador
              </a>
              <a href="/comparacao" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Comparação
              </a>
              <a href="/fator-r" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Fator R
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário - Coluna Esquerda */}
          <div className="lg:col-span-1">
            <SimulatorForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          {/* Resultados - Coluna Direita */}
          <div className="lg:col-span-2">
            {result ? (
              <ResultsDisplay result={result} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 inline-flex p-4 rounded-full bg-muted">
                    <Calculator className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Pronto para calcular?
                  </h3>
                  <p className="text-muted-foreground max-w-sm">
                    Preencha os dados ao lado para simular o cálculo do DAS do Simples Nacional
                    e visualizar a distribuição de tributos.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 mt-12">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Sobre */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Sobre</h4>
              <p className="text-sm text-muted-foreground">
                Simulador tributário baseado na Lei Complementar nº 155/2016, com cálculos precisos
                para o regime Simples Nacional.
              </p>
            </div>

            {/* Informações */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Informações</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Anexos I a V suportados</li>
                <li>• Cálculo de alíquota efetiva</li>
                <li>• Detalhamento de tributos</li>
              </ul>
            </div>

            {/* Avisos */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Avisos Importantes</h4>
              <p className="text-xs text-muted-foreground">
                Este simulador é fornecido como ferramenta educacional. Consulte um profissional
                contábil para orientação tributária específica.
              </p>
            </div>
          </div>

          <div className="border-t border-border/50 pt-6 text-center text-xs text-muted-foreground">
            <p>© 2026 Simulador Tributário. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
