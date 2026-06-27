
export enum InventoryStatus {
  ACTIVE = 'Activo',
  SLOW = 'Lento',
  SILENT = 'Silencioso',
  DEAD = 'Obsoleto',
}

export enum Category {
  RAW_MATERIAL = 'Materia Prima Nacional',
  RAW_MATERIAL_IMPORTADA = 'Materia Prima Importada',
  WIP = 'En Proceso (WIP)',
  FINISHED_GOOD = 'Producto Terminado',
  HARDWARE = 'Insumos y Ferretería',
  SERVICE = 'Servicio',
}

export enum ABCClass {
  A = 'A',
  B = 'B',
  C = 'C',
}

export enum XYZClass {
  X = 'X', // Stable demand
  Y = 'Y', // Variable
  Z = 'Z', // Sporadic
}

export enum BatchStatus {
  SCHEDULED = 'Programado',
  IN_PROGRESS = 'En Proceso',
  QA_CHECK = 'Control Calidad',
  COMPLETED = 'Completado',
}

export enum CustomerTier {
  STRATEGIC = 'Estratégico',
  REGULAR = 'Regular',
  NEW = 'Nuevo',
}

export interface Customer {
  id: string;
  name: string;
  tier: CustomerTier;
  slaLevel: 'Gold' | 'Silver' | 'Bronze';
}

export interface SalesOrder {
  id: string;
  customerId: string;
  skuId: string;
  qty: number;
  orderDate: string;
  requiredDate: string;
  marginPercent: number;
  status: 'Allocated' | 'Backorder' | 'Pending';
  priorityScore: number; // Calculated field
}

export interface Batch {
  id: string;
  skuId: string;
  lotNumber: string;
  expiryDate: string;
  dateIn: string; // Entry date for precise aging
  quantity: number;
  reserved: number; // Committed stock per batch
  location: string;
}

export interface Product {
  id: string;
  sku: string;
  originalSku: string;
  barcode?: string; // For POS scanning
  name: string;
  category: Category;
  family?: string; // e.g. DISOLVENTES, IGNIFUGOS
  brand?: string;
  baseUnit?: 'L' | 'KG' | 'UNIT' | string; // Unidad base de control de inventario
  density?: number; // Factor Kg/L (Ej. 0.85). Requerido para mezclas.
  unitCost: number;
  price: number;
  totalStock: number;
  reservedStock: number; // ATP = Total - Reserved
  status: InventoryStatus;
  abc: ABCClass;
  xyz: XYZClass;
  agingDays: number; // Average aging
  batches: Batch[];
  mixingInstructions?: string; // e.g. "CAT 82 AL 50% DIS 7771 AL 25%"
  informationalNote?: string; // High-visibility note for the user
  taxRate?: number; // Impuesto aplicado al producto (ej. 19, 5, 0)
  isPendingAccountingReview?: boolean; // Flag para solicitar cambio de familia a contabilidad
  pendingAccountingChanges?: {
      requestedAt: string;
      requestedBy: string;
      category?: Category;
      family?: string;
      brand?: string;
  };
}

export interface Transfer {
  id: string;
  skuId: string;
  productName: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  status: 'Pendiente' | 'En Tránsito' | 'Recibido';
  requestDate: string;
  eta: string;
}

export interface InboundReceiptItem {
    sku: string;
    description: string;
    packages: number;
    capacity: string;
    totalLiters: number;
    unitCost: number;
}

export interface InboundReceipt {
    id: string;
    documentNumber: string;
    dateIn: string;
    items: InboundReceiptItem[];
    status: 'PENDING' | 'PROCESSED';
}

export interface RecipeIngredient {
    productId: string; // The raw material / component ID
    quantity: number; // The amount required for 1 unit of final product
}

export interface Recipe {
    id: string;
    finalProductId: string; // The resulting product ID
    ingredients: RecipeIngredient[];
}

export interface FormulaItem {
    name: string;
    unit: string;
    plannedQty: number;
    actualQty: number; // If actual > planned, creates variance
    costImpact: number; // Value of the variance
}

export interface ProductionBatch {
    id: string;
    batchNumber: string;
    productName: string;
    sku: string;
    status: BatchStatus;
    startDate: string;
    endDate?: string;
    
    // Quantity Metrics
    plannedOutput: number;
    actualOutput: number;
    waste: number; // Merma in units/kg
    rework: boolean; // Was rework required?
    
    // Financials
    standardUnitCost: number;
    realUnitCost: number; // Calculated after deviations
    
    ingredients: FormulaItem[];
}

export interface SalesRecord {
  month: string;
  sales: number;
  forecast: number;
}

export interface ForecastDataPoint {
    month: string;
    historical?: number;
    conservative: number;
    base: number;
    aggressive: number;
    pipelineWeighted: number; // Sales pipeline probability weighted
}

