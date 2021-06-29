import { useAtomValue } from 'jotai/utils';
import { mempoolTransactionsListState, transactionsListState } from '@store/transactions';

export function useTransactionsListState(limit = 10) {
  return useAtomValue(transactionsListState(limit));
}

export function useMempoolTransactionsListState(limit = 10) {
  return useAtomValue(mempoolTransactionsListState(limit));
}
