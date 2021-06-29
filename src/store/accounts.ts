import { apiClientsState } from '@store/api-clients';
import { atomFamilyWithQuery } from '@store/query';

import type { AccountDataResponse } from '@stacks/stacks-blockchain-api-types';
import type { Getter } from 'jotai';
import type { TransactionsListResponse } from '@store/transactions';
import { atomFamilyWithInfiniteQuery, makeQueryKey } from 'jotai-query-toolkit';
import { QueryFunctionContext, QueryKey } from 'react-query';
import { TransactionQueryKeys } from '@store/transactions';

// ----------------
// keys
// ----------------
export enum AccountsQueryKeys {
  ACCOUNT_INFO = 'accounts/ACCOUNT_INFO',
  ACCOUNT_TRANSACTIONS = 'accounts/ACCOUNT_TRANSACTIONS',
}

export function makeAccountInfoKey(txId: string) {
  return [AccountsQueryKeys.ACCOUNT_INFO, txId];
}

export const getAccountQueryKey = {
  info: (principal: string): QueryKey => makeQueryKey(AccountsQueryKeys.ACCOUNT_INFO, principal),
  transactions: (param: [string, number]): QueryKey =>
    makeQueryKey(AccountsQueryKeys.ACCOUNT_TRANSACTIONS, param),
};

// ----------------
// types
// ----------------

// ----------------
// queryFn's
// ----------------
const accountInfoQueryFn = async (get: Getter, principal: string) => {
  const { accountsApi } = get(apiClientsState);
  return accountsApi.getAccountInfo({
    principal,
    proof: 0,
  });
};
const accountTransactionsQueryFn = async (
  get: Getter,
  [principal, limit]: [string, number],
  context: QueryFunctionContext
) => {
  const { accountsApi } = get(apiClientsState);
  const { pageParam } = context;
  return (await accountsApi.getAccountTransactions({
    principal,
    offset: pageParam,
    limit,
  })) as TransactionsListResponse;
};

// ----------------
// atoms
// ----------------
export const accountInfoState = atomFamilyWithQuery<string, AccountDataResponse>(
  AccountsQueryKeys.ACCOUNT_INFO,
  accountInfoQueryFn
);

export const accountTransactionsState = atomFamilyWithInfiniteQuery<
  [string, number],
  TransactionsListResponse
>(AccountsQueryKeys.ACCOUNT_TRANSACTIONS, accountTransactionsQueryFn);
