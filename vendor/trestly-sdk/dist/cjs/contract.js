"use strict";
/**
 * Trestly contract interface bindings
 * Matches the trestly-contract spec exactly
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildContractTransaction = buildContractTransaction;
exports.simulateTransaction = simulateTransaction;
exports.submitAndConfirm = submitAndConfirm;
exports.parseEscrowedPayment = parseEscrowedPayment;
exports.buildCreatePaymentParams = buildCreatePaymentParams;
exports.buildRaiseDisputeParams = buildRaiseDisputeParams;
exports.buildReleaseParams = buildReleaseParams;
exports.buildResolveDisputeParams = buildResolveDisputeParams;
exports.buildGetPaymentParams = buildGetPaymentParams;
exports.parsePaymentId = parsePaymentId;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
/**
 * Build a transaction for the Trestly contract
 */
async function buildContractTransaction(config, sourceAccount, method, params) {
    const server = new stellar_sdk_1.rpc.Server(config.rpcUrl);
    const contract = new stellar_sdk_1.Contract(config.contractId);
    const sourceAccountObj = await server.getAccount(sourceAccount);
    const transaction = new stellar_sdk_1.TransactionBuilder(sourceAccountObj, {
        fee: stellar_sdk_1.BASE_FEE,
        networkPassphrase: config.networkPassphrase,
    })
        .addOperation(contract.call(method, ...params))
        .setTimeout(180);
    return { transaction, server };
}
/**
 * Simulate a transaction and return the prepared transaction
 */
async function simulateTransaction(server, transaction) {
    const built = transaction.build();
    const simulated = await server.simulateTransaction(built);
    if (stellar_sdk_1.rpc.Api.isSimulationError(simulated)) {
        throw new Error(`Simulation failed: ${simulated.error}`);
    }
    if (!simulated.result) {
        throw new Error("Simulation returned no result");
    }
    const prepared = stellar_sdk_1.rpc.assembleTransaction(built, simulated).build();
    return prepared.toXDR();
}
/**
 * Submit a signed transaction and wait for confirmation
 */
async function submitAndConfirm(server, signedXdr, networkPassphrase) {
    const signedTx = stellar_sdk_1.TransactionBuilder.fromXDR(signedXdr, networkPassphrase);
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
function parseEscrowedPayment(scVal) {
    const native = (0, stellar_sdk_1.scValToNative)(scVal);
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
function buildCreatePaymentParams(params) {
    return [
        new stellar_sdk_1.Address(params.payer).toScVal(),
        new stellar_sdk_1.Address(params.payee).toScVal(),
        new stellar_sdk_1.Address(params.token).toScVal(),
        (0, stellar_sdk_1.nativeToScVal)(params.amount, { type: "i128" }),
        (0, stellar_sdk_1.nativeToScVal)(params.disputeWindowSecs, { type: "u64" }),
        new stellar_sdk_1.Address(params.arbiter).toScVal(),
    ];
}
/**
 * Build parameters for raise_dispute contract method
 */
function buildRaiseDisputeParams(params) {
    return [
        (0, stellar_sdk_1.nativeToScVal)(params.paymentId, { type: "u32" }),
    ];
}
/**
 * Build parameters for release contract method
 */
function buildReleaseParams(paymentId) {
    return [(0, stellar_sdk_1.nativeToScVal)(paymentId, { type: "u32" })];
}
/**
 * Build parameters for resolve_dispute contract method
 */
function buildResolveDisputeParams(params) {
    return [
        (0, stellar_sdk_1.nativeToScVal)(params.paymentId, { type: "u32" }),
        (0, stellar_sdk_1.nativeToScVal)(params.refundToPayer, { type: "bool" }),
    ];
}
/**
 * Build parameters for get_payment contract method
 */
function buildGetPaymentParams(paymentId) {
    return [(0, stellar_sdk_1.nativeToScVal)(paymentId, { type: "u32" })];
}
/**
 * Extract payment ID from create_payment return value
 */
function parsePaymentId(scVal) {
    const native = (0, stellar_sdk_1.scValToNative)(scVal);
    return Number(native);
}
//# sourceMappingURL=contract.js.map