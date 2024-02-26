import { useCallback, useEffect, useMemo, useState } from 'react';

import { ErrorType } from '@/core/queries/types';
import {
  useCreateBankAccount,
  useDeleteBankAccount,
} from '@/core/queries/useBankAccounts';
import {
  useOnboardingBankAccountMask,
  useOnboardingRequirementsData,
  usePatchOnboardingRequirementsData,
} from '@/core/queries/useOnboarding';
import {
  CreateEntityBankAccountRequest,
  CurrencyEnum,
  EntityBankAccountResponse,
  OnboardingBankAccount,
  OnboardingBankAccountMask,
  OnboardingRequirement,
} from '@monite/sdk-api';

import { enrichFieldsByValues, generateFieldsByMask } from '../transformers';
import type { OnboardingFormType } from './useOnboardingForm';
import { useOnboardingForm } from './useOnboardingForm';

export type OnboardingBankAccountReturnType = {
  /**  isLoading a boolean flag indicating whether the form data is being loaded. */
  isLoading: boolean;

  error: ErrorType;

  currencies: CurrencyEnum[];

  primaryAction: (
    payload: CreateEntityBankAccountRequest
  ) => Promise<EntityBankAccountResponse>;

  onboardingForm: OnboardingFormType<
    CreateEntityBankAccountRequest,
    EntityBankAccountResponse
  >;
};

export function useOnboardingBankAccount(): OnboardingBankAccountReturnType {
  const { data: onboarding } = useOnboardingRequirementsData();

  const patchOnboardingRequirements = usePatchOnboardingRequirementsData();

  const {
    mutateAsync: createBankAccountMutation,
    isLoading: isCreateBankAccountLoading,
  } = useCreateBankAccount();

  const {
    mutateAsync: deleteBankAccountMutation,
    isLoading: isDeleteBankAccountLoading,
  } = useDeleteBankAccount();

  const {
    data: bankAccountMasks,
    error: bankAccountMasksError,
    isInitialLoading,
  } = useOnboardingBankAccountMask();

  const bankAccounts = useMemo(
    () => onboarding?.data?.bank_accounts || [],
    [onboarding?.data?.bank_accounts]
  );

  const currencies = useMemo(
    () =>
      bankAccountMasks ? (Object.keys(bankAccountMasks) as CurrencyEnum[]) : [],
    [bankAccountMasks]
  );

  const currentBankAccount = useMemo(() => {
    if (!bankAccounts?.length) return null;
    return bankAccounts[0];
  }, [bankAccounts]);

  const [mask, setMask] = useState<OnboardingBankAccountMask | null>(null);

  const [fields, setFields] = useState<OnboardingBankAccount>(
    useMemo(() => {
      if (currentBankAccount) {
        return currentBankAccount;
      }

      return generateFieldsByMask<OnboardingBankAccount>(getDefaultMask());
    }, [currentBankAccount])
  );

  const onboardingForm = useOnboardingForm<
    CreateEntityBankAccountRequest,
    EntityBankAccountResponse | undefined
  >(fields, 'bankAccount');

  const { watch } = onboardingForm.methods;

  const currency = watch('currency');

  useEffect(() => {
    if (!currency) return;
    if (!bankAccountMasks) return;
    if (!(currency in bankAccountMasks)) return;

    const mask = bankAccountMasks[currency];

    if (!mask) return;

    setMask(mask);
  }, [bankAccountMasks, currency]);

  useEffect(() => {
    if (!mask) return;

    setFields(generateFieldsByMask<OnboardingBankAccount>(mask));
  }, [mask]);

  const primaryAction = useCallback(
    async (payload: CreateEntityBankAccountRequest) => {
      const response = await createBankAccountMutation({
        ...payload,
        is_default_for_currency: true,
      });

      if (currentBankAccount) {
        await deleteBankAccountMutation(currentBankAccount.id);
      }

      patchOnboardingRequirements({
        requirements: [OnboardingRequirement.BANK_ACCOUNTS],
        data: {
          bank_accounts: [enrichFieldsByValues(fields, payload)],
        },
      });

      return response;
    },
    [
      createBankAccountMutation,
      deleteBankAccountMutation,
      currentBankAccount,
      patchOnboardingRequirements,
      fields,
    ]
  );

  return {
    isLoading:
      isInitialLoading ||
      isCreateBankAccountLoading ||
      isDeleteBankAccountLoading,
    currencies,
    onboardingForm,
    primaryAction,
    error: bankAccountMasksError,
  };
}

const getDefaultMask = (): OnboardingBankAccountMask => ({
  country: true,
  currency: true,
});
