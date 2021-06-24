import { atom, Getter } from 'jotai';
import { atomWithQuery as _atomWithQuery, queryClientAtom } from 'jotai/query';
import { atomFamily } from 'jotai/utils';
import { hashQueryKey, QueryKey, QueryObserverOptions } from 'react-query';
import deepEqual from 'fast-deep-equal';
import memoize from 'micro-memoize';
import { QueryRefreshRates } from '@common/constants';

const IS_SSR = typeof document === 'undefined';

export const initialDataAtom = atomFamily(queryKey => {
  const anAtom = atom(undefined);
  anAtom.debugLabel = `initialDataAtom/${hashQueryKey(queryKey as QueryKey)}`;
  return anAtom;
}, deepEqual);
const makeQueryKey = memoize((key: string, param?: unknown): [string, unknown] | string =>
  param ? [key, param] : key
);

export const atomFamilyWithQuery = <Param, Data>(
  key: string,
  queryFn: (get: Getter, param: Param) => Data | Promise<Data>,
  options: {
    equalityFn?: (a: Data, b: Data) => boolean;
    getShouldRefetch?: (initialData: Data) => boolean;
  } & QueryObserverOptions = {}
) => {
  const { equalityFn = deepEqual, getShouldRefetch, ...rest } = options;
  let shouldRefresh = true;
  return atomFamily<Param, Data>(param => {
    const queryKey = makeQueryKey(key, param);
    const queryAtom = _atomWithQuery(get => {
      const initialData = get(initialDataAtom(queryKey)) as unknown as Data;
      if (getShouldRefetch) {
        shouldRefresh = getShouldRefetch(initialData);
      }
      return {
        queryKey,
        queryFn: () => queryFn(get, param),
        initialData,
        keepPreviousData: true,
        refetchInterval: shouldRefresh ? QueryRefreshRates.Default : false,
        ...rest,
      } as any;
    }, equalityFn);
    queryAtom.debugLabel = `atomFamilyWithQuery/queryAtom/${hashQueryKey(queryKey as QueryKey)}`;

    const anAtom = atom(
      get => {
        const initialData = get(initialDataAtom(queryKey));
        if (IS_SSR) {
          return initialData as unknown as Data;
        } else {
          const queryData = get(queryAtom);
          return (queryData || initialData) as Data;
        }
      },
      async get => {
        const queryClient = get(queryClientAtom);
        await queryClient?.refetchQueries({
          queryKey,
        });
      }
    );
    anAtom.debugLabel = `atomFamilyWithQuery/${hashQueryKey(queryKey as QueryKey)}`;
    return anAtom;
  }, deepEqual);
};

export const atomWithQuery = <Data>(
  key: string,
  queryFn: (get: Getter) => Data | Promise<Data>,
  options: {
    equalityFn?: (a: Data, b: Data) => boolean;
    getShouldRefetch?: (initialData: Data) => boolean;
  } & QueryObserverOptions = {}
) => {
  const { equalityFn = deepEqual, getShouldRefetch, ...rest } = options;
  let shouldRefresh = true;

  const queryKey = makeQueryKey(key);
  const queryAtom = _atomWithQuery(get => {
    const initialData = get(initialDataAtom(queryKey)) as unknown as Data;
    if (getShouldRefetch) shouldRefresh = getShouldRefetch(initialData);
    return {
      queryKey,
      queryFn: () => queryFn(get),
      initialData,
      keepPreviousData: true,
      refetchInterval: shouldRefresh ? QueryRefreshRates.Default : false,
      ...rest,
    };
  });
  queryAtom.debugLabel = `atomWithQuery/queryAtom/${hashQueryKey(queryKey as QueryKey)}`;
  const anAtom = atom<Data, void>(
    get => {
      const initialData = get(initialDataAtom(queryKey)) as unknown as Data;
      if (IS_SSR) {
        return initialData;
      } else {
        const queryData = get(queryAtom);
        return (queryData || initialData) as Data;
      }
    },
    async get => {
      const queryClient = get(queryClientAtom);
      await queryClient?.refetchQueries({
        queryKey,
      });
    }
  );
  anAtom.debugLabel = `atomWithQuery/${hashQueryKey(queryKey as QueryKey)}`;
  return anAtom;
};
