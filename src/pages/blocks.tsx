import * as React from 'react';
import { Box } from '@stacks/ui';
import { Title } from '@components/typography';
import { Meta } from '@components/meta-head';
import { NextPage, NextPageContext } from 'next';
import { getApiClients } from '@common/api/client';
import { BlocksListResponse, BlocksQueryKeys } from '@store/blocks';
import { Provider } from 'jotai';
import { BlocksList } from '../features/blocks-list';
import { getOrFetchInitialQueries, usePageQueryInitialValues } from '@common/query';

const BlocksPage: NextPage<Record<string, BlocksListResponse>> = props => {
  const initialValues = usePageQueryInitialValues([BlocksQueryKeys.CONFIRMED], props);
  return (
    <Provider initialValues={initialValues}>
      <Meta title="Recent Blocks" />
      <Box mb="base-loose">
        <Title mt="72px" color="white" as="h1" fontSize="36px">
          Blocks
        </Title>
        <BlocksList />
      </Box>
    </Provider>
  );
};

BlocksPage.getInitialProps = async (
  context: NextPageContext
): Promise<Record<string, BlocksListResponse>> => {
  const { blocksApi } = await getApiClients(context);
  return getOrFetchInitialQueries<BlocksListResponse>([
    [BlocksQueryKeys.CONFIRMED, () => blocksApi.getBlockList({ limit: 10, offset: 0 })],
  ]);
};

export default BlocksPage;
