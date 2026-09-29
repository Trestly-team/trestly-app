/**
 * Trestly contract interface bindings
 * Matches the trestly-contract spec exactly
 */
import { rpc, TransactionBuilder, xdr } from "@stellar/stellar-sdk";
import { TrestlyConfig, EscrowedPayment } from "./types.js";
/**
 * Build a transaction for the Trestly contract
 */
export declare function buildContractTransaction(config: TrestlyConfig, sourceAccount: string, method: string, params: xdr.ScVal[]): Promise<{
    transaction: TransactionBuilder;
    server: rpc.Server;
}>;
/**
 * Simulate a transaction and return the prepared transaction
 */
export declare function simulateTransaction(server: rpc.Server, transaction: TransactionBuilder): Promise<string>;
/**
 * Submit a signed transaction and wait for confirmation
 */
export declare function submitAndConfirm(server: rpc.Server, signedXdr: string, networkPassphrase: string): Promise<string>;
/**
 * Parse EscrowedPayment from contract return value
 */
export declare function parseEscrowedPayment(scVal: xdr.ScVal): EscrowedPayment;
/**
 * Build parameters for create_payment contract method
 */
export declare function buildCreatePaymentParams(params: {
    payer: string;
    payee: string;
    token: string;
    amount: bigint;
    disputeWindowSecs: number;
    arbiter: string;
}): xdr.ScVal[];
/**
 * Build parameters for raise_dispute contract method
 */
export declare function buildRaiseDisputeParams(params: {
    paymentId: number;
    payer: string;
}): xdr.ScVal[];
/**
 * Build parameters for release contract method
 */
export declare function buildReleaseParams(paymentId: number): xdr.ScVal[];
/**
 * Build parameters for resolve_dispute contract method
 */
export declare function buildResolveDisputeParams(params: {
    paymentId: number;
    arbiter: string;
    refundToPayer: boolean;
}): xdr.ScVal[];
/**
 * Build parameters for get_payment contract method
 */
export declare function buildGetPaymentParams(paymentId: number): xdr.ScVal[];
/**
 * Extract payment ID from create_payment return value
 */
export declare function parsePaymentId(scVal: xdr.ScVal): number;
//# sourceMappingURL=contract.d.ts.map