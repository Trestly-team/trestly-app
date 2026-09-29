"use strict";
/**
 * Trestly SDK client functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = createPayment;
exports.raiseDispute = raiseDispute;
exports.release = release;
exports.resolveDispute = resolveDispute;
exports.getPayment = getPayment;
const stellar_sdk_1 = require("@stellar/stellar-sdk");
const contract_js_1 = require("./contract.js");
/**
 * Create a new escrowed payment
 *
 * Builds a Soroban transaction invoking create_payment on the Trestly contract.
 * Simulates the transaction, then calls the provided signTransaction callback
 * (this decouples the SDK from any specific wallet — the caller supplies their own signer,
 * whether that's Freighter in a browser or a server-side keypair).
 * Submits the signed transaction, polls for confirmation.
 *
 * @param config - Trestly contract configuration
 * @param params - Payment parameters including signer callback
 * @returns The new paymentId and transaction hash
 */
async function createPayment(config, params) {
    // Build transaction
    const contractParams = (0, contract_js_1.buildCreatePaymentParams)({
        payer: params.payer,
        payee: params.payee,
        token: params.token,
        amount: params.amount,
        disputeWindowSecs: params.disputeWindowSecs,
        arbiter: params.arbiter,
    });
    const { transaction, server } = await (0, contract_js_1.buildContractTransaction)(config, params.payer, "create_payment", contractParams);
    // Simulate
    const xdr = await (0, contract_js_1.simulateTransaction)(server, transaction);
    // Sign via callback
    const signedXdr = await params.signTransaction(xdr);
    // Submit and confirm
    const txHash = await (0, contract_js_1.submitAndConfirm)(server, signedXdr, config.networkPassphrase);
    // Parse payment ID from transaction result
    const txResult = await server.getTransaction(txHash);
    if (txResult.status !== "SUCCESS" || !txResult.returnValue) {
        throw new Error("Failed to get payment ID from transaction result");
    }
    const paymentId = (0, contract_js_1.parsePaymentId)(txResult.returnValue);
    return { paymentId, txHash };
}
/**
 * Raise a dispute for an escrowed payment
 *
 * Same build → simulate → sign → submit → confirm pattern, invoking raise_dispute.
 *
 * @param config - Trestly contract configuration
 * @param params - Dispute parameters including payment ID and signer
 * @returns Transaction hash
 */
async function raiseDispute(config, params) {
    const contractParams = (0, contract_js_1.buildRaiseDisputeParams)({
        paymentId: params.paymentId,
        payer: params.payer,
    });
    const { transaction, server } = await (0, contract_js_1.buildContractTransaction)(config, params.payer, "raise_dispute", contractParams);
    const xdr = await (0, contract_js_1.simulateTransaction)(server, transaction);
    const signedXdr = await params.signTransaction(xdr);
    const txHash = await (0, contract_js_1.submitAndConfirm)(server, signedXdr, config.networkPassphrase);
    return { txHash };
}
/**
 * Release an escrowed payment after the dispute window
 *
 * No signer required as a parameter beyond the submitting account — this is a public,
 * unauthenticated contract call. Still needs a fee-paying source account to submit the transaction.
 *
 * @param config - Trestly contract configuration
 * @param paymentId - The payment to release
 * @param submitterAccount - The account that will pay transaction fees (must have funds)
 * @param signTransaction - Callback to sign the transaction with the submitter's key
 * @returns Transaction hash
 */
async function release(config, paymentId, submitterAccount, signTransaction) {
    const contractParams = (0, contract_js_1.buildReleaseParams)(paymentId);
    const { transaction, server } = await (0, contract_js_1.buildContractTransaction)(config, submitterAccount, "release", contractParams);
    const xdr = await (0, contract_js_1.simulateTransaction)(server, transaction);
    const signedXdr = await signTransaction(xdr);
    const txHash = await (0, contract_js_1.submitAndConfirm)(server, signedXdr, config.networkPassphrase);
    return { txHash };
}
/**
 * Resolve a disputed payment (arbiter only)
 *
 * Invokes resolve_dispute. The arbiter decides whether to refund to payer or release to payee.
 *
 * @param config - Trestly contract configuration
 * @param params - Resolution parameters including arbiter and decision
 * @returns Transaction hash
 */
async function resolveDispute(config, params) {
    const contractParams = (0, contract_js_1.buildResolveDisputeParams)({
        paymentId: params.paymentId,
        arbiter: params.arbiter,
        refundToPayer: params.refundToPayer,
    });
    const { transaction, server } = await (0, contract_js_1.buildContractTransaction)(config, params.arbiter, "resolve_dispute", contractParams);
    const xdr = await (0, contract_js_1.simulateTransaction)(server, transaction);
    const signedXdr = await params.signTransaction(xdr);
    const txHash = await (0, contract_js_1.submitAndConfirm)(server, signedXdr, config.networkPassphrase);
    return { txHash };
}
/**
 * Get an escrowed payment by ID
 *
 * Read-only — simulate a transaction calling get_payment, parse and return the result.
 * No signing needed.
 *
 * @param config - Trestly contract configuration
 * @param paymentId - The payment ID to retrieve
 * @returns The escrowed payment data
 */
async function getPayment(config, paymentId) {
    const contractParams = (0, contract_js_1.buildGetPaymentParams)(paymentId);
    // Use a dummy account for simulation (read-only call)
    const dummyAccount = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
    const { transaction, server } = await (0, contract_js_1.buildContractTransaction)(config, dummyAccount, "get_payment", contractParams);
    const built = transaction.build();
    const simulated = await server.simulateTransaction(built);
    if (stellar_sdk_1.rpc.Api.isSimulationError(simulated)) {
        throw new Error(`Simulation failed: ${simulated.error}`);
    }
    if (!simulated.result || !simulated.result.retval) {
        throw new Error("No return value from get_payment");
    }
    return (0, contract_js_1.parseEscrowedPayment)(simulated.result.retval);
}
//# sourceMappingURL=client.js.map