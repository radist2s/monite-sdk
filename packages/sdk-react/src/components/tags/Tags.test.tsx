import React from 'react';

import {
  ENTITY_ID_FOR_EMPTY_PERMISSIONS,
  ENTITY_ID_FOR_OWNER_PERMISSIONS,
} from '@/mocks';
import { checkPermissionQueriesLoaded, Provider } from '@/utils/test-utils';
import { t } from '@lingui/macro';
import { MoniteSDK } from '@monite/sdk-api';
import { QueryClient } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';

import { Tags } from './Tags';

describe('Tags', () => {
  describe('# Permissions', () => {
    test('support "read" and "create" permissions', async () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
        },
      });

      render(<Tags />, {
        wrapper: ({ children }) => (
          <Provider client={queryClient} children={children} />
        ),
      });

      await waitFor(() => checkPermissionQueriesLoaded(queryClient));
      await waitFor(() => checkTagQueriesLoaded(queryClient));

      const createTagButton = screen.findByRole('button', {
        name: t`Create new tag`,
      });

      await expect(createTagButton).resolves.toBeInTheDocument();
      await expect(createTagButton).resolves.not.toBeDisabled();

      const tableRowTag = screen.findByText('tag 1');
      await expect(tableRowTag).resolves.toBeInTheDocument();
    });

    test('support empty permissions', async () => {
      const monite = new MoniteSDK({
        entityId: ENTITY_ID_FOR_EMPTY_PERMISSIONS,
        fetchToken: () =>
          Promise.resolve({
            access_token: 'token',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
      });

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
        },
      });

      render(<Tags />, {
        wrapper: ({ children }) => (
          <Provider client={queryClient} sdk={monite} children={children} />
        ),
      });

      await waitFor(() => checkPermissionQueriesLoaded(queryClient));

      const createTagButton = screen.findByRole('button', {
        name: t`Create new tag`,
      });

      await expect(createTagButton).resolves.toBeInTheDocument();
      await expect(createTagButton).resolves.toBeDisabled();
      await expect(
        screen.findByText(/Access Restricted/i, { selector: 'h3' })
      ).resolves.toBeInTheDocument();
    });

    test('support "allowed_for_own" access for "read" and "create" permissions', async () => {
      const monite = new MoniteSDK({
        entityId: ENTITY_ID_FOR_OWNER_PERMISSIONS,
        fetchToken: () =>
          Promise.resolve({
            access_token: 'token',
            token_type: 'Bearer',
            expires_in: 3600,
          }),
      });

      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
        },
      });

      render(<Tags />, {
        wrapper: ({ children }) => (
          <Provider client={queryClient} sdk={monite} children={children} />
        ),
      });

      await waitFor(() => checkPermissionQueriesLoaded(queryClient));
      await waitFor(() => checkTagQueriesLoaded(queryClient));

      const createTagButton = screen.findByRole('button', {
        name: t`Create new tag`,
      });

      await expect(createTagButton).resolves.toBeInTheDocument();
      await expect(createTagButton).resolves.not.toBeDisabled();

      const tableRowTag = screen.findByText('tag 1');
      await expect(tableRowTag).resolves.toBeInTheDocument();
    });
  });
});

function checkTagQueriesLoaded(queryClient: QueryClient) {
  const data = queryClient.getQueriesData({
    exact: false,
    queryKey: ['tags'],
    predicate: (query) => query.state.status === 'success',
  });

  if (!data.length) throw new Error('Product query is not executed');
}
