import * as React from 'react';
import { Provider } from 'jotai';
import { TransactionMeta } from '@components/meta/transactions';
import { TransactionPageComponent } from '@components/transaction-page-component';

import { isPendingTx, queryWith0x } from '@common/utils';
import { getApiClients } from '@common/api/client';

import { makeTransactionSingleKey } from '@store/transactions';
import { makeBlocksSingleKey } from '@store/blocks';
import {
  makeContractsInfoQueryKey,
  makeContractsInterfaceQueryKey,
  makeContractsSourceQueryKey,
} from '@store/contracts';

import {
  getOrFetchInitialQueries,
  getDataFromQueryArray,
  useSetCurrentlyInViewInitialData,
  usePageQueryInitialValues,
} from '@common/query';

import type { QueryKey } from 'react-query';
import type { NextPage, NextPageContext } from 'next';
import type { MempoolTransaction, Transaction } from '@stacks/stacks-blockchain-api-types';

interface TransactionPageData {
  txId: string;
  blockHash?: string;
  contractId?: string;
}

const TransactionPage: NextPage<TransactionPageData> = props => {
  const { txId, blockHash, contractId } = props;

  // construct all our keys
  const keys = [
    makeTransactionSingleKey(txId),
    blockHash && makeBlocksSingleKey(blockHash),
    contractId && makeContractsInterfaceQueryKey(contractId),
    contractId && makeContractsSourceQueryKey(contractId),
    contractId && makeContractsInfoQueryKey(contractId),
  ].filter(item => item) as QueryKey[];

  // construct our initialValues for data
  const initialValues = usePageQueryInitialValues(keys, props);
  const currentlyInView = useSetCurrentlyInViewInitialData('tx', txId);

  return (
    <Provider initialValues={[currentlyInView, ...initialValues]}>
      <TransactionMeta />
      <TransactionPageComponent />
    </Provider>
  );
};

// this is our main method for fetching data on the server for any transaction page
// on initial load, the data will be fetched on the server
// for subsequent navigations (on the client) the fetching will be done
// only if there is no data currently in the react-query cache for the given set of query keys
TransactionPage.getInitialProps = async (
  context: NextPageContext
): Promise<TransactionPageData> => {
  // get our txid
  // TODO: validate txid here
  const txId = context?.query?.txid ? queryWith0x(context.query?.txid.toString()) : '';
  if (txId === '') throw Error('No txid');

  // get our network aware api clients
  const { transactionsApi, blocksApi, smartContractsApi } = await getApiClients(context);

  // make our first query key
  const txQueryKey = makeTransactionSingleKey(txId);

  // fetch or get cached query data for transaction
  const txQueryData = await getOrFetchInitialQueries([
    [txQueryKey, () => transactionsApi.getTransactionById({ txId })],
  ]);

  // get the data of the transaction
  const transaction = getDataFromQueryArray<MempoolTransaction | Transaction>(
    txQueryKey,
    txQueryData
  );

  // this is where we'll store any other queries that we'll have to fetch
  const initialQueries: [queryKey: QueryKey, fetcher: any][] = [];

  let blockHash: string | undefined;
  // if it's not pending, we will fetch the anchor block for this transaction
  if (!isPendingTx(transaction)) {
    blockHash = (transaction as Transaction).block_hash;
    // we'll push this query to the array
    initialQueries.push([
      makeBlocksSingleKey(blockHash),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      () => blocksApi.getBlockByHash({ hash: blockHash! }),
    ]);
    // the nice thing about this is if the user has navigated to a transaction in this block before
    // or the block itself, we'll have a cached version ready for them
  }

  // let's check if it has a contract associated with it
  let contractId: string | undefined = undefined;
  if (transaction.tx_type === 'contract_call') contractId = transaction.contract_call.contract_id;
  if (transaction.tx_type === 'smart_contract') contractId = transaction.smart_contract.contract_id;

  // we'll need to fetch data for contract
  if (contractId) {
    const [contractAddress, contractName] = contractId.split('.');
    // add the contract-interface query
    initialQueries.push([
      makeContractsInterfaceQueryKey(contractId),
      () =>
        smartContractsApi.getContractInterface({
          contractAddress,
          contractName,
        }),
    ]);
    // add the contract source query
    initialQueries.push([
      makeContractsSourceQueryKey(contractId),
      () =>
        smartContractsApi.getContractSource({
          contractAddress,
          contractName,
        }),
    ]);
    // add the contract "info" query (includes extra details about the tx)
    initialQueries.push([
      makeContractsInfoQueryKey(contractId),
      () => smartContractsApi.getContractById({ contractId: contractId as string }),
    ]);
  }

  // we're going to fetch or return cached values for these queries
  const data = await getOrFetchInitialQueries(initialQueries);

  return {
    txId,
    contractId,
    blockHash,
    ...txQueryData,
    ...data,
  } as any;
};

export default TransactionPage;
