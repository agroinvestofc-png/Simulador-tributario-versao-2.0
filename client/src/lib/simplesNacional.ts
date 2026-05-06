/**
 * Lógica de Cálculo do Simples Nacional
 * Baseado na Lei Complementar nº 155/2016 e suas atualizações
 * Tabelas atualizadas para 2026 com faixas até R$ 4.800.000
 * 
 * Estrutura de Cálculo:
 * 1. Alíquota Efetiva = (RBT12 × Alíquota Nominal - Parcela a Deduzir) / RBT12
 * 2. DAS = Receita do Mês × Alíquota Efetiva
 * 3. Distribuição de Tributos = DAS × Percentual de Repartição
 */

export type AnexoType = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface TaxBracket {
  minRBT: number;
  maxRBT: number;
  nominalRate: number;
  deductionAmount: number;
  // Percentual de repartição do DAS para cada tributo
  irpj: number;
  csll: number;
  pis: number;
  cofins: number;
  cpp: number;
  icms?: number;
  iss?: number;
  ipi?: number;
}

export interface AnexoData {
  name: string;
  description: string;
  brackets: TaxBracket[];
}

/**
 * Tabelas de Alíquotas por Anexo (Lei Complementar nº 155/2016)
 * Atualizado para 2026 com faixas até R$ 4.800.000
 * Inclui percentual de repartição dos tributos por faixa
 */
