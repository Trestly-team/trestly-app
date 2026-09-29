/**
 * Trestly contract interface bindings
 * Matches the trestly-contract spec exactly
 */
import { Contract, rpc, TransactionBuilder, BASE_FEE, scValToNative, nativeToScVal, Address, } from "@stellar/stellar-sdk";
/**
 * Build a transaction for the Trestly contract
 */
export async function buildContractTransaction(config, sourceAccount, method, params) {
    const server = new rpc.Server(config.rpcUrl);
    const contract = new Contract(config.contractId);
    const sourceAccountObj = await server.getAccount(sourceAccount);
    const transaction = new TransactionBuilder(sourceAccountObj, {
        fee: BASE_FEE,
        networkPassphrase: config.networkPassphrase,
    })
        .addOperation(contract.call(method, ...params))
        .setTimeout(180);
    return { transaction, server };
}
/**
 * Simulate a transaction and return the prepared transaction
 */
export async function simulateTransaction(server, transaction) {
    const built = transaction.build();
    const simulated = await server.simulateTransaction(built);
    if (rpc.Api.isSimulationError(simulated)) {
        throw new Error(`Simulation failed: ${simulated.error}`);
    }
    if (!simulated.result) {
        throw new Error("Simulation returned no result");
    }
    const prepared = rpc.assembleTransaction(built, simulated).build();
    return prepared.toXDR();
}
/**
 * Submit a signed transaction and wait for confirmation
 */
export async function submitAndConfirm(server, signedXdr, networkPassphrase) {
    const signedTx = TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
    const result = await server.sendTransaction(signedTx);
    if (result.status === "ERROR") {
        throw new Error(`Transaction failed: ${result.errorResult?.toXDR("base64")}`);
    }
    const txHash = result.hash;
    // Poll for transaction status
    let status;
    let attempts = 0;
    const maxAttempts = 30;
    while (attempts < maxAttempts) {
        status = await server.getTransaction(txHash);
        if (status.status === "SUCCESS") {
            return txHash;
        }
        if (status.status === "FAILED") {
            throw new Error(`Transaction failed: ${JSON.stringify(status)}`);
        }
        // Wait 1 second before polling again
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
    }
    throw new Error("Transaction confirmation timeout");
}
/**
 * Parse EscrowedPayment from contract return value
 */
export function parseEscrowedPayment(scVal) {
    const native = scValToNative(scVal);
    if (!native || typeof native !== "object") {
        throw new Error("Invalid payment data returned from contract");
    }
    return {
        payer: native.payer,
        payee: native.payee,
        token: native.token,
        amount: BigInt(native.amount),
        disputeWindowEnd: BigInt(native.dispute_window_end),
        arbiter: native.arbiter,
        disputed: Boolean(native.disputed),
        resolved: Boolean(native.resolved),
    };
}
/**
 * Build parameters for create_payment contract method
 */
export function buildCreatePaymentParams(params) {
    return [
        new Address(params.payer).toScVal(),
        new Address(params.payee).toScVal(),
        new Address(params.token).toScVal(),
        nativeToScVal(params.amount, { type: "i128" }),
        nativeToScVal(params.disputeWindowSecs, { type: "u64" }),
        new Address(params.arbiter).toScVal(),
    ];
}
/**
 * Build parameters for raise_dispute contract method
 */
export function buildRaiseDisputeParams(params) {
    return [
        nativeToScVal(params.paymentId, { type: "u32" }),
    ];
}
/**
 * Build parameters for release contract method
 */
export function buildReleaseParams(paymentId) {
    return [nativeToScVal(paymentId, { type: "u32" })];
}
/**
 * Build parameters for resolve_dispute contract method
 */
export function buildResolveDisputeParams(params) {
    return [
        nativeToScVal(params.paymentId, { type: "u32" }),
        nativeToScVal(params.refundToPayer, { type: "bool" }),
    ];
}
/**
 * Build parameters for get_payment contract method
 */
export function buildGetPaymentParams(paymentId) {
    return [nativeToScVal(paymentId, { type: "u32" })];
}
/**
 * Extract payment ID from create_payment return value
 */
export function parsePaymentId(scVal) {
    const native = scValToNative(scVal);
    return Number(native);
}
//# sourceMappingURL=contract.js.map