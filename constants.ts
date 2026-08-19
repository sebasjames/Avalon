import { Product, InventoryStatus, Category, ABCClass, XYZClass, SalesRecord, Transfer, ProductionBatch, BatchStatus, Customer, SalesOrder, CustomerTier, ForecastDataPoint, DemandAlert, ActionOpportunity, Vendor, PurchaseSuggestion, SystemEvent, SystemSettings, CrmContact, CrmDeal, CrmActivity, CrmUser, CrmSettings, TaxRule, PricingRule, PaymentRule, Supplier } from './types';

export const RETEFUENTE_RATE = 2.5;
export const RETEICA_BOGOTA = 1.104;
export const RETEICA_BARRANQUILLA = 0.966;
export const DEFAULT_SETTINGS: SystemSettings = {
  inventory: {
    slowAgingDays: 60,
    silentAgingDays: 120,
    deadAgingDays: 365,
    abcThresholdA: 80,
    abcThresholdB: 15,
  },
  production: {
    wasteTolerancePercent: 5,
    standardLaborCostPerHour: 25,
    overheadRate: 15,
  },
  sales: {
    defaultTargetMargin: 30,
    strategicCustomerDiscount: 10,
    priorityWeights: {
      margin: 0.4,
      customerTier: 0.4,
      urgency: 0.2,
    },
  },
  purchasing: {
    safetyStockBufferDays: 15,
    minVendorReliability: 80,
    autoApproveThreshold: 10000,
  },
  finance: {
    currency: 'COP',
    taxRate: 19,
    annualHoldingCostPercent: 25,
  },
  formulation: {
    vendorRules: [
      {
        id: '1',
        brand: 'ILVA',
        categoryName: 'Materia Prima (ILVA)',
        prefixRules: [
          { id: 'il1', prefix: 'TZ', meaning: 'Disolvente' },
          { id: 'il2', prefix: 'TV', meaning: 'Catalizador' },
          { id: 'il3', prefix: 'TX', meaning: 'Laca/Barniz' },
          { id: 'il4', prefix: 'TG', meaning: 'Fondo/Primario' },
          { id: 'il5', prefix: 'PM', meaning: 'Acabado' },
          { id: 'il6', prefix: 'TO', meaning: 'Especial' },
          { id: 'il7', prefix: 'TS', meaning: 'Especial' }
        ]
      },
      {
        id: '2',
        brand: 'Carpoly',
        categoryName: 'Materia Prima (Carpoly)',
        prefixRules: [
          { id: 'ca1', prefix: 'IME', meaning: 'Resina/Base' },
          { id: 'ca2', prefix: 'IRPE', meaning: 'Resina Especial' },
          { id: 'ca3', prefix: 'ITD', meaning: 'Tinte' },
          { id: 'ca4', prefix: 'IGH', meaning: 'Endurecedor' }
        ]
      },
      {
        id: '3',
        brand: 'BARPIMO',
        categoryName: 'Materia Prima (Barpimo)',
        prefixRules: [
          { id: 'ba1', prefix: 'A-', meaning: 'Tinte General' },
          { id: 'ba2', prefix: 'J-', meaning: 'Tinte' },
          { id: 'ba3', prefix: 'F-', meaning: 'Fondo' },
          { id: 'ba4', prefix: '\\d{5,}', meaning: 'Químico Estándar' }
        ]
      }
    ],
    uomRules: [
      { id: '1', regexTags: ['GL', 'GALON', 'GALONES'], std: 'GL', factorToLiter: 3.785 },
      { id: '2', regexTags: ['LT', 'LITRO', 'LITROS'], std: 'LT', factorToLiter: 1 },
      { id: '3', regexTags: ['1\\/4', '1\\/4 GALON', 'QT', 'CUARTO'], std: 'QT', factorToLiter: 0.946 },
      { id: '4', regexTags: ['1\\/2', '1\\/2 GALON'], std: '1/2 GL', factorToLiter: 1.892 },
      { id: '5', regexTags: ['CUÑETE', 'CUNETE'], std: 'CUNETE', factorToLiter: 18.925 },
      { id: '6', regexTags: ['KG', 'KILO', 'KILOGRAMO'], std: 'KG', factorToLiter: 1 },
      { id: '7', regexTags: ['UN', 'UND', 'UNIDAD'], std: 'UN', factorToLiter: 0 },
      { id: '8', regexTags: ['TAMBOR'], std: 'TAMBOR', factorToLiter: 208 },
      { id: '9', regexTags: ['5 LITROS'], std: '5L', factorToLiter: 5 },
      { id: '10', regexTags: ['500 CC'], std: '500 CC', factorToLiter: 0.5 },
      { id: '11', regexTags: ['250 CC'], std: '250 CC', factorToLiter: 0.25 },
      { id: '12', regexTags: ['200 CC'], std: '200 CC', factorToLiter: 0.2 },
      { id: '13', regexTags: ['50 CC'], std: '50 CC', factorToLiter: 0.05 },
      { id: '14', regexTags: ['500 GR', '500 GRAMOS'], std: '500 GR', factorToLiter: 0.5 },
      { id: '15', regexTags: ['100 GR', '100 GRAMOS'], std: '100 GR', factorToLiter: 0.1 },
      { id: '16', regexTags: ['50 GR', '50 GRAMOS'], std: '50 GR', factorToLiter: 0.05 },
      { id: '17', regexTags: ['KA'], std: 'KA', factorToLiter: 1 },
      { id: '18', regexTags: ['TBD'], std: 'TBD', factorToLiter: 0 }
    ],
    globalSkuPattern: '[BRAND][ORIGINAL]',
    skuSeparator: '-'
  }
};