export interface DemandAlert {
    id: string;
    sku: string;
    productName: string;
    type: 'STOCKOUT' | 'OVERSTOCK';
    projectedDate: string;
    gapQuantity: number;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export type ActionType = 'LIQUIDATION' | 'TRANSFER' | 'BUNDLE' | 'SCRAP';

export interface ActionOpportunity {
    id: string;
    type: ActionType;
    skuId: string;
    productName: string;
    reason: string; // e.g., "Silent > 180 days"
    suggestedAction: string; // e.g., "Promo 20% Off"
    
    // Impact Analysis
    quantityToMove: number;
    potentialCashRelease: number;
    marginImpactPercent: number; // Negative for discounts
    costOfAction: number; // e.g., Logistics cost
    
    status: 'PENDING' | 'EXECUTED' | 'DISMISSED';
}

export interface Vendor {
    id: string;
    name: string;
    leadTimeDays: number;
    reliabilityScore: number; // 0-100
    qualityScore: number; // 0-100
    priceIndex: 'Low' | 'Medium' | 'High';
}

export interface PurchaseSuggestion {
    id: string;
    skuId: string;
    productName: string;
    suggestedQty: number;
    unitCost: number;
    totalCost: number;
    recommendedVendorId: string;
    reason: string; // e.g. "Below Reorder Point (ROP)"
    urgency: 'High' | 'Medium' | 'Low';
    
    // Intelligence
    forecastCoverageDays: number; // How many days of demand this buys
    riskOfOverstock: 'Low' | 'Medium' | 'High'; // Analysis of "Bad Buy"
    status: 'Proposed' | 'Approved' | 'Rejected';
}

export interface KPI {
  label: string;
  value: string;
  change: number;
  isPositive: boolean;
  unit?: string;
}

// --- EVENT LOG TYPES ---

export type EventActorType = 'HUMAN' | 'SYSTEM' | 'AI';
export type EventCategory = 'OPERATIONS' | 'PLANNING' | 'FINANCE' | 'INTELLIGENCE' | 'ERROR';
export type ConfidenceLevel = 'MANUAL' | 'ASSISTED' | 'AUTOMATIC';

export interface SystemEvent {
  event_id: string;
  event_type: string; // e.g., 'STOCK_ADJUSTMENT', 'PO_CREATED'
  event_category: EventCategory;
  entity_type: string; // 'SKU', 'ORDER', 'BATCH'
  entity_id: string;
  
  actor_type: EventActorType;
  actor_id: string; // 'user_123', 'system_cron', 'gemini-pro'
  
  timestamp: string; // ISO-8601
  
  previous_state: Record<string, any> | null;
  new_state: Record<string, any> | null;
  
  context: {
    channel: 'WEB' | 'MOBILE' | 'API' | 'SYSTEM';
    location?: string;
    reason?: string;
    meta?: Record<string, any>;
  };
  
