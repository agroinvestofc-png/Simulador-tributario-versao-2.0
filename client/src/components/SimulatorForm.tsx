import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnexoType, ANEXOS } from '@/lib/simplesNacional';
import { ArrowRight } from 'lucide-react';

interface SimulatorFormProps {
  onSubmit: (data: {
    monthlyRevenue: number;
    rbt12: number;
    anexo: AnexoType;
  }) => void;
  isLoading?: boolean;
}

export function SimulatorForm({ onSubmit, isLoading = false }: SimulatorFormProps) {
  const [monthlyRevenueInput, setMonthlyRevenueInput] = useState<string>('');
  const [rbt12Input, setRbt12Input] = useState<string>('');
  const [anexo, setAnexo] = useState<AnexoType>('I');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const monthlyValue = monthlyRevenueInput ? parseFloat(monthlyRevenueInput) / 100 : 0;
    if (!monthlyRevenueInput || monthlyValue <= 0) {
      newErrors.monthlyRevenue = 'Informe uma receita mensal válida';
    }

    const rbtValue = rbt12Input ? parseFloat(rbt12Input) / 100 : 0;
    if (!rbt12Input || rbtValue <= 0) {
      newErrors.rbt12 = 'Informe uma RBT válida';
    }

    if (rbtValue > 4800000) {
      newErrors.rbt12 = 'RBT não pode exceder R$ 4.800.000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        monthlyRevenue: parseFloat(monthlyRevenueInput) / 100,
        rbt12: parseFloat(rbt12Input) / 100,
        anexo,
      });
    }
  };

  const handleMonthlyRevenueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setMonthlyRevenueInput(value);
    if (errors.monthlyRevenue) {
      setErrors({ ...errors, monthlyRevenue: '' });
    }
  };

  const handleRbt12Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setRbt12Input(value);
    if (errors.rbt12) {
      setErrors({ ...errors, rbt12: '' });
    }
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

  return (
    <Card className="h-full border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Simulador Tributário</CardTitle>
        <CardDescription>
          Preencha os dados para calcular o DAS do Simples Nacional
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Receita Mensal */}
          <div className="space-y-2">
            <Label htmlFor="monthly-revenue" className="text-sm font-medium">
              Receita Bruta Mensal
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="monthly-revenue"
                type="text"
                placeholder="0,00"
                value={formatDisplayValue(monthlyRevenueInput)}
                onChange={handleMonthlyRevenueChange}
                className={`pl-10 text-right font-mono ${
                  errors.monthlyRevenue ? 'border-destructive' : ''
                }`}
              />
            </div>
            {errors.monthlyRevenue && (
              <p className="text-xs text-destructive">{errors.monthlyRevenue}</p>
            )}
          </div>

          {/* RBT 12 Meses */}
          <div className="space-y-2">
            <Label htmlFor="rbt12" className="text-sm font-medium">
              Receita Bruta Total (últimos 12 meses)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="rbt12"
                type="text"
                placeholder="0,00"
                value={formatDisplayValue(rbt12Input)}
                onChange={handleRbt12Change}
                className={`pl-10 text-right font-mono ${
                  errors.rbt12 ? 'border-destructive' : ''
                }`}
              />
            </div>
            {errors.rbt12 && (
              <p className="text-xs text-destructive">{errors.rbt12}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Máximo permitido: R$ 4.800.000
            </p>
          </div>

          {/* Anexo */}
          <div className="space-y-2">
            <Label htmlFor="anexo" className="text-sm font-medium">
              Regime Tributário (Anexo)
            </Label>
            <Select value={anexo} onValueChange={(value) => setAnexo(value as AnexoType)}>
              <SelectTrigger id="anexo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ANEXOS).map(([key, data]) => (
                  <SelectItem key={key} value={key}>
                    {data.name} - {data.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {ANEXOS[anexo].description}
            </p>
          </div>

          {/* Botão Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {isLoading ? (
              'Calculando...'
            ) : (
              <>
                Calcular DAS
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