export { INVENTORY_DATA } from './data/inventory';
export const SALES_DATA: SalesRecord[] = [];
export const MOCK_TRANSFERS: Transfer[] = [];
export const MOCK_PRODUCTION: ProductionBatch[] = [];
export const MOCK_CUSTOMERS: Customer[] = [];
export const MOCK_SALES_ORDERS: SalesOrder[] = [];
export const MOCK_FORECAST_DATA: ForecastDataPoint[] = [];
export const MOCK_DEMAND_ALERTS: DemandAlert[] = [];
export const MOCK_OPPORTUNITIES: ActionOpportunity[] = [];
export const MOCK_VENDORS: Vendor[] = [
    {
        id: "V-1",
        name: "ILVA",
        leadTimeDays: 60,
        reliabilityScore: 90,
        qualityScore: 95,
        priceIndex: "Medium"
    },
    {
        id: "V-2",
        name: "PINTURAS PREMIUM",
        leadTimeDays: 60,
        reliabilityScore: 90,
        qualityScore: 95,
        priceIndex: "Medium"
    },
    {
        id: "V-3",
        name: "BARPIMO",
        leadTimeDays: 60,
        reliabilityScore: 90,
        qualityScore: 95,
        priceIndex: "Medium"
    },
    {
        id: "V-4",
        name: "PROCOQUINAL",
        leadTimeDays: 60,
        reliabilityScore: 90,
        qualityScore: 95,
        priceIndex: "Medium"
    },
    {
        id: "V-5",
        name: "VETRO",
        leadTimeDays: 60,
        reliabilityScore: 90,
        qualityScore: 95,
        priceIndex: "Medium"
    },
    {
        id: "V-6",
        name: "Materia Prima Nacional",
        leadTimeDays: 60,
        reliabilityScore: 90,
        qualityScore: 95,
        priceIndex: "Medium"
    }
];
export const MOCK_PURCHASE_SUGGESTIONS: PurchaseSuggestion[] = [];
export const MOCK_EVENT_LOG: SystemEvent[] = [];
export const MOCK_TAX_RULES: TaxRule[] = [];
export const MOCK_PRICING_RULES: PricingRule[] = [];
export const MOCK_PAYMENT_RULES: PaymentRule[] = [];

export const MOCK_CRM_DEALS: CrmDeal[] = [];
export const MOCK_CRM_ACTIVITIES: CrmActivity[] = [];

export const MOCK_CRM_SETTINGS: CrmSettings = {
  leadSources: ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'GOOGLE_ADS', 'MANUAL', 'STREET', 'REFERRAL', 'WEBSITE'],
  stages: [
    { id: 'LEAD', label: 'Lead', defaultProbability: 10 },
    { id: 'QUALIFIED', label: 'Calificado', defaultProbability: 30 },
    { id: 'PROPOSAL', label: 'Propuesta', defaultProbability: 50 },
    { id: 'NEGOTIATION', label: 'Negociación', defaultProbability: 80 },
    { id: 'CLOSED_WON', label: 'Ganado', defaultProbability: 100 },
    { id: 'CLOSED_LOST', label: 'Perdido', defaultProbability: 0 }
  ],
  sla: {
    maxHoursUncontactedLead: 48,
    maxDaysInStage: 15
  },
  whaleAlertThreshold: 50000000,
  maxCollectionDaysForCommission: 60,
  lateCollectionPenaltyPercent: 100,
  autoAssignLeads: true,
  globalGoals: {
    monthlyRevenue: 40000000000,
    monthlyDeals: 50
  },
  clientHealthThresholds: {
    redMax: 40,
    yellowMax: 70
  }
};
export const MOCK_SUPPLIERS: Supplier[] = [];
