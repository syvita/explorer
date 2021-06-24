import { hashQueryKey, QueryClient, QueryKey } from 'react-query';
import { useMemo } from 'react';
import { initialDataAtom } from '@store/query';
import { queryClientAtom } from 'jotai/query';
import { currentlyInViewState, InView } from '@store/app';
import { Atom } from 'jotai/core/atom';

export const queryClient = new QueryClient({
  defaultOptions: {
    // @see https://github.com/tannerlinsley/react-query/discussions/1601
    // @see https://react-query.tanstack.com/guides/migrating-to-react-query-3#the-queryoptionsnotifyonstatuschange-option-has-been-superceded-by-the-new-notifyonchangeprops-and-notifyonchangepropsexclusions-options
    queries: { notifyOnChangeProps: ['data', 'error'] },
  },
});

type Queries<Data> = [queryKey: QueryKey, fetcher: () => Promise<Data>];
// this is the big thing for how most of our data/state can be created on the server and shared to the client
// this method will either find an existing bit of data/state that is cached via react-query
// or it will fetch the data via the async fetcher provided to it
export async function getOrFetchInitialQueries<Data>(
  queries: Queries<Data>[]
): Promise<Record<string, Data>> {
  // let's extract only the query keys
  const queryKeys = queries.map(([queryKey]) => queryKey);
  // see if we have any cached in the query client
  const data: Record<string, unknown> = getCachedQueryData(queryKeys) || {};
  const dataKeys = Object.keys(data);
  const hasCachedData = dataKeys.length > 0;
  const allArgsAreCached = dataKeys.length === queries.length;
  // everything is cached, let's return it now
  if (allArgsAreCached) return data as Record<string, Data>;

  // some or none of the args weren't available, as such we need to fetch them
  const results = await Promise.all(
    queries
      // filter the items away that are already cached
      .filter(([queryKey]) => (hasCachedData ? !!data[hashQueryKey(queryKey)] : true))
      // map through and fetch the data for each
      .map(async ([queryKey, fetcher]) => {
        return [queryKey, await fetcher()] as [QueryKey, Data];
      })
  );

  results.forEach(([queryKey, result]) => {
    // add them to the data object
    data[hashQueryKey(queryKey)] = result;
  });
  // and return them!
  return data as Record<string, Data>;
}

// this function gets the cache from our react-query queryClient
// and looks for any queries that might already be cached and returns them
export function getCachedQueryData(queryKeys: QueryKey[]) {
  const found: Record<string, any> = {};
  const cache = queryClient.getQueryCache();
  const queries = cache.getAll();

  queryKeys.forEach(queryKey => {
    const match = queries.find(query => query.queryHash === hashQueryKey(queryKey));
    if (match) found[hashQueryKey(queryKey)] = match.state.data;
  });
  if (Object.keys(found).length) return found;
}

// a hook that is used on ONLY pages to provide the initial values to our query atoms
export function usePageQueryInitialValues(queryKeys: QueryKey[], props: Record<string, any>) {
  return useMemo(
    () =>
      [
        ...queryKeys.map(
          queryKey => [initialDataAtom(queryKey), props[hashQueryKey(queryKey)]] as const
        ),
        [queryClientAtom, queryClient] as const,
      ] as Iterable<readonly [Atom<unknown>, unknown]>,
    [queryKeys, props]
  );
}

// helper method to extract data from the fetchInitialQueries method
export function getDataFromQueryArray<Data>(
  queryKey: QueryKey,
  queryArray: Record<string, unknown>
) {
  return queryArray[hashQueryKey(queryKey)] as Data;
}

// this is a hook to set our "currently in view" action type
// for any given page, we want to set what kind of content we're viewing
export function useSetCurrentlyInViewInitialData(type: InView['type'], payload: InView['payload']) {
  return [currentlyInViewState, { type, payload }] as const;
}
