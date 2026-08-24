import { generateIdempotencyKey, simulateNetworkLatency } from './NotificationService';
import { Product, CrmContact } from '../types';

export interface PosSalePayload {
    cart: { id: string; product: Product; qty: number; colorNote?: string; isCunete?: boolean }[];
    customer: CrmContact | null;
    paymentMethod: string;
    posLocation: string;
    subtotal: number;
    iva: number;
    total: number;
    isCreditSale: boolean;
    discountPercent: number;
    activeUserId: string;
}

export interface PosSaleResponse {
    success: boolean;
    transactionId: string;
    idempotencyKey: string;
    timestamp: string;
    message: string;
}

export class PosService {
    /**
     * Processes a POS Sale. 
     * Simulates backend validation, Idempotency, and transaction immutability.
     */
    static async processSale(payload: PosSalePayload): Promise<PosSaleResponse> {
        const idempotencyKey = generateIdempotencyKey();
        
        // 1. Simulate complex network latency and database transaction locking (1.5 to 2.5 seconds)
        const delay = 1500 + Math.random() * 1000;
        await simulateNetworkLatency(delay);

        // 2. In a real backend, we would validate:
        // - Inventory is sufficient (prevent race conditions)
        // - Credit limit is not exceeded (if credit sale)
        // - Idempotency key is unique

        // 3. Generate a backend-authoritative transaction ID
        const transactionId = `TXN-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        return {
            success: true,
            transactionId,
            idempotencyKey,
            timestamp: new Date().toISOString(),
            message: "Transacción procesada correctamente."
        };
    }
}
