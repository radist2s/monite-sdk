import { useState } from 'react';

import { ApprovalPoliciesTable } from '@/components/approvalPolicies/ApprovalPoliciesTable';
import { Dialog } from '@/components/Dialog';
import { PageHeader } from '@/components/PageHeader';
import { MoniteStyleProvider } from '@/core/context/MoniteProvider';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import { Box, Button } from '@mui/material';

import { ApprovalPolicyDetails } from './ApprovalPolicyDetails';

/**
 * ApprovalPolicies component
 *
 * This component renders the approval policies page. It includes a table of approval policies, a dialog for creating new approval policies,
 * and a header with a button for opening the create dialog.
 */
export const ApprovalPolicies = () => {
  const { i18n } = useLingui();
  const [isCreateDialogOpened, setIsCreateDialogOpened] =
    useState<boolean>(false);

  return (
    <MoniteStyleProvider>
      <PageHeader
        title={t(i18n)`Approval Policies`}
        extra={
          <Box>
            <Button
              id="create"
              variant="contained"
              onClick={() => setIsCreateDialogOpened(true)}
            >{t(i18n)`Create`}</Button>
          </Box>
        }
      />
      <ApprovalPoliciesTable />
      <Dialog
        open={isCreateDialogOpened}
        alignDialog="right"
        onClose={() => setIsCreateDialogOpened(false)}
      >
        <ApprovalPolicyDetails
          onCreated={() => setIsCreateDialogOpened(false)}
        />
      </Dialog>
    </MoniteStyleProvider>
  );
};
