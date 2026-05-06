import { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { calculateSimples, type CalculationResult } from '@/lib/simplesNacional';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function FactorR() {
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>('');
  const [monthlyPayroll, setMonthlyPayroll] = useState<string>('');
  const [rbt12, setRbt12] = useState<string>('');
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState<string>('');
  const [payroll, setPayroll] = useState<string>('');
  const [calculationMode, setCalculationMode] = useState<'manual' | 'monthly'>('monthly');
  const [results, setResults] = useState<{
    factorR: number;
    payrollNeeded: number;
    difference: number;
    isAbove28: boolean;
    rbt12Used: number;
  } | null>(null);
  const [taxResults, setTaxResults] = useState<CalculationResult | null>(null);

  const handleMonthlyRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setMonthlyRevenue(value);
    // Auto-calculate RBT12
    if (value) {
      const rbt12Value = (parseInt(value, 10) * 12).toString();
      setRbt12(rbt12Value);
    }
  };

  // Auto-calculate payroll when monthly payroll changes
  const calculatedPayroll12 = monthlyPayroll ? (parseInt(monthlyPayroll, 10) * 12).toString() : '';
  useEffect(() => {
    if (calculationMode === 'monthly' && calculatedPayroll12) {
      setPayroll(calculatedPayroll12);
    }
  }, [calculatedPayroll12, calculationMode]);

  const handleRbt12Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setRbt12(value);
    setMonthlyRevenue(''); // Clear monthly revenue when manually editing RBT12
  };

  const handleCurrentMonthRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCurrentMonthRevenue(value);
  };

  const handlePayrollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setPayroll(value);
  };

  const handleMonthlyPayrollChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setMonthlyPayroll(value);
  };

  const formatDisplayValue = (value: string): string => {
    if (!value) return '';
    const num = parseInt(value, 10);
    return (num / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const calculateFactorR = () => {
    let rbt12Num = parseInt(rbt12, 10) / 100;
    let payrollNum = parseInt(payroll, 10) / 100;
    const currentMonthNum = currentMonthRevenue ? parseInt(currentMonthRevenue, 10) / 100 : 0;
    const monthlyPayrollNum = monthlyPayroll ? parseInt(monthlyPayroll, 10) / 100 : 0;

    // Se modo manual e houver faturamento do mês atual, adicionar à RBT12
    if (calculationMode === 'manual' && currentMonthNum > 0) {
      rbt12Num = rbt12Num + currentMonthNum;
    }

    // Se modo mensal e houver folha mensal, multiplicar por 12
    if (calculationMode === 'monthly' && monthlyPayrollNum > 0) {
      payrollNum = monthlyPayrollNum * 12;
    }

    if (rbt12Num <= 0 || payrollNum < 0) {
      alert('Por favor, preencha valores válidos');
      return;
    }

    const factorR = (payrollNum / rbt12Num) * 100;
    const payrollNeeded = rbt12Num * 0.28;
    const difference = payrollNum - payrollNeeded;
    const isAbove28 = factorR >= 28;

    setResults({
      factorR,
      payrollNeeded,
      difference,
      isAbove28,
      rbt12Used: rbt12Num,
    });

    // Recomendação de Anexo baseada no Fator R:
    // Fator R >= 28% → Anexo III
    // Fator R < 28% → Anexo V
    const anexo = isAbove28 ? 'III' : 'V';
    
    try {
      // Calcular imposto do Simples
      // O DAS mensal deve ser calculado APENAS sobre o faturamento do mês atual
      // Se não houver faturamento do mês atual, o DAS é zerado
      // A alíquota efetiva é determinada pela RBT12 (para encontrar a faixa correta)
      
      let monthlyRevenueForTax = 0;
      if (calculationMode === 'monthly') {
        // Para modo mensal: usa faturamento mensal
        monthlyRevenueForTax = parseInt(monthlyRevenue, 10) / 100;
      } else if (calculationMode === 'manual' && currentMonthNum > 0) {
        // Para modo manual: usa faturamento do mês atual APENAS se preenchido
        monthlyRevenueForTax = currentMonthNum;
      }
      // Se não houver faturamento do mês atual no modo manual, monthlyRevenueForTax fica 0
      
      const simplesTax = calculateSimples(monthlyRevenueForTax, rbt12Num, anexo);
      setTaxResults(simplesTax);
    } catch (error) {
      console.error('Erro ao calcular imposto:', error);
      setTaxResults(null);
    }
  };

  const canCalculate = rbt12.length > 0 && (calculationMode === 'monthly' ? monthlyPayroll.length > 0 : payroll.length > 0);

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex gap-4 mb-8 border-b border-border pb-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Simulador
          </Link>
          <Link href="/comparacao" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Comparação
          </Link>
          <Link href="/fator-r" className="text-sm font-medium text-primary">
            Fator R
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Análise do Fator R</h1>
          <p className="text-muted-foreground">
            Calcule o Fator R da sua empresa e saiba se deve usar Anexo III ou Anexo V
          </p>
        </div>

        {/* Info Box */}
        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            <strong>Fator R:</strong> É a razão entre a folha de pagamento anual e a receita bruta total. Empresas de serviços com Fator R <strong>≥ 28% usam Anexo III</strong>, enquanto as com Fator R <strong>&lt; 28% usam Anexo V</strong>.
          </AlertDescription>
        </Alert>

        {/* Input Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Dados para Cálculo</CardTitle>
            <CardDescription>
              Escolha entre informar o faturamento mensal ou a receita bruta total dos últimos 12 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="monthly"
                  checked={calculationMode === 'monthly'}
                  onChange={(e) => setCalculationMode(e.target.value as 'monthly' | 'manual')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Faturamento Mensal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  value="manual"
                  checked={calculationMode === 'manual'}
                  onChange={(e) => setCalculationMode(e.target.value as 'monthly' | 'manual')}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">RBT Total (12 meses)</span>
              </label>
            </div>

            {/* Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Faturamento Mensal */}
              {calculationMode === 'monthly' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="monthly-revenue" className="text-sm font-medium">
                      Faturamento Mensal
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        id="monthly-revenue"
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        value={monthlyRevenue ? formatDisplayValue(monthlyRevenue) : ''}
                        onChange={handleMonthlyRevenueChange}
                        className="pl-8 text-right font-mono"
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Faturamento médio mensal (será multiplicado por 12)
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly-payroll" className="text-sm font-medium">
                      Folha de Pagamento Mensal
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        id="monthly-payroll"
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        value={monthlyPayroll ? formatDisplayValue(monthlyPayroll) : ''}
                        onChange={handleMonthlyPayrollChange}
                        className="pl-8 text-right font-mono"
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Folha média mensal (será multiplicada por 12)
                    </p>
                  </div>
                </>
              )}

              {/* RBT Manual */}
              {calculationMode === 'manual' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="rbt12" className="text-sm font-medium">
                      Receita Bruta Total (12 meses)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        id="rbt12"
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        value={rbt12 ? formatDisplayValue(rbt12) : ''}
                        onChange={handleRbt12Change}
                        className="pl-8 text-right font-mono"
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total de receitas sem deduções
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="current-month" className="text-sm font-medium">
                      Faturamento do Mês Atual (Opcional)
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        R$
                      </span>
                      <Input
                        id="current-month"
                        type="text"
                        inputMode="numeric"
                        placeholder="0,00"
                        value={currentMonthRevenue ? formatDisplayValue(currentMonthRevenue) : ''}
                        onChange={handleCurrentMonthRevenueChange}
                        className="pl-8 text-right font-mono"
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Será adicionado à RBT dos 12 meses para cálculo mais preciso
                    </p>
                  </div>
                </>
              )}

              {/* RBT Display (when using monthly) */}
              {calculationMode === 'monthly' && rbt12 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    RBT Calculada (12 meses)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      type="text"
                      disabled
                      value={rbt12 ? formatDisplayValue(rbt12) : ''}
                      className="pl-8 text-right font-mono bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Calculado automaticamente
                  </p>
                </div>
              )}

              {/* Folha de Pagamento - apenas para modo manual */}
              {calculationMode === 'manual' && (
                <div className="space-y-2">
                  <Label htmlFor="payroll" className="text-sm font-medium">
                    Folha de Pagamento (12 meses)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      id="payroll"
                      type="text"
                      inputMode="numeric"
                      placeholder="0,00"
                      value={payroll ? formatDisplayValue(payroll) : ''}
                      onChange={handlePayrollChange}
                      className="pl-8 text-right font-mono"
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Salários + pró-labore dos últimos 12 meses
                  </p>
                </div>
              )}

              {/* Payroll Display - apenas para modo mensal */}
              {calculationMode === 'monthly' && payroll && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Folha Calculada (12 meses)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      R$
                    </span>
                    <Input
                      type="text"
                      disabled
                      value={payroll ? formatDisplayValue(payroll) : ''}
                      className="pl-8 text-right font-mono bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Calculado automaticamente
                  </p>
                </div>
              )}
            </div>

            {/* Calculate Button */}
            <Button
              onClick={calculateFactorR}
              disabled={!canCalculate}
              className="w-full h-12 text-base font-semibold"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Calcular Fator R
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {results && (
          <div className="space-y-6 mb-8">
            {/* Main Result */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle>Resultado do Cálculo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Factor R Display */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Seu Fator R</p>
                  <p className="text-5xl font-bold text-primary mb-4">{results.factorR.toFixed(2)}%</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${results.isAbove28 ? 'bg-secondary/20 text-secondary' : 'bg-destructive/20 text-destructive'}`}>
                    {results.isAbove28 ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    <span className="font-semibold">{results.isAbove28 ? 'Acima de 28% - Use Anexo III' : 'Abaixo de 28% - Use Anexo V'}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-muted/50 p-4 rounded space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receita Bruta Total:</span>
                    <span className="font-semibold">{formatCurrency(results.rbt12Used)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Folha de Pagamento:</span>
                    <span className="font-semibold">{formatCurrency(parseInt(payroll, 10) / 100)}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="text-muted-foreground">Fator R Limite (28%):</span>
                    <span className="font-semibold">28.00%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Folha Necessária (28%):</span>
                    <span className="font-semibold">{formatCurrency(results.payrollNeeded)}</span>
                  </div>
                </div>

                {/* Difference */}
                <div className={`p-4 rounded ${results.isAbove28 ? 'bg-secondary/5 border border-secondary/20' : 'bg-destructive/5 border border-destructive/20'}`}>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {results.isAbove28 ? 'Folha Acima do Limite' : 'Folha Abaixo do Limite'}
                    </p>
                    <p className={`text-3xl font-bold ${results.isAbove28 ? 'text-secondary' : 'text-destructive'}`}>
                      {formatCurrency(Math.abs(results.difference))}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {results.isAbove28 
                        ? 'Você está R$ ' + formatCurrency(results.difference) + ' acima do limite de 28%'
                        : 'Faltam R$ ' + formatCurrency(Math.abs(results.difference)) + ' para atingir 28%'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>💡 Recomendações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {results.isAbove28 ? (
                  <>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Você deve usar Anexo III</p>
                      <p className="text-muted-foreground">
                        Seu Fator R está acima de 28%, o que significa que você tem uma folha de pagamento alta em relação à receita. 
                        Neste caso, você pode optar pelo Anexo III, que geralmente oferece alíquotas menores.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Margem até o Limite</p>
                      <p className="text-muted-foreground">
                        Você pode reduzir a folha de pagamento em até {formatCurrency(results.difference)} 
                        e ainda manter o Fator R acima de 28%.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Você deve usar Anexo V</p>
                      <p className="text-muted-foreground">
                        Seu Fator R está abaixo de 28%, o que significa que você tem uma folha de pagamento baixa em relação à receita. 
                        Neste caso, é obrigatório usar o Anexo V do Simples Nacional.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">Oportunidade de Otimização</p>
                      <p className="text-muted-foreground">
                        Para aumentar o Fator R e passar para Anexo III, você precisaria aumentar a folha de pagamento em {formatCurrency(Math.abs(results.difference))} 
                        ou reduzir a receita bruta no mesmo valor.
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tax Calculation Results */}
            {taxResults && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Cálculo do Imposto - {results.isAbove28 ? 'Anexo III' : 'Anexo V'}
                  </CardTitle>
                  <CardDescription>
                    {results.isAbove28 ? 'Serviços com Fator R ≥ 28% (alíquotas menores)' : 'Serviços com Fator R < 28% (alíquotas maiores)'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Tax Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-background/50 p-4 rounded border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Alíquota Nominal</p>
                      <p className="text-2xl font-bold text-primary">{(taxResults.nominalRate * 100).toFixed(2)}%</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded border border-border">
                      <p className="text-sm text-muted-foreground mb-1">Alíquota Efetiva</p>
                      <p className="text-2xl font-bold text-primary">{(taxResults.effectiveRate * 100).toFixed(2)}%</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded border border-border">
                      <p className="text-sm text-muted-foreground mb-1">DAS Mensal</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(taxResults.dasValue)}</p>
                    </div>
                    <div className="bg-background/50 p-4 rounded border border-border">
                      <p className="text-sm text-muted-foreground mb-1">DAS Anual</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(taxResults.dasValue * 12)}</p>
                    </div>
                  </div>

                  {/* Tax Breakdown */}
                  <div className="border-t border-border pt-4">
                    <p className="font-semibold text-sm mb-3">Distribuição de Tributos (Mensal)</p>
                    <div className="space-y-2">
                      {Object.entries(taxResults.taxBreakdown).map(([key, tax]) => {
                        const percentageOfRevenue = taxResults.monthlyRevenue > 0 
                          ? (tax.value / taxResults.monthlyRevenue) * 100 
                          : 0;
                        return (
                          <div key={key} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground capitalize">
                              {key === 'irpj' && 'IRPJ'}
                              {key === 'csll' && 'CSLL'}
                              {key === 'pis' && 'PIS'}
                              {key === 'cofins' && 'COFINS'}
                              {key === 'cpp' && 'CPP'}
                              {key === 'iss' && 'ISS'}
                              {key === 'icms' && 'ICMS'}
                              {key === 'ipi' && 'IPI'}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground w-12 text-right text-xs">{(tax.rate * 100).toFixed(2)}%</span>
                              <span className="font-semibold w-24 text-right">{formatCurrency(tax.value)}</span>
                              <span className="text-muted-foreground w-14 text-right text-xs bg-muted/50 px-2 py-1 rounded">{percentageOfRevenue.toFixed(2)}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-secondary/10 border border-secondary/20 p-4 rounded space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Receita Bruta Mensal:</span>
                      <span className="font-semibold">{formatCurrency(taxResults.monthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">RBT 12 Meses:</span>
                      <span className="font-semibold">{formatCurrency(taxResults.rbt12)}</span>
                    </div>
                    <div className="border-t border-secondary/20 pt-2 mt-2 flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">DAS Mensal (Total):</span>
                      <span className="text-lg font-bold text-primary">{formatCurrency(taxResults.dasValue)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Info Tabs */}
        <Tabs defaultValue="conceitos" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conceitos">Conceitos</TabsTrigger>
            <TabsTrigger value="exemplos">Exemplos</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="conceitos" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Conceitos Fundamentais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Folha de Pagamento</h4>
                  <p className="text-muted-foreground">
                    Soma de todos os salários, pró-labore e remunerações pagos aos sócios e funcionários durante os últimos 12 meses. Inclui 13º salário, férias e outras remunerações, mas exclui encargos patronais.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Receita Bruta Total (RBT)</h4>
                  <p className="text-muted-foreground">
                    Total de receitas da empresa nos últimos 12 meses, sem deduções. Para comércio, é o faturamento total. Para serviços, é o valor total dos serviços prestados.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Fator R</h4>
                  <p className="text-muted-foreground">
                    A razão entre a folha de pagamento anual e a receita bruta total. É calculado como: (Folha de Pagamento / RBT) × 100.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Anexo III vs Anexo V</h4>
                  <p className="text-muted-foreground">
                    <strong>Anexo III:</strong> Para empresas de serviços com Fator R ≥ 28% (alíquotas menores). <strong>Anexo V:</strong> Para empresas com Fator R &lt; 28% (alíquotas maiores).
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exemplos" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Exemplos Práticos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Exemplo 1: Fator R Acima de 28%</h4>
                  <p className="text-muted-foreground mb-2">
                    Empresa com RBT de R$ 600 mil e folha de pagamento de R$ 180 mil:
                  </p>
                  <p className="text-muted-foreground">
                    Fator R = (180.000 / 600.000) × 100 = 30%
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Resultado: Fator R de 30% está acima de 28%, portanto use <strong>Anexo III</strong>.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Exemplo 2: Fator R Abaixo de 28%</h4>
                  <p className="text-muted-foreground mb-2">
                    Empresa com RBT de R$ 600 mil e folha de pagamento de R$ 120 mil:
                  </p>
                  <p className="text-muted-foreground">
                    Fator R = (120.000 / 600.000) × 100 = 20%
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Resultado: Fator R de 20% está abaixo de 28%, portanto use <strong>Anexo V</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="faq" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">O Fator R é obrigatório?</h4>
                  <p className="text-muted-foreground">
                    Sim, o Fator R é obrigatório apenas para empresas de serviços. Empresas de comércio (Anexo I) e indústria (Anexo II) não precisam calcular o Fator R.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Posso mudar de Anexo durante o ano?</h4>
                  <p className="text-muted-foreground">
                    Não, a escolha do Anexo é feita no início do ano-calendário. Você só pode mudar no próximo ano se o Fator R se alterar.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Como aumentar meu Fator R?</h4>
                  <p className="text-muted-foreground">
                    Você pode aumentar o Fator R aumentando a folha de pagamento (contratando mais funcionários) ou reduzindo a receita bruta (o que não é recomendado).
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legal Notice */}
        <Alert className="mt-8 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-900">
            <strong>Aviso Legal:</strong> Este simulador é fornecido apenas para fins informativos e educacionais. Não substitui orientação profissional de um contador ou consultor tributário. Sempre consulte um profissional qualificado antes de tomar decisões tributárias importantes.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
