import React, { ReactNode, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import {
  I18nLocaleProvider,
  MoniteLocale,
} from '@/core/context/I18nLocaleProvider';
import {
  defaultMoniteLightThemeOptions,
  MoniteThemeContext,
  useMoniteThemeContext,
} from '@/core/context/MoniteThemeProvider';
import { useRootElements } from '@/core/context/RootElementsProvider';
import { getMessageInError } from '@/core/utils/getMessageInError';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { I18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { MoniteSDK } from '@monite/sdk-api';
import type { Theme, ThemeOptions } from '@mui/material';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { GlobalToast } from '../GlobalToast';
import { MoniteContext } from './MoniteContext';

export interface MoniteProviderProps {
  children?: ReactNode;

  /**
   * `theme` responsible for global styling of all Widgets provided.
   * If `theme` is not provided, `Monite` uses default theme.
   *
   * `Monite` uses `Material UI` for styling. If you want to know
   *  more how to customize theme, please visit:
   * @see {@link https://mui.com/customization/default-theme/ Default theme}
   */
  theme?: ThemeOptions | Theme;

  /** An instance of `MoniteSDK` */
  monite: MoniteSDK;

  /**
   * `locale` responsible for internationalisation
   *  of all Widgets provided.
   *
   * `locale.code` is used for global Widgets translation. (e.g. `en`)
   * `locale.messages` is used for translation for some of the Widgets.
   */
  locale?: Partial<MoniteLocale>;
}

const createQueryClient = (i18n: I18n) =>
  new QueryClient({
    mutationCache: new MutationCache({
      onError: (err, _variables, _context, mutation) => {
        /**
         * If this mutation has an `onError` callback defined
         *  skip global error handling.
         */
        if (mutation.options.onError) {
          return;
        }

        const message = getMessageInError(err);

        if (message) {
          toast.error(message, {
            id: message,
          });
        } else {
          toast.error(t(i18n)`Unrecognized error. Please contact support.`);
        }
      },
    }),

    /**
     * Default Options
     *
     * @see https://tanstack.com/query/v4/docs/react/reference/QueryClient
     */
    defaultOptions: {
      queries: {
        /**
         * We want to refetch on window focus only
         *  if the query is not in `error` state.
         * Otherwise, we will get an error over and over again
         *  if the query is in `error` state and user
         *  will try to focus on the window.
         */
        refetchOnWindowFocus: (query) => query.state.status !== 'error',
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchIntervalInBackground: false,
        retry: false,

        /** Make `staleTime` to 1 minute */
        staleTime: 1000 * 60 * 1,
      },
    },
    queryCache: new QueryCache({
      onError: (err: unknown) => {
        const message = getMessageInError(err);

        if (message) {
          if (message.includes('Object type at permissions not found')) {
            toast.error(
              t(i18n)`You do not have permission to access this resource.`,
              {
                id: 'permission-error',
              }
            );

            return;
          }
        } else {
          toast.error(t(i18n)`Unrecognized error. Please contact support.`);
        }
      },
    }),
  });

/**
 * Provides Monite theme and global styles
 * Fetches theme from global `MoniteProvider` and apply it to the Material `ThemeProvider`
 */
export const MoniteStyleProvider = ({
  children,
}: Pick<MoniteProviderProps, 'children'>) => {
  const theme = useMoniteThemeContext();

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export const MoniteProvider = ({
  monite,
  theme,
  children,
  locale,
}: MoniteProviderProps) => {
  const { styles: stylesRoot } = useRootElements();
  const [emotionCache] = useState(() =>
    createCache({
      key: 'css-monite',
      container: stylesRoot,
    })
  );

  const userLocale =
    locale?.code ??
    (typeof navigator === 'undefined' ? 'en' : navigator.language);

  const moniteInstanceKey = useInstanceKey(monite);

  return (
    <I18nLocaleProvider
      locale={{
        code: userLocale,
        messages: locale?.messages,
      }}
    >
      <MoniteQueryClientProvider
        /**
         * QueryClientProvider is not triggers re-rendering when `queryClient` is changed.
         * Therefore, we need to provide a unique key for each `MoniteSDK` instance
         * to trigger re-rendering of the `QueryClientProvider` with the new `QueryClient`.
         */
        key={moniteInstanceKey}
      >
        <MoniteThemeContext.Provider
          value={theme ?? defaultMoniteLightThemeOptions}
        >
          <MoniteContext.Provider
            value={{
              monite,
              code: userLocale,
            }}
          >
            <ReactQueryDevtools initialIsOpen={false} />
            <CacheProvider value={emotionCache}>
              <GlobalToast />
              {children}
            </CacheProvider>
          </MoniteContext.Provider>
        </MoniteThemeContext.Provider>
      </MoniteQueryClientProvider>
    </I18nLocaleProvider>
  );
};

/**
 * `MoniteQueryClientProvider` is a React component that provides a QueryClient instance to its children.
 * It uses the `useMemo` hook to create the QueryClient instance.
 * This component is used internally by the `MoniteProvider` component to invalidate the QueryClient instance
 * when the `MoniteSDK` instance changes.
 *
 * @param {object} props - The properties passed to the component.
 * @param {ReactNode} props.children - The child components to which the QueryClient instance should be provided.
 *
 * @returns {JSX.Element} A QueryClientProvider component with the QueryClient instance and the child components.
 */
const MoniteQueryClientProvider = ({ children }: { children: ReactNode }) => {
  const { i18n } = useLingui();
  const queryClient = useMemo(() => createQueryClient(i18n), [i18n]);
  const queryClientInstanceKey = useInstanceKey(queryClient);

  return (
    <QueryClientProvider
      /**
       * We need to provide a unique key for each `QueryClient` instance,
       * otherwise, `QueryClientProvider` will not trigger re-rendering
       * on `queryClient` change.
       */
      key={queryClientInstanceKey}
      client={queryClient}
    >
      {children}
    </QueryClientProvider>
  );
};

/**
 * A custom hook that generates a unique key for a given instance.
 * The key is based on the current timestamp when the instance is first passed to the hook.
 * If the instance is not in the map, it will be added with the current timestamp as its key.
 *
 * @param {object} instance - The instance for which to generate a unique key.
 * @returns {number} The unique key associated with the given instance.
 * @throws {Error} If the instance key is not defined.
 */
const useInstanceKey = (instance: object) => {
  const [instancesMap] = useState(() => new WeakMap([[instance, Date.now()]]));

  if (!instancesMap.has(instance)) instancesMap.set(instance, Date.now());

  const instanceKey = instancesMap.get(instance);
  if (!instanceKey) throw new Error('Instance key is not defined.');

  return instanceKey;
};
