import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { useDialog } from '@/components';
import { JSONFormatterInput } from '@/components/approvalPolicies/ApprovalPolicyDetails/JSONFormatterInput';
import { RHFTextField } from '@/components/RHF/RHFTextField';
import { MoniteStyleProvider } from '@/core/context/MoniteProvider';
import { yupResolver } from '@hookform/resolvers/yup';
import type { I18n } from '@lingui/core';
import { t } from '@lingui/macro';
import { useLingui } from '@lingui/react';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Link,
  Box,
  Typography,
  DialogTitle,
  DialogContent,
  Divider,
  IconButton,
  Button,
  DialogActions,
} from '@mui/material';

import * as yup from 'yup';

import { useApprovalPolicyDetails } from './useApprovalPolicyDetails';

const getValidationSchema = (i18n: I18n) =>
  yup.object({
    name: yup
      .string()
      .label(i18n._(t(i18n)`Policy Name`))
      .required(),
    description: yup
      .string()
      .label(i18n._(t(i18n)`Description`))
      .required(),
    trigger: yup
      .string()
      .label(i18n._(t(i18n)`Trigger in Monite Script`))
      .required(),
    script: yup
      .string()
      .label(i18n._(t(i18n)`Script in Monite Script`))
      .required(),
  });

export interface ApprovalPolicyFormFields {
  name: string;
  description: string;
  trigger: string;
  script: string;
}

export interface IApprovalPolicyDetailsProps {
  /** Callback is fired when a policy is created and sync with server is successful
   *
   * @param id - the ID of the created policy
   */
  onCreated?: (id: string) => void;
}

/**
 * ApprovalPolicyDetails component
 *
 * This component renders the approval policy details form. It includes fields for the policy name, description, trigger, and script.
 * The `useApprovalPolicyDetails` hook is used to handle the creation of a new approval policy.
 *
 */
export const ApprovalPolicyDetails = ({
  onCreated,
}: IApprovalPolicyDetailsProps) => {
  const { createApprovalPolicy, isLoading } = useApprovalPolicyDetails({
    onCreated,
  });
  const { i18n } = useLingui();
  const dialogContext = useDialog();
  const methods = useForm<ApprovalPolicyFormFields>({
    resolver: yupResolver(getValidationSchema(i18n)),
  });

  const { control, handleSubmit } = methods;

  return (
    <MoniteStyleProvider>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h3">
            {t(i18n)`Create Approval Policy`}
          </Typography>
          {dialogContext?.isDialogContent && (
            <IconButton
              edge="start"
              color="inherit"
              onClick={dialogContext.onClose}
              aria-label={t(i18n)`Close approval policy details`}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <FormProvider {...methods}>
          <form
            id="approvalPolicyCreationForm"
            noValidate
            onSubmit={handleSubmit((values) => {
              createApprovalPolicy({
                name: values.name,
                description: values.description,
                trigger: JSON.parse(values.trigger),
                script: JSON.parse(values.script),
              });
            })}
          >
            <Typography variant="subtitle2" mb={1}>
              {t(i18n)`Policy Name`}
            </Typography>
            <RHFTextField
              label={t(i18n)`Policy Name`}
              name="name"
              control={control}
              fullWidth
              required
            />
            <Typography variant="subtitle2" mt={2} mb={1}>
              {t(i18n)`Description`}
            </Typography>
            <RHFTextField
              label={t(i18n)`Description`}
              name="description"
              control={control}
              fullWidth
              required
              multiline
              rows={4}
            />
            <Typography
              variant="subtitle2"
              mt={2}
              mb={1}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {t(i18n)`Trigger in Monite Script`}
              <Link
                underline="none"
                rel="noopener noreferrer"
                href="https://docs.monite.com/docs/monitescript#trigger"
                target="_blank"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {t(i18n)`Go to Docs`}
                &nbsp;
                <OpenInNewIcon />
              </Link>
            </Typography>
            <JSONFormatterInput
              name="trigger"
              label={t(i18n)`Trigger in Monite Script`}
            />
            <Typography
              variant="subtitle2"
              mt={2}
              mb={1}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {t(i18n)`Script in Monite Script`}
              <Link
                underline="none"
                rel="noopener noreferrer"
                href="https://docs.monite.com/docs/monitescript#script"
                target="_blank"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {t(i18n)`Go to Docs`}
                &nbsp;
                <OpenInNewIcon />
              </Link>
            </Typography>
            <JSONFormatterInput
              name="script"
              label={t(i18n)`Script in Monite Script`}
            />
          </form>
        </FormProvider>
      </DialogContent>
      <Divider />
      <DialogActions>
        {dialogContext && (
          <Button
            variant="outlined"
            color="inherit"
            onClick={dialogContext.onClose}
          >
            {t(i18n)`Cancel`}
          </Button>
        )}
        <Button
          variant="outlined"
          type="submit"
          form="approvalPolicyCreationForm"
          disabled={isLoading}
        >
          {t(i18n)`Create`}
        </Button>
      </DialogActions>
    </MoniteStyleProvider>
  );
};
