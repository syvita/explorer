import { NextPage, NextPageContext } from 'next';
import React from 'react';
import { getInitialPropsFromQueries, Queries } from 'jotai-query-toolkit/nextjs';

import { initialDataAtom, queryClient } from 'jotai-query-toolkit';
import { queryClientAtom } from 'jotai/query';
import { Atom } from 'jotai/core/atom';
import { Provider } from 'jotai';

export function useQueryInitialValues(props: Record<string, unknown>) {
  const queryKeys = Object.keys(props);
  const atoms = queryKeys.map(queryKey => {
    const value = props[queryKey];
    if (!value)
      throw Error('[Jotai Query Toolkit] no initial data found for ${hashQueryKey(queryKey)}');
    return [initialDataAtom(queryKey), value] as const;
  });
  return [[queryClientAtom, queryClient] as const, ...atoms] as Iterable<
    readonly [Atom<unknown>, unknown]
  >;
}

export function withInitialQueries<QueryProps = unknown, PageProps = Record<string, unknown>>(
  WrappedComponent: NextPage<PageProps>
) {
  return (
    getQueries:
      | Queries<QueryProps>
      | ((
          ctx: NextPageContext,
          queryProps?: QueryProps
        ) => Queries<QueryProps> | Promise<Queries<QueryProps>>),
    getQueryProps?: (context: NextPageContext) => QueryProps | Promise<QueryProps>
  ): NextPage<PageProps> => {
    if (!getQueries) throw Error('Need to pass queries');

    const Wrapper: NextPage<{
      initialQueryData: Record<string, unknown>;
      initialValues?: any;
    }> = ({ initialQueryData, initialValues, ...props }) => {
      const initialQueries = useQueryInitialValues(initialQueryData);
      return (
        <Provider initialValues={[...initialQueries].concat(initialValues ?? [])}>
          <WrappedComponent {...(props as PageProps)} />
        </Provider>
      );
    };

    Wrapper.getInitialProps = async (ctx: NextPageContext) => {
      const promises = [
        await getInitialPropsFromQueries<QueryProps>(getQueries, ctx, getQueryProps),
      ];
      if (WrappedComponent.getInitialProps) {
        const asyncGetInitialProps = async () =>
          (await WrappedComponent?.getInitialProps?.(ctx)) || {};
        promises.push(asyncGetInitialProps());
      }

      const [initialQueryData, componentProps] = await Promise.all(promises);

      return { initialQueryData, ...componentProps };
    };

    return Wrapper as unknown as NextPage<PageProps>;
  };
}
