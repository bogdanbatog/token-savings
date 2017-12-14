Token Savings Simulation and Smart Contract
===========================================

A simple deposit instrument for cryptocurrency tokens.

Deposit and withdraw into a common pool, managed by a smart contract.
Withdrawals are subject to a constant percentage fee, no matter the
duration of deposit. Fees are redistributed proportionally to active
deposits.

The Python simulation implements O(1) updates per deposit/withdrawal
operations, as required by a smart contract environment, where an iteration
over all deposits would be prohibitively expensive.

Implemented for Ethereum, in Solidity. Uses `truffle` framework for testing.
