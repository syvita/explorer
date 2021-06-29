import React from 'react';
import { Box } from '@stacks/ui';

import { Title } from '@components/typography';
import { Meta } from '@components/meta-head';
import { TabbedTransactionList } from '@components/tabbed-transaction-list';

import { withInitialQueries } from '@common/with-initial-queries';
import { getApiClients } from '@common/api/client';

import { getTxQueryKey } from '@store/transactions';

import type { NextPage } from 'next';
import type { TransactionsListResponse } from '@store/transactions';
import type { GetQueries } from 'jotai-query-toolkit/nextjs';

const LIMIT = 30;
const TransactionsPage: NextPage = () => {
  return (
    <>
      <Meta title="Recent transactions" />
      <Box mb="base-loose">
        <Title mt="72px" color="white" as="h1" fontSize="36px">
          Transactions
        </Title>
        <TabbedTransactionList limit={LIMIT} />
      </Box>
    </>
  );
};

const getQueries: GetQueries = async ctx => {
  const { transactionsApi } = await getApiClients(ctx);
  return [
    [
      getTxQueryKey.confirmed(LIMIT),
      async () => {
        return (await transactionsApi.getTransactionList({
          limit: LIMIT,
          offset: 0,
        })) as TransactionsListResponse;
      },
    ],
    [
      getTxQueryKey.mempool(LIMIT),
      async () => {
        return (await transactionsApi.getMempoolTransactionList({
          limit: LIMIT,
          offset: 0,
        })) as TransactionsListResponse;
      },
    ],
  ];
};
export default withInitialQueries(TransactionsPage)(getQueries);