  causal_chain_id: string; // ID to group related events
  confidence_level: ConfidenceLevel;
}

// --- CRM TYPES ---

export type CrmDealStage = 'LEAD' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
export type CrmPostSaleStage = 'ONBOARDING' | 'RENTABILIZACION' | 'FIDELIZACION' | 'MONITOREO';
export type CrmLeadSource = 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'GOOGLE_ADS' | 'MANUAL' | 'STREET' | 'REFERRAL' | 'WEBSITE';

export type PurchasePattern = 'ESTACIONAL' | 'DICIEMBRE' | 'TRIMESTRAL' | 'RECURRENTE' | 'IRREGULAR';

export interface CrmPurchaseHistory {
  monthly: number;
  quarterly: number;
  annual: number;
  previousYear: number;
  historicalAverage?: number; // Req 18
  profitabilityMargin?: number; // Req 17, % value e.g. 25.5
  purchasePattern?: PurchasePattern; // Req 21
  evolution: { month: string; amount: number }[];
}

export type FiscalClassification = 'PERSONA_NATURAL' | 'PERSONA_JURIDICA' | 'GRAN_CONTRIBUYENTE' | 'REGIMEN_SIMPLE';
export type CityCode = 'BOGOTA' | 'BARRANQUILLA' | 'OTRA';

export interface CrmContact {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  tier: CustomerTier;
  status: 'LEAD' | 'PROSPECTO' | 'VINCULADO' | 'INACTIVO';
  source: CrmLeadSource;
  lastContactDate: string;
  ownerId: string;
  postSaleStage?: CrmPostSaleStage;
  documentType?: 'NIT' | 'CC' | 'CE' | 'PASAPORTE';
  documentNumber?: string;
  decisionMakers?: { name: string; position: string; hobby?: string; birthday?: string }[];
  purchaseHistory?: CrmPurchaseHistory;
  taxRuleId?: string;
  pricingRuleId?: string;
  paymentRuleId?: string;
  fiscalClassification?: FiscalClassification;
  cityCode?: CityCode;
  tags?: string[];
  accountBalance?: number; // Saldo a favor (Ej. por Notas Crédito)
  creditLimit?: number; // Cupo de crédito total
  creditLimitUsed?: number; // Cupo de crédito utilizado / deuda actual
  hasOverdueBills?: boolean; // Indica si el cliente tiene facturas en mora
  address?: string;
}

export interface CrmView {
  id: string;
  name: string;
  icon?: string;
  filters: any; // Simplified for now
  visibleColumns: string[];
  mode: 'TABLE' | 'KANBAN';
}

export interface TaxRule {
  id: string;
  name: string;
  taxRateOverride: number; // e.g., 0 for Zona Franca
}

export interface PricingRule {
  id: string;
  name: string;
  discountPercentage: number; // e.g., 15 for Mayorista
}

export interface PaymentRule {
  id: string;
  name: string;
  type: 'CONTADO' | 'CREDITO';
  days?: number; // e.g., 30, 60, 90
}

export interface CrmDeal {
  id: string;
  title: string;
  contactId: string;
  company: string;
  value: number;
  stage: CrmDealStage;
  expectedCloseDate: string;
  probability: number; // 0-100
  ownerId: string;
  notes?: string;
  lostReason?: string;
  purchaseExpectation?: string;
}

export interface CrmActivity {
  id: string;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'VISIT' | 'WHATSAPP' | 'QUOTE' | 'FOLLOW_UP';
  title: string;
  description: string;
  date: string;
  contactId: string;
  dealId?: string;
  status: 'PENDING' | 'COMPLETED';
  ownerId: string;
  nextAction?: string;
  nextActionDate?: string;
}

export interface CrmAssignmentLog {
  id: string;
  contactId: string;
  previousOwnerId?: string;
  newOwnerId: string;
  assignedByUserId: string;
  date: string;
}

export interface CrmNotification {
  id: string;
  type: 'BIRTHDAY' | 'HOBBY_MATCH' | 'GARBAGE_WARNING' | 'SYSTEM';
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedContactId?: string;
}

// --- SYSTEM CONFIGURATION TYPES ---

export interface SystemSettings {
  inventory: {
    slowAgingDays: number;
    silentAgingDays: number;
    deadAgingDays: number;
    abcThresholdA: number; // Percent of value
    abcThresholdB: number;
  };
  production: {
    wasteTolerancePercent: number;
    standardLaborCostPerHour: number;
    overheadRate: number;
  };
  sales: {
    defaultTargetMargin: number;
    strategicCustomerDiscount: number;
    priorityWeights: {
      margin: number;
      customerTier: number;
      urgency: number;
    };
  };
  purchasing: {
    safetyStockBufferDays: number;
    minVendorReliability: number;
    autoApproveThreshold: number;
  };
  finance: {
    currency: string;
    taxRate: number;
    annualHoldingCostPercent: number;
  };
  formulation: {
    vendorRules: {
        id: string;
        brand: string;
        prefixRules: {
            id: string;
            prefix: string; // e.g. "TZ"
            meaning: string; // e.g. "Disolvente"
        }[];
        categoryName: string;
    }[];
    uomRules: {
        id: string;
        regexTags: string[]; // e.g. ["GL", "GALON"]
        std: string;
        factorToLiter: number;
    }[];
    globalSkuPattern: string;
    skuSeparator: string;
  };
}

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'SALES_REP';
  avatar?: string;
  quota: number; // Monthly sales quota
  region?: string;
}

export interface CrmSettings {
  leadSources: CrmLeadSource[];
  stages: { id: CrmDealStage; label: string; defaultProbability: number }[];
  sla: {
    maxHoursUncontactedLead: number;
    maxDaysInStage: number;
  };
  globalGoals: {
    monthlyRevenue: number;
    monthlyDeals: number;
  };
  clientHealthThresholds: {
    redMax: number;
    yellowMax: number;
  };
}

export interface AccountingTransaction {
  id: string;
  date: string;
  type: 'VENTA' | 'COMPRA' | 'AJUSTE_MERMA' | 'NOTA_CREDITO' | 'NOTA_DEBITO' | 'PAGO_RECIBIDO';
  client: string;
  clientId?: string;
  document: string;
  sku: string;
  productName: string;
  qty: number;
  total: number;
  iva: number;
  paymentMethod: string;
  posLocation: string;
  family?: string;
  category?: string;
  dueDate?: string;
  paymentStatus?: 'PENDIENTE' | 'PAGADA' | 'EN_MORA';
  balance?: number;
  validationStatus?: 'PENDIENTE_VALIDACION' | 'VALIDADA';
  bankAmount?: number;
  bankFee?: number;
  reconciledDate?: string;
}

export interface TaxRate {
  id: string;
  name: string;
  percentage: number;
  isActive: boolean;
  isDefault: boolean;
}

export interface AuditIssue {
    category: 'SIIGO_NIT' | 'TAX_MATH' | 'LEDGER_INTEGRITY' | 'SKU_ORPHAN';
    severity: 'HIGH' | 'MEDIUM';
    description: string;
    details: string;
}

export interface AuditReport {
    id: string;
    date: string;
    timestamp: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR';
    issues: AuditIssue[];
}

