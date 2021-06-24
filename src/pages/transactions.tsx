import React from 'react';
import { Box } from '@stacks/ui';
import { Title } from '@components/typography';
import { Meta } from '@components/meta-head';
import { NextPage, NextPageContext } from 'next';
import { TabbedTransactionList } from '@components/tabbed-transaction-list';
import { getApiClients } from '@common/api/client';
import { TransactionQueryKeys } from '@store/transactions';
import { Provider } from 'jotai';
import { getOrFetchInitialQueries, usePageQueryInitialValues } from '@common/query';

const TransactionsPage: NextPage<any> = props => {
  const initialValues = usePageQueryInitialValues(
    [TransactionQueryKeys.CONFIRMED, TransactionQueryKeys.MEMPOOL],
    props
  );
  return (
    <Provider initialValues={initialValues}>
      <Meta title="Recent transactions" />
      <Box mb="base-loose">
        <Title mt="72px" color="white" as="h1" fontSize="36px">
          Transactions
        </Title>
        <TabbedTransactionList infinite />
      </Box>
    </Provider>
  );
};

TransactionsPage.getInitialProps = async (context: NextPageContext) => {
  const { transactionsApi } = await getApiClients(context);
  return getOrFetchInitialQueries([
    [
      TransactionQueryKeys.CONFIRMED,
      () => transactionsApi.getTransactionList({ limit: 10, offset: 0 }),
    ],
    [
      TransactionQueryKeys.MEMPOOL,
      () => transactionsApi.getMempoolTransactionList({ limit: 10, offset: 0 }),
    ],
  ]);
};

export default TransactionsPage;