export const ANEXOS: Record<AnexoType, AnexoData> = {
  I: {
    name: 'Anexo I - Comércio',
    description: 'Comércio',
    brackets: [
      {
        minRBT: 0,
        maxRBT: 180000,
        nominalRate: 0.04,
        deductionAmount: 0,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
      },
      {
        minRBT: 180000.01,
        maxRBT: 360000,
        nominalRate: 0.073,
        deductionAmount: 5940,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
      },
      {
        minRBT: 360000.01,
        maxRBT: 720000,
        nominalRate: 0.095,
        deductionAmount: 13860,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
      },
      {
        minRBT: 720000.01,
        maxRBT: 1800000,
        nominalRate: 0.107,
        deductionAmount: 22500,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
      },
      {
        minRBT: 1800000.01,
        maxRBT: 3600000,
        nominalRate: 0.143,
        deductionAmount: 87300,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
      },
      {
        minRBT: 3600000.01,
        maxRBT: 4800000,
        nominalRate: 0.19,
        deductionAmount: 378000,
        irpj: 0.135,
        csll: 0.1,
        pis: 0.0613,
        cofins: 0.2827,
        cpp: 0.421,
        icms: 0,
      },
    ],
  },
  II: {
    name: 'Anexo II - Indústria',
    description: 'Indústria',
    brackets: [
      {
        minRBT: 0,
        maxRBT: 180000,
        nominalRate: 0.045,
        deductionAmount: 0,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
        ipi: 0.075,
      },
      {
        minRBT: 180000.01,
        maxRBT: 360000,
        nominalRate: 0.078,
        deductionAmount: 5940,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
        ipi: 0.075,
      },
      {
        minRBT: 360000.01,
        maxRBT: 720000,
        nominalRate: 0.1,
        deductionAmount: 13860,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
        ipi: 0.075,
      },
      {
        minRBT: 720000.01,
        maxRBT: 1800000,
        nominalRate: 0.112,
        deductionAmount: 22500,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
        ipi: 0.075,
      },
      {
        minRBT: 1800000.01,
        maxRBT: 3600000,
        nominalRate: 0.147,
        deductionAmount: 85500,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0249,
        cofins: 0.1151,
        cpp: 0.375,
        icms: 0.32,
        ipi: 0.075,
      },
      {
        minRBT: 3600000.01,
        maxRBT: 4800000,
        nominalRate: 0.3,
        deductionAmount: 720000,
        irpj: 0.085,
        csll: 0.075,
        pis: 0.0454,
        cofins: 0.2096,
        cpp: 0.235,
        icms: 0,
        ipi: 0.35,
      },
    ],
  },
  III: {
    name: 'Anexo III - Serviços',
    description: 'Serviços (Fator R ≤ 28%)',
    brackets: [
      {
        minRBT: 0,
        maxRBT: 180000,
        nominalRate: 0.06,
        deductionAmount: 0,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0276,
        cofins: 0.1274,
        cpp: 0.42,
        iss: 0.335,
      },
      {
        minRBT: 180000.01,
        maxRBT: 360000,
        nominalRate: 0.112,
        deductionAmount: 9360,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0276,
        cofins: 0.1274,
        cpp: 0.42,
        iss: 0.335,
      },
      {
        minRBT: 360000.01,
        maxRBT: 720000,
        nominalRate: 0.135,
        deductionAmount: 17640,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0276,
        cofins: 0.1274,
        cpp: 0.42,
        iss: 0.335,
      },
      {
        minRBT: 720000.01,
        maxRBT: 1800000,
        nominalRate: 0.16,
        deductionAmount: 35640,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0276,
        cofins: 0.1274,
        cpp: 0.42,
        iss: 0.335,
      },
      {
        minRBT: 1800000.01,
        maxRBT: 3600000,
        nominalRate: 0.21,
        deductionAmount: 125640,
        irpj: 0.055,
        csll: 0.035,
        pis: 0.0276,
        cofins: 0.1274,
        cpp: 0.42,
        iss: 0.335,
      },
      {
        minRBT: 3600000.01,
        maxRBT: 4800000,
        nominalRate: 0.33,
        deductionAmount: 648000,
        irpj: 0.135,
        csll: 0.1,
        pis: 0.0613,
        cofins: 0.2827,
        cpp: 0.421,
        iss: 0,
      },
    ],
  },
  IV: {
    name: 'Anexo IV - Serviços',
    description: 'Serviços (Limpeza/Vigilância)',
    brackets: [
      {
        minRBT: 0,
        maxRBT: 180000,
        nominalRate: 0.045,
        deductionAmount: 0,
        irpj: 0.188,
        csll: 0.152,
        pis: 0.0383,
        cofins: 0.1767,
        cpp: 0,
        iss: 0.445,
      },
      {
        minRBT: 180000.01,
        maxRBT: 360000,
        nominalRate: 0.09,
        deductionAmount: 8100,
        irpj: 0.198,
        csll: 0.152,
        pis: 0.0445,
        cofins: 0.2055,
        cpp: 0,
        iss: 0.4,
      },
      {
        minRBT: 360000.01,
        maxRBT: 720000,
        nominalRate: 0.102,
        deductionAmount: 12420,
        irpj: 0.208,
        csll: 0.152,
        pis: 0.0427,
        cofins: 0.1973,
        cpp: 0,
        iss: 0.4,
      },
      {
        minRBT: 720000.01,
        maxRBT: 1800000,
        nominalRate: 0.14,
        deductionAmount: 39780,
        irpj: 0.178,
        csll: 0.192,
        pis: 0.041,
        cofins: 0.189,
        cpp: 0,
        iss: 0.4,
      },
      {
        minRBT: 1800000.01,
        maxRBT: 3600000,
        nominalRate: 0.22,
        deductionAmount: 183780,
        irpj: 0.188,
        csll: 0.192,
        pis: 0.0392,
        cofins: 0.1808,
        cpp: 0,
        iss: 0.4,
      },
      {
        minRBT: 3600000.01,
        maxRBT: 4800000,
        nominalRate: 0.33,
        deductionAmount: 828000,
        irpj: 0.535,
        csll: 0.215,
        pis: 0.0445,
        cofins: 0.2055,
        cpp: 0,
        iss: 0,
      },
    ],
  },
  V: {
    name: 'Anexo V - Serviços',
    description: 'Serviços (Fator R > 28%)',
    brackets: [
      {
        minRBT: 0,
        maxRBT: 180000,
        nominalRate: 0.155,
        deductionAmount: 0,
        irpj: 0.25,
        csll: 0.15,
        pis: 0.0305,
        cofins: 0.141,
        cpp: 0.2885,
        iss: 0.14,
      },
      {
        minRBT: 180000.01,
        maxRBT: 360000,
        nominalRate: 0.18,
        deductionAmount: 4500,
        irpj: 0.23,
        csll: 0.15,
        pis: 0.0305,
        cofins: 0.141,
        cpp: 0.2785,
        iss: 0.17,
      },
      {
        minRBT: 360000.01,
        maxRBT: 720000,
        nominalRate: 0.195,
        deductionAmount: 9900,
        irpj: 0.24,
        csll: 0.15,
        pis: 0.0323,
        cofins: 0.1492,
        cpp: 0.2385,
        iss: 0.19,
      },
      {
        minRBT: 720000.01,
        maxRBT: 1800000,
        nominalRate: 0.205,
        deductionAmount: 17100,
        irpj: 0.21,
        csll: 0.15,
        pis: 0.0341,
        cofins: 0.1574,
        cpp: 0.2385,
        iss: 0.21,
      },
      {
        minRBT: 1800000.01,
        maxRBT: 3600000,
        nominalRate: 0.23,
        deductionAmount: 62100,
        irpj: 0.23,
        csll: 0.125,
        pis: 0.0305,
        cofins: 0.141,
        cpp: 0.2385,
        iss: 0.235,
      },
      {
        minRBT: 3600000.01,
        maxRBT: 4800000,
        nominalRate: 0.305,
        deductionAmount: 540000,
        irpj: 0.35,
        csll: 0.155,
        pis: 0.0356,
        cofins: 0.1644,
        cpp: 0.295,
        iss: 0,
      },
    ],
  },
};

