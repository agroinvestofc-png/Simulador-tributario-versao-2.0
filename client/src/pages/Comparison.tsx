import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { compareScenarios, ANEXOS, AnexoType } from '@/lib/simplesNacional';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowRight, Calculator } from 'lucide-react';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number): string => {
  return (value * 100).toFixed(3) + '%';
};

export default function Comparison() {
  const [monthlyRevenueInput, setMonthlyRevenueInput] = useState<string>('');
  const [rbt12Input, setRbt12Input] = useState<string>('');
  const [anexo1, setAnexo1] = useState<AnexoType>('I');
  const [anexo2, setAnexo2] = useState<AnexoType>('II');
  const [comparisonResult, setComparisonResult] = useState<any>(null);

  const handleCompare = () => {
    if (!monthlyRevenueInput || !rbt12Input) return;

    const monthlyRevenue = parseFloat(monthlyRevenueInput) / 100;
    const rbt12 = parseFloat(rbt12Input) / 100;

    const result = compareScenarios(
      monthlyRevenue,
      rbt12,
      anexo1,
      anexo2
    );

    setComparisonResult(result);
  };

  const handleMonthlyRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setMonthlyRevenueInput(value);
  };

  const handleRbt12Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setRbt12Input(value);
  };

  const formatDisplayValue = (value: string): string => {
    if (!value) return '';
    const num = parseInt(value, 10);
    return (num / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const comparisonData = comparisonResult
    ? [
        {
          name: `Anexo ${comparisonResult.scenario1.selectedAnexo}`,
          das: comparisonResult.scenario1.dasValue,
          aliquota: comparisonResult.scenario1.effectiveRate * 100,
        },
        {
          name: `Anexo ${comparisonResult.scenario2.selectedAnexo}`,
          das: comparisonResult.scenario2.dasValue,
          aliquota: comparisonResult.scenario2.effectiveRate * 100,
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
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
              <a href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Simulador
              </a>
              <a href="/comparacao" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Comparação
              </a>
              <a href="/fator-r" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                Fator R
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Formulário */}
          <Card className="lg:col-span-1 border-0 shadow-lg h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Parâmetros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-rev" className="text-sm font-medium">
                  Receita Mensal
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="monthly-rev"
                    type="text"
                    placeholder="0,00"
                    value={formatDisplayValue(monthlyRevenueInput)}
                    onChange={handleMonthlyRevenueChange}
                    className="pl-10 text-right font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rbt-12" className="text-sm font-medium">
                  RBT 12 Meses
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="rbt-12"
                    type="text"
                    placeholder="0,00"
                    value={formatDisplayValue(rbt12Input)}
                    onChange={handleRbt12Change}
                    className="pl-10 text-right font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anexo-1" className="text-sm font-medium">
                  Anexo 1
                </Label>
                <Select value={anexo1} onValueChange={(value) => setAnexo1(value as AnexoType)}>
                  <SelectTrigger id="anexo-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ANEXOS).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anexo-2" className="text-sm font-medium">
                  Anexo 2
                </Label>
                <Select value={anexo2} onValueChange={(value) => setAnexo2(value as AnexoType)}>
                  <SelectTrigger id="anexo-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ANEXOS).map(([key, data]) => (
                      <SelectItem key={key} value={key}>
                        {data.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCompare}
                disabled={!monthlyRevenueInput || !rbt12Input}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Comparar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Resultados */}
          <div className="lg:col-span-3 space-y-6">
            {comparisonResult ? (
              <>
                {/* Gráfico */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Comparação Visual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.95 0.002 250)" />
                        <XAxis dataKey="name" stroke="oklch(0.50 0.01 260)" />
                        <YAxis yAxisId="left" stroke="oklch(0.50 0.01 260)" />
                        <YAxis yAxisId="right" orientation="right" stroke="oklch(0.50 0.01 260)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'oklch(1 0 0)',
                            border: '1px solid oklch(0.95 0.002 250)',
                            borderRadius: '0.5rem',
                          }}
                          formatter={(value: number, name: string) => {
                            if (name === 'das') return [formatCurrency(value), 'DAS'];
                            return [value.toFixed(2) + '%', 'Alíquota'];
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="das" fill="oklch(0.50 0.15 260)" name="DAS Mensal" />
                        <Bar yAxisId="right" dataKey="aliquota" fill="oklch(0.55 0.16 140)" name="Alíquota %" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Cards de Comparação */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-base">Anexo {comparisonResult.scenario1.selectedAnexo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">DAS Mensal</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(comparisonResult.scenario1.dasValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Alíquota Efetiva</p>
                        <p className="text-lg font-semibold">
                          {formatPercentage(comparisonResult.scenario1.effectiveRate)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-base">Anexo {comparisonResult.scenario2.selectedAnexo}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">DAS Mensal</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(comparisonResult.scenario2.dasValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Alíquota Efetiva</p>
                        <p className="text-lg font-semibold">
                          {formatPercentage(comparisonResult.scenario2.effectiveRate)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Diferença */}
                <Card className={`border-0 shadow-lg ${comparisonResult.difference > 0 ? 'bg-destructive/5' : 'bg-secondary/5'}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">Resultado da Comparação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Diferença Mensal</p>
                      <p className={`text-3xl font-bold ${comparisonResult.difference > 0 ? 'text-destructive' : 'text-secondary'}`}>
                        {comparisonResult.difference > 0 ? '+' : '-'}
                        {formatCurrency(Math.abs(comparisonResult.difference))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Economia Anual</p>
                      <p className="text-2xl font-bold text-secondary">
                        {formatCurrency(comparisonResult.savings * 12)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Percentual de Diferença</p>
                      <p className="text-lg font-semibold">
                        {comparisonResult.savingsPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Preencha os dados ao lado para comparar anexos</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
