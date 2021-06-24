import React from 'react';
import { Grid } from '@stacks/ui';
import { NextPage, NextPageContext } from 'next';
import { Meta } from '@components/meta-head';
import { Provider } from 'jotai';
import {
  MempoolTransactionsListResponse,
  TransactionQueryKeys,
  TransactionsListResponse,
} from '@store/transactions';
import { getApiClients } from '@common/api/client';
import { BlocksListResponse, BlocksQueryKeys } from '@store/blocks';
import { BlocksList } from '../features/blocks-list';
import { TabbedTransactionList } from '@components/tabbed-transaction-list';
import { getOrFetchInitialQueries, usePageQueryInitialValues } from '@common/query';
import { HomePageTop } from '@components/home-page-top';

interface HomePageData {
  [key: string]:
    | TransactionsListResponse
    | MempoolTransactionsListResponse
    | BlocksListResponse
    | boolean
    | undefined;

  isHome?: boolean;
}

const DEFAULT_LIST_LIMIT = 10;
const Home: NextPage<HomePageData> = props => {
  const initialValues = usePageQueryInitialValues(
    [TransactionQueryKeys.CONFIRMED, TransactionQueryKeys.MEMPOOL, BlocksQueryKeys.CONFIRMED],
    props
  );
  return (
    <Provider initialValues={initialValues}>
      <Meta />
      <HomePageTop />
      <Grid
        mt="extra-loose"
        gap="extra-loose"
        gridTemplateColumns={['100%', '100%', 'calc(60% - 32px) 40%']}
        width="100%"
      >
        <TabbedTransactionList limit={DEFAULT_LIST_LIMIT} />
        <BlocksList limit={DEFAULT_LIST_LIMIT} />
      </Grid>
    </Provider>
  );
};

Home.getInitialProps = async (context: NextPageContext): Promise<HomePageData> => {
  // get our network aware api clients
  const { transactionsApi, blocksApi } = await getApiClients(context);
  // fetch our queries if on server,
  // else it will check the react-query client cache and if the keys are present
  // return them (the atoms will auto refresh on mount, so stale data will be updated on navigation
  const data = await getOrFetchInitialQueries<
    TransactionsListResponse | MempoolTransactionsListResponse | BlocksListResponse
  >([
    // the confirmed transactions
    [
      TransactionQueryKeys.CONFIRMED,
      async () =>
        (await transactionsApi.getTransactionList({
          limit: DEFAULT_LIST_LIMIT,
          offset: 0,
        })) as TransactionsListResponse,
    ],
    // mempool transactions
    [
      TransactionQueryKeys.MEMPOOL,
      async () =>
        (await transactionsApi.getMempoolTransactionList({
          limit: DEFAULT_LIST_LIMIT,
          offset: 0,
        })) as MempoolTransactionsListResponse,
    ],
    // our blocks list
    [
      BlocksQueryKeys.CONFIRMED,
      () => blocksApi.getBlockList({ limit: DEFAULT_LIST_LIMIT, offset: 0 }),
    ],
  ]);

  return {
    isHome: true,
    ...data,
  };
};

export default Home;
