import { CalculationResult } from '@/lib/simplesNacional';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

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

interface ResultsDisplayProps {
  result: CalculationResult;
}

export function ResultsDisplay({ result }: ResultsDisplayProps) {
  // Dados para gráfico de pizza (distribuição de tributos)
  const taxData = [
    { name: 'IRPJ', value: result.taxBreakdown.irpj.value },
    { name: 'CSLL', value: result.taxBreakdown.csll.value },
    { name: 'PIS', value: result.taxBreakdown.pis.value },
    { name: 'COFINS', value: result.taxBreakdown.cofins.value },
    { name: 'CPP', value: result.taxBreakdown.cpp.value },
    ...(result.taxBreakdown.icms ? [{ name: 'ICMS', value: result.taxBreakdown.icms.value }] : []),
    ...(result.taxBreakdown.iss ? [{ name: 'ISS', value: result.taxBreakdown.iss.value }] : []),
  ];

  // Cores para o gráfico
  const COLORS = [
    'oklch(0.55 0.16 140)', // Verde Esmeralda
    'oklch(0.50 0.15 260)', // Azul Profundo
    'oklch(0.60 0.12 250)', // Azul Claro
    'oklch(0.45 0.14 270)', // Azul Escuro
    'oklch(0.35 0.12 280)', // Azul Muito Escuro
    'oklch(0.65 0.10 240)', // Azul Muito Claro
    'oklch(0.40 0.13 290)', // Azul Profundo Escuro
  ];

  // Dados para gráfico de barras (comparação de tributos)
  const barData = taxData.map(tax => ({
    name: tax.name,
    value: tax.value,
  }));

  // Total de todos os tributos
  const totalTaxes = taxData.reduce((sum, tax) => sum + tax.value, 0);

  return (
    <div className="space-y-6">
      {/* Card Principal - DAS */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Valor do DAS</CardTitle>
              <CardDescription>Documento de Arrecadação do Simples Nacional</CardDescription>
            </div>
            <TrendingUp className="h-5 w-5 text-secondary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-5xl font-bold text-primary">
                {formatCurrency(result.dasValue)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Alíquota Efetiva: <span className="font-semibold text-foreground">{formatPercentage(result.effectiveRate)}</span>
              </p>
            </div>

            {/* Informações da Faixa */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Alíquota Nominal</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatPercentage(result.nominalRate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Parcela a Deduzir</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(result.deductionAmount)}
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Faixa de RBT: R$ {(result.rbt12 / 1000).toFixed(0)}k
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Distribuição de Tributos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taxData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {taxData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'oklch(1 0 0)',
                  border: '1px solid oklch(0.95 0.002 250)',
                  borderRadius: '0.5rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Barras */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Comparação de Tributos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.95 0.002 250)" />
              <XAxis dataKey="name" stroke="oklch(0.50 0.01 260)" />
              <YAxis stroke="oklch(0.50 0.01 260)" />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'oklch(1 0 0)',
                  border: '1px solid oklch(0.95 0.002 250)',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="value" fill="oklch(0.50 0.15 260)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela Detalhada */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Detalhamento de Tributos</CardTitle>
          <CardDescription>
            Alíquotas nominais, valores e alíquotas efetivas de cada tributo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Tributo</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Alíquota Nominal</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Valor</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Alíq. Efetiva (DAS)</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Alíq. Efetiva (Faturamento)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.taxBreakdown).map(([key, taxInfo]) => {
                  const effectiveRateOnRevenue = taxInfo.value / result.monthlyRevenue;
                  // Limitar ISS a 5% na coluna de Alíq. Efetiva (Faturamento)
                  const displayEffectiveRate = key === 'iss' && effectiveRateOnRevenue > 0.05 ? 0.05 : effectiveRateOnRevenue;
                  return (
                    <tr key={key} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-3 px-4 text-foreground font-medium">{key.toUpperCase()}</td>
                      <td className="text-right py-3 px-4 text-muted-foreground">
                        {formatPercentage(taxInfo.rate)}
                      </td>
                      <td className="text-right py-3 px-4 font-mono font-semibold text-primary">
                        {formatCurrency(taxInfo.value)}
                      </td>
                      <td className="text-right py-3 px-4 text-muted-foreground">
                        {formatPercentage(taxInfo.effectiveRate)}
                      </td>
                      <td className="text-right py-3 px-4 font-mono text-accent">
                        {formatPercentage(displayEffectiveRate)}
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-muted/30 font-bold">
                  <td className="py-3 px-4 text-foreground">TOTAL</td>
                  <td className="text-right py-3 px-4 text-muted-foreground">
                    {formatPercentage(
                      Object.values(result.taxBreakdown).reduce((sum, tax) => sum + tax.rate, 0)
                    )}
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-primary">
                    {formatCurrency(totalTaxes)}
                  </td>
                  <td className="text-right py-3 px-4 text-muted-foreground">
                    {formatPercentage(result.effectiveRate)}
                  </td>
                  <td className="text-right py-3 px-4 font-mono text-accent">
                    {formatPercentage(totalTaxes / result.monthlyRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card className="border-0 shadow-lg bg-secondary/5">
        <CardHeader>
          <CardTitle className="text-base">Resumo da Simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Receita Bruta Mensal</p>
              <p className="font-semibold text-foreground">
                {formatCurrency(result.monthlyRevenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">RBT 12 Meses</p>
              <p className="font-semibold text-foreground">
                {formatCurrency(result.rbt12)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Regime</p>
              <p className="font-semibold text-foreground">
                Anexo {result.selectedAnexo}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
