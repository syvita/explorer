import { apiClientsState } from '@store/api-clients';
import {
  atomFamilyWithInfiniteQuery,
  atomFamilyWithQuery,
  makeQueryKey,
} from 'jotai-query-toolkit';

import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';
import type { Getter } from 'jotai';
import type { ApiResponseWithResultsOffset } from '@common/types/api';
import { atom } from 'jotai';
import { QueryFunctionContext, QueryKey } from 'react-query';
import { getNextPageParam } from '@store/common';
import { DEFAULT_POLLING_INTERVAL } from '@common/constants';

// ----------------
// keys
// ----------------
export enum TransactionQueryKeys {
  CONFIRMED = 'transactions/CONFIRMED',
  MEMPOOL = 'transactions/MEMPOOL',
  SINGLE = 'transactions/SINGLE',
}

export const getTxQueryKey = {
  confirmed: (limit: number): QueryKey => makeQueryKey(TransactionQueryKeys.CONFIRMED, limit),
  mempool: (limit: number): QueryKey => makeQueryKey(TransactionQueryKeys.MEMPOOL, limit),
  single: (txId: string): QueryKey => makeQueryKey(TransactionQueryKeys.SINGLE, txId),
};

// ----------------
// types
// ----------------
export type TransactionsListResponse = ApiResponseWithResultsOffset<Transaction>;
export type MempoolTransactionsListResponse = ApiResponseWithResultsOffset<MempoolTransaction>;

// ----------------
// queryFn's
// ----------------
const transactionsListQueryFn = async (
  get: Getter,
  limit: number,
  context: QueryFunctionContext
) => {
  const { transactionsApi } = get(apiClientsState);
  const { pageParam } = context;
  return (await transactionsApi.getTransactionList({
    offset: pageParam,
    limit,
  })) as TransactionsListResponse; // cast due to limitation in api client
};
const mempoolTransactionsListQueryFn = async (
  get: Getter,
  limit: number,
  context: QueryFunctionContext
) => {
  const { transactionsApi } = get(apiClientsState);
  const { pageParam } = context;
  return (await transactionsApi.getMempoolTransactionList({
    offset: pageParam,
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

export const transactionsListState = atomFamilyWithInfiniteQuery<number, TransactionsListResponse>(
  TransactionQueryKeys.CONFIRMED,
  transactionsListQueryFn,
  {
    equalityFn: (a, b) => a.pages[0].results[0].tx_id === a.pages[0].results[0].tx_id,
    getNextPageParam,
    staleTime: DEFAULT_POLLING_INTERVAL * 0.75,
  }
);

export const mempoolTransactionsListState = atomFamilyWithInfiniteQuery<
  number,
  MempoolTransactionsListResponse
>(TransactionQueryKeys.MEMPOOL, mempoolTransactionsListQueryFn, {
  equalityFn: (a, b) => a.pages[0].results[0].tx_id === a.pages[0].results[0].tx_id,
  getNextPageParam,
  staleTime: DEFAULT_POLLING_INTERVAL * 0.75,
});

export const transactionSingleState = atomFamilyWithQuery<string, MempoolTransaction | Transaction>(
  TransactionQueryKeys.SINGLE,
  transactionSingeQueryFn,
  { staleTime: DEFAULT_POLLING_INTERVAL * 0.75 }
);

export const transactionsLimitState = atom(10);
export const transactionsOffsetState = atom(0);

export const transactionsParamsState = atom(get => {
  const limit = get(transactionsLimitState);
  const offset = get(transactionsOffsetState);
  return { limit, offset };
});
