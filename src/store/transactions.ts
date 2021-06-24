import { apiClientsState } from '@store/api-clients';
import { atomFamilyWithQuery, atomWithQuery } from '@store/query';

import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';
import type { Getter } from 'jotai';
import type { ApiResponseWithResultsOffset } from '@common/types/api';
import { atom } from 'jotai';
import { QueryKey } from 'react-query';
import { isPendingTx } from '@common/utils';

// ----------------
// keys
// ----------------
export enum TransactionQueryKeys {
  CONFIRMED = 'transactions/CONFIRMED',
  MEMPOOL = 'transactions/MEMPOOL',
  SINGLE = 'transactions/SINGLE',
}

export function makeTransactionSingleKey(txId: string): QueryKey {
  return [TransactionQueryKeys.SINGLE, txId];
}

// ----------------
// types
// ----------------
export type TransactionsListResponse = ApiResponseWithResultsOffset<Transaction>;
export type MempoolTransactionsListResponse = ApiResponseWithResultsOffset<MempoolTransaction>;

// ----------------
// queryFn's
// ----------------
const transactionsListQueryFn = async (get: Getter) => {
  const { transactionsApi } = get(apiClientsState);
  const { limit, offset } = get(transactionsParamsState);
  return (await transactionsApi.getTransactionList({
    offset,
    limit,
  })) as TransactionsListResponse; // cast due to limitation in api client
};
const mempoolTransactionsListQueryFn = async (get: Getter) => {
  const { transactionsApi } = get(apiClientsState);
  const { limit, offset } = get(transactionsParamsState);
  return (await transactionsApi.getMempoolTransactionList({
    offset,
    limit,
  })) as MempoolTransactionsListResponse; // cast due to limitation in api client
};
const transactionSingeQueryFn = async (get: Getter, txId: string) => {
  const { transactionsApi } = get(apiClientsState);
  return (await transactionsApi.getTransactionById({
    txId,
  })) as MempoolTransaction | Transaction;
};

// ----------------
// atoms
// ----------------
export const transactionsListState = atomWithQuery<TransactionsListResponse>(
  TransactionQueryKeys.CONFIRMED,
  transactionsListQueryFn,
  { equalityFn: (a, b) => a.results[0].tx_id === b.results[0].tx_id }
);

export const mempoolTransactionsListState = atomWithQuery<MempoolTransactionsListResponse>(
  TransactionQueryKeys.MEMPOOL,
  mempoolTransactionsListQueryFn,
  { equalityFn: (a, b) => a.results[0].tx_id === b.results[0].tx_id }
);

export const transactionSingleState = atomFamilyWithQuery<string, MempoolTransaction | Transaction>(
  TransactionQueryKeys.SINGLE,
  transactionSingeQueryFn,
  { getShouldRefetch: data => isPendingTx(data) }
);

export const transactionsLimitState = atom(10);
export const transactionsOffsetState = atom(0);

export const transactionsParamsState = atom(get => {
  const limit = get(transactionsLimitState);
  const offset = get(transactionsOffsetState);
  return { limit, offset };
});
