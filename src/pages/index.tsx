import React from 'react';
import { Grid } from '@stacks/ui';

import { Meta } from '@components/meta-head';
import { HomePageTop } from '@components/home-page-top';
import { TabbedTransactionList } from '@components/tabbed-transaction-list';
import { BlocksList } from '../features/blocks-list';

import { DEFAULT_LIST_LIMIT } from '@common/constants';
import { withInitialQueries } from '@common/with-initial-queries';
import { getApiClients } from '@common/api/client';

import { getTxQueryKey } from '@store/transactions';
import { getBlocksQueryKey } from '@store/blocks';

import type { GetQueries } from 'jotai-query-toolkit/nextjs';
import type { NextPage } from 'next';
import type { TransactionsListResponse } from '@store/transactions';
import type { BlocksListResponse } from '@store/blocks';

const Home: NextPage = () => {
  return (
    <>
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
    </>
  );
};

const getQueries: GetQueries = async ctx => {
  const { transactionsApi, blocksApi } = await getApiClients(ctx);
  return [
    [
      getTxQueryKey.confirmed(DEFAULT_LIST_LIMIT),
      async () => {
        return (await transactionsApi.getTransactionList({
          limit: DEFAULT_LIST_LIMIT,
          offset: 0,
        })) as TransactionsListResponse;
      },
    ],
    [
      getTxQueryKey.mempool(DEFAULT_LIST_LIMIT),
      async () => {
        return (await transactionsApi.getMempoolTransactionList({
          limit: DEFAULT_LIST_LIMIT,
          offset: 0,
        })) as TransactionsListResponse;
      },
    ],
    [
      getBlocksQueryKey.confirmed(DEFAULT_LIST_LIMIT),
      async () => {
        return (await blocksApi.getBlockList({
          limit: DEFAULT_LIST_LIMIT,
          offset: 0,
        })) as BlocksListResponse;
      },
    ],
  ];
};

export default withInitialQueries(Home)(getQueries);
