import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateSimples, CalculationResult } from '@/lib/simplesNacional';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface FactorRCalculatorProps {
  rbt12: number;
  monthlyRevenue: number;
}

export function FactorRCalculator({ rbt12, monthlyRevenue }: FactorRCalculatorProps) {
  const [totalPayroll, setTotalPayroll] = useState<string>('');
  const [factorRResult, setFactorRResult] = useState<{
    factorR: number;
    recommendedAnexo: 'III' | 'V';
    scenario3: CalculationResult;
    scenario5: CalculationResult;
  } | null>(null);

  const handleCalculateFactorR = () => {
    if (!totalPayroll || parseFloat(totalPayroll) <= 0) {
      return;
    }

    const payroll = parseFloat(totalPayroll);
    const factorR = (payroll / rbt12) * 100;
    const recommendedAnexo = factorR <= 28 ? 'III' : 'V';

    const scenario3 = calculateSimples(monthlyRevenue, rbt12, 'III');
    const scenario5 = calculateSimples(monthlyRevenue, rbt12, 'V');

    setFactorRResult({
      factorR,
      recommendedAnexo,
      scenario3,
      scenario5,
    });
  };

  const handlePayrollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setTotalPayroll(value);
  };

  const formatDisplayValue = (value: string): string => {
    if (!value) return '';
    const num = parseInt(value, 10);
    return (num / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const comparisonData = factorRResult
    ? [
        {
          name: 'Anexo III',
          das: factorRResult.scenario3.dasValue,
          aliquota: factorRResult.scenario3.effectiveRate * 100,
        },
        {
          name: 'Anexo V',
          das: factorRResult.scenario5.dasValue,
          aliquota: factorRResult.scenario5.effectiveRate * 100,
        },
      ]
    : [];

  const savings =
    factorRResult && factorRResult.recommendedAnexo === 'III'
      ? factorRResult.scenario5.dasValue - factorRResult.scenario3.dasValue
      : factorRResult && factorRResult.recommendedAnexo === 'V'
        ? factorRResult.scenario3.dasValue - factorRResult.scenario5.dasValue
        : 0;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg">Cálculo do Fator R</CardTitle>
        <CardDescription>
          Determine automaticamente se deve usar Anexo III ou V baseado na folha de pagamento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Folha de Pagamento */}
        <div className="space-y-2">
          <Label htmlFor="payroll" className="text-sm font-medium">
            Folha de Pagamento Anual
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              R$
            </span>
            <Input
              id="payroll"
              type="text"
              placeholder="0,00"
              value={formatDisplayValue(totalPayroll)}
              onChange={handlePayrollChange}
              className="pl-10 text-right font-mono"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Soma de todos os salários pagos nos últimos 12 meses
          </p>
        </div>

        {/* Botão Calcular */}
        <Button
          onClick={handleCalculateFactorR}
          disabled={!totalPayroll || parseFloat(totalPayroll) <= 0}
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Calcular Fator R
        </Button>

        {/* Resultados */}
        {factorRResult && (
          <div className="space-y-6">
            {/* Card de Resultado Principal */}
            <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Fator R Calculado</span>
                <span className="text-2xl font-bold text-secondary">
                  {formatPercentage(factorRResult.factorR)}
                </span>
              </div>

              <Alert className="border-secondary/30 bg-secondary/5">
                <AlertCircle className="h-4 w-4 text-secondary" />
                <AlertDescription className="text-sm">
                  {factorRResult.factorR >= 0.28
                    ? `Fator R ≥ 28%: Recomenda-se usar ${factorRResult.recommendedAnexo === 'III' ? 'Anexo III' : 'Anexo V'}`
                    : `Fator R < 28%: Recomenda-se usar ${factorRResult.recommendedAnexo === 'III' ? 'Anexo III' : 'Anexo V'}`}
                </AlertDescription>
              </Alert>
            </div>

            {/* Comparação de Cenários */}
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Comparação de Cenários</h4>

              {/* Gráfico de Comparação */}
              <ResponsiveContainer width="100%" height={250}>
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
                      if (name === 'das') {
                        return [formatCurrency(value), 'DAS Mensal'];
                      }
                      return [value.toFixed(2) + '%', 'Alíquota Efetiva'];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="das" fill="oklch(0.50 0.15 260)" name="DAS Mensal" />
                  <Bar yAxisId="right" dataKey="aliquota" fill="oklch(0.55 0.16 140)" name="Alíquota %" />
                </BarChart>
              </ResponsiveContainer>

              {/* Cards de Comparação */}
              <div className="grid grid-cols-2 gap-3">
                <Card className={`border-0 ${factorRResult.recommendedAnexo === 'III' ? 'shadow-lg ring-2 ring-secondary' : 'shadow-sm'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Anexo III</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">DAS Mensal</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(factorRResult.scenario3.dasValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Alíquota</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPercentage(factorRResult.scenario3.effectiveRate)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`border-0 ${factorRResult.recommendedAnexo === 'V' ? 'shadow-lg ring-2 ring-secondary' : 'shadow-sm'}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Anexo V</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">DAS Mensal</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(factorRResult.scenario5.dasValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Alíquota</p>
                      <p className="text-sm font-semibold text-foreground">
                        {formatPercentage(factorRResult.scenario5.effectiveRate)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Economia */}
              {savings > 0 && (
                <Alert className="border-secondary/30 bg-secondary/5">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  <AlertDescription className="text-sm font-semibold text-secondary">
                    Economia mensal com a melhor opção: {formatCurrency(savings)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
