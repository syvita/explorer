import * as React from 'react';
import { TransactionMeta } from '@components/meta/transactions';
import { TransactionPageComponent } from '@components/transaction-page-component';

import { assertConfirmedTransaction, getContractIdFromTx, getTxIdFromCtx } from '@common/utils';
import { getApiClients } from '@common/api/client';
import { withInitialQueries } from '@common/with-initial-queries';

import { getContractQueryKeys } from '@store/contracts';
import { getTxQueryKey } from '@store/transactions';
import { getBlocksQueryKey } from '@store/blocks';

import type { NextPage, NextPageContext } from 'next';
import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';
import type { GetQueries, Queries } from 'jotai-query-toolkit/nextjs';
import { currentlyInViewState } from '@store/app';

interface TransactionPageData {
  txId: string;
  initialValues: any;
}

const TransactionPage: NextPage<TransactionPageData> = () => {
  return (
    <>
      <TransactionMeta />
      <TransactionPageComponent />
    </>
  );
};

TransactionPage.getInitialProps = (ctx: NextPageContext) => {
  const txId = getTxIdFromCtx(ctx);
  const type = txId.includes('.') ? 'contract_id' : 'tx';
  return {
    initialValues: [[currentlyInViewState, { type, payload: txId }]],
    txId,
  };
};

// this is our function for fetching the transaction being requested
// the transaction (if found) will be fed as context/props to the getQuerys function
// so our other queries can depend on it
const getQueryProps = async (ctx: NextPageContext): Promise<QueryProps> => {
  const txQuery = getTxIdFromCtx(ctx);
  const { transactionsApi, smartContractsApi } = await getApiClients(ctx);
  const isContractId = txQuery.includes('.');
  if (isContractId) {
    const contractInfo: // TODO: better type for this response
    any = await smartContractsApi.getContractById({ contractId: txQuery });
    const txId = contractInfo.tx_id;
    const transaction = (await transactionsApi.getTransactionById({ txId })) as
      | Transaction
      | MempoolTransaction;
    return {
      transaction,
      contractInfo,
    };
  }
  const transaction = (await transactionsApi.getTransactionById({ txId: txQuery })) as
    | Transaction
    | MempoolTransaction;
  return { transaction };
};

interface QueryProps {
  transaction: Transaction | MempoolTransaction;
  contractInfo?: any;
}

// this is our function for generating our query keys and fetchers for each key
const getQueries: GetQueries<QueryProps> = async (
  // it takes NextPageContext as the first param
  ctx,
  // and `queryProps` as the second (comes from `getQueryProps`)
  queryProps
): Promise<Queries<QueryProps>> => {
  if (!queryProps) throw Error('No Query props');
  const { transaction, contractInfo } = queryProps;
  // we'll extract our txid from the server context (query param)
  const txId = transaction.tx_id;
  // this is an assertion of a confirmed tx or undefined
  const confirmedTransaction = assertConfirmedTransaction(transaction);
  // if it's a tx that references a contract, this will be a principal
  const contractId = getContractIdFromTx(transaction);
  // we can get our api clients here
  const { smartContractsApi, blocksApi } = await getApiClients(ctx);

  // our query keys
  const txQueryKey = getTxQueryKey.single(txId);
  // if this is undefined, they query won't be fetched
  const blocksQueryKey =
    confirmedTransaction && getBlocksQueryKey.single(confirmedTransaction.block_hash);
  // if this is undefined, they query won't be fetched
  const contractInfoQueryKey = contractId && getContractQueryKeys.info(contractId);

  // and our final array of query keys and fetchers
  return [
    [txQueryKey, () => transaction],
    [
      blocksQueryKey,
      () =>
        confirmedTransaction && blocksApi.getBlockByHash({ hash: confirmedTransaction.block_hash }),
    ],
    [
      contractInfoQueryKey,
      () =>
        contractInfo ||
        (contractId &&
          smartContractsApi.getContractById({
            contractId,
          })),
    ],
  ];
};

export default withInitialQueries<QueryProps, TransactionPageData>(TransactionPage)(
  getQueries,
  getQueryProps
);
