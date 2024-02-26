import { useCreateApprovalPolicy } from '@/core/queries/useApprovalPolicies';
import { ApprovalPolicyCreate } from '@monite/sdk-api';

import { IApprovalPolicyDetailsProps } from './ApprovalPolicyDetails';

export const useApprovalPolicyDetails = ({
  onCreated,
}: IApprovalPolicyDetailsProps) => {
  const createMutation = useCreateApprovalPolicy();

  const createApprovalPolicy = async (values: ApprovalPolicyCreate) => {
    const response = await createMutation.mutateAsync(values);

    if (response) {
      onCreated?.(response.id);
    }
  };

  return {
    createApprovalPolicy,
    isLoading: createMutation.isLoading,
  };
};