export interface CalculationResult {
  monthlyRevenue: number;
  rbt12: number;
  selectedAnexo: AnexoType;
  nominalRate: number;
  deductionAmount: number;
  effectiveRate: number;
  dasValue: number;
  taxBreakdown: {
    irpj: { rate: number; value: number; effectiveRate: number };
    csll: { rate: number; value: number; effectiveRate: number };
    pis: { rate: number; value: number; effectiveRate: number };
    cofins: { rate: number; value: number; effectiveRate: number };
    cpp: { rate: number; value: number; effectiveRate: number };
    icms?: { rate: number; value: number; effectiveRate: number };
    iss?: { rate: number; value: number; effectiveRate: number };
    ipi?: { rate: number; value: number; effectiveRate: number };
  };
}

export function calculateSimples(
  monthlyRevenue: number,
  rbt12: number,
  anexo: AnexoType
): CalculationResult {
  const anexoData = ANEXOS[anexo];
  const bracket = anexoData.brackets.find(
    (b) => rbt12 >= b.minRBT && rbt12 <= b.maxRBT
  );

  if (!bracket) {
    throw new Error('RBT fora do intervalo permitido');
  }

  // Cálculo da alíquota efetiva
  const nominalValue = rbt12 * bracket.nominalRate;
  const effectiveValue = nominalValue - bracket.deductionAmount;
  let effectiveRate = effectiveValue / rbt12;

  // DAS = Receita Mensal × Alíquota Efetiva
  const dasValue = monthlyRevenue * effectiveRate;

  // Distribuição de tributos conforme percentual de repartição do DAS
  const taxBreakdown: CalculationResult['taxBreakdown'] = {
    irpj: {
      rate: bracket.irpj,
      value: dasValue * bracket.irpj,
      effectiveRate: bracket.irpj,
    },
    csll: {
      rate: bracket.csll,
      value: dasValue * bracket.csll,
      effectiveRate: bracket.csll,
    },
    pis: {
      rate: bracket.pis,
      value: dasValue * bracket.pis,
      effectiveRate: bracket.pis,
    },
    cofins: {
      rate: bracket.cofins,
      value: dasValue * bracket.cofins,
      effectiveRate: bracket.cofins,
    },
    cpp: {
      rate: bracket.cpp,
      value: dasValue * bracket.cpp,
      effectiveRate: bracket.cpp,
    },
  };

  if (bracket.icms !== undefined && bracket.icms > 0) {
    taxBreakdown.icms = {
      rate: bracket.icms,
      value: dasValue * bracket.icms,
      effectiveRate: bracket.icms,
    };
  }

  if (bracket.iss !== undefined && bracket.iss > 0) {
    taxBreakdown.iss = {
      rate: bracket.iss,
      value: dasValue * bracket.iss,
      effectiveRate: bracket.iss,
    };
  }

  if (bracket.ipi !== undefined && bracket.ipi > 0) {
    taxBreakdown.ipi = {
      rate: bracket.ipi,
      value: dasValue * bracket.ipi,
      effectiveRate: bracket.ipi,
    };
  }

  return {
    monthlyRevenue,
    rbt12,
    selectedAnexo: anexo,
    nominalRate: bracket.nominalRate,
    deductionAmount: bracket.deductionAmount,
    effectiveRate,
    dasValue,
    taxBreakdown,
  };
}

export interface ComparisonResult {
  scenario1: CalculationResult;
  scenario2: CalculationResult;
  difference: number;
  savings: number;
  savingsPercentage: number;
}

export function compareScenarios(
  monthlyRevenue: number,
  rbt12: number,
  anexo1: AnexoType,
  anexo2: AnexoType
): ComparisonResult {
  const scenario1 = calculateSimples(monthlyRevenue, rbt12, anexo1);
  const scenario2 = calculateSimples(monthlyRevenue, rbt12, anexo2);

  const difference = scenario1.dasValue - scenario2.dasValue;
  const savings = Math.abs(difference);
  const savingsPercentage = (savings / Math.max(scenario1.dasValue, scenario2.dasValue)) * 100;

  return {
    scenario1,
    scenario2,
    difference,
    savings,
    savingsPercentage,
  };
}
