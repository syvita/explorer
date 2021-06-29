import * as React from 'react';
import { Box } from '@stacks/ui';

import { Title } from '@components/typography';
import { Meta } from '@components/meta-head';
import { BlocksList } from '@features/blocks-list';

import { getApiClients } from '@common/api/client';
import { withInitialQueries } from '@common/with-initial-queries';

import { getBlocksQueryKey } from '@store/blocks';

import type { NextPage } from 'next';
import type { BlocksListResponse } from '@store/blocks';
import type { Queries } from 'jotai-query-toolkit/nextjs';

const BlocksPage: NextPage = () => {
  return (
    <>
      <Meta title="Recent Blocks" />
      <Box mb="base-loose">
        <Title mt="72px" color="white" as="h1" fontSize="36px">
          Blocks
        </Title>
        <BlocksList limit={30} />
      </Box>
    </>
  );
};

const queries: Queries = [
  [
    getBlocksQueryKey.confirmed(30),
    async context => {
      const { blocksApi } = await getApiClients(context);
      return (await blocksApi.getBlockList({
        limit: 30,
        offset: 0,
      })) as BlocksListResponse;
    },
  ],
];

export default withInitialQueries(BlocksPage)(queries);
