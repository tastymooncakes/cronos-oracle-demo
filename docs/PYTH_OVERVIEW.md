# Pyth Network Integration on Cronos
This document explains how the [Pyth Network](https://pyth.network) integrates with Cronos Chain to provide accurate, efficient, and secure price feeds for decentralized applications (dApps).

## Why Choose Pyth on Cronos?

We chose Pyth Network as our oracle provider on Cronos Chain for four key reasons:

### 1. Full Support & Strong Documentation

Pyth is featured in [Cronos' official documentation](https://docs.cronos.org/), complete with detailed examples and guides. This helps reduce friction for developers and accelerates integration time.

### 2. Pull-Based Data Model

Unlike traditional oracles that push updates on-chain at intervals, Pyth uses a pull model, allowing dApps to fetch data only when needed. This leads to:

- Lower gas costs
- Better on-chain efficiency
- Flexible update timing

### 3. Low Latency & High Update Frequency

Pyth offers near real-time price data with low latency—essential for DeFi apps and anything where pricing precision matters.

### 4. Institutional-Grade Data Coverage

Pyth aggregates data from trusted institutional sources and supports a wide range of assets including:

- Cryptocurrencies
- Stocks
- Foreign exchange (FX)
- Commodities

## Pyth's Pull-Based Price Feed Model

Unlike oracles that continuously push data to smart contracts, Pyth's pull-based model keeps data off-chain until it's needed. Here's how it works:

### Off-Chain Data Aggregation

- Data Providers stream real-time price updates to Pyth.
- Pyth aggregates these and computes a price + confidence interval off-chain.

### Verifiable Attestations (VAAs)

- Pyth signs the aggregated price data into **Verifiable Attestations** (VAAs), cryptographic proofs of authenticity and timestamped origin.

### Fetching the VAA

- When your dApp needs a price, it uses its data disribution service, Hermes to request the latest VAA. In our project we are leveraging the `@pythnetwork/pyth-evm-js` SDK.
- This VAA is then submitted to your on-chain smart contract.

### On-Chain Verification

- The Pyth smart contract on Cronos verifies the signature and authenticity of the submitted VAA.
- If valid, it updates the stored price and metadata (timestamp, confidence interval, etc.).

### Reading Prices in Your Contracts

- Other smart contracts can now read verified prices directly using read-only functions.

For a visual summary, see Pyth architecture diagram [here](https://www.pyth.network/blog/pyth-a-new-model-to-the-price-oracle).

## Security is built into every layer of Pyth’s data flow
- Submitted VAAs include cryptographic signatures.
- On-chain Pyth contracts verify the origin and freshness of each update.
- Malicious or outdated data are automatically rejected.

This means:

> Your contracts are protected from fake data submissions or stale price exploits.

---

## Final Summary

> Pyth keeps data **off-chain** until your dApp **requests it**. When needed:
>
> 1. Fetch a signed price update (VAA) from Pyth data distribution service. We will be using `@pythnetwork/pyth-evm-js` SDK.
> 2. Submit it to your on-chain contract.
> 3. The contract verifies and stores it.
> 4. Other contracts can now read the price securely and efficiently.
