import React from 'react';

import { approvalPoliciesSearchFixture } from '@/mocks/approvalPolicies/approvalPoliciesFixture';
import {
  cachedMoniteSDK,
  renderWithClient,
  triggerChangeInput,
} from '@/utils/test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ApprovalPolicyDetails } from './ApprovalPolicyDetails';

const fillForm = async (
  name: string,
  description: string,
  trigger: string,
  script: string
) => {
  triggerChangeInput(/Policy Name/i, name);
  triggerChangeInput(/Description/i, description);
  triggerChangeInput(/Trigger in Monite Script/i, trigger);
  triggerChangeInput(/Script in Monite Script/i, script);
};

describe('ApprovalPolicyDetails', () => {
  describe('#FormValidation', () => {
    test('should show error message when fields are empty and form is submitted', async () => {
      renderWithClient(<ApprovalPolicyDetails />);

      const createButton = screen.getByRole('button', {
        name: /Create/i,
      });

      fireEvent.click(createButton);

      const errorMessages = await screen.findAllByText(/is a required field/i);

      expect(errorMessages.length).toBe(4);
    });
  });

  const user = userEvent.setup();

  const name = 'Test Policy';
  const description = 'Test Description';
  const trigger = JSON.stringify(approvalPoliciesSearchFixture.data[0].trigger);
  const script = JSON.stringify(approvalPoliciesSearchFixture.data[0].script);

  describe('# Public API', () => {
    test('should trigger "onCreated" after successful creation', async () => {
      const onCreatedMock = jest.fn();

      renderWithClient(<ApprovalPolicyDetails onCreated={onCreatedMock} />);

      await fillForm(name, description, trigger, script);

      const createButton = screen.getByRole('button', {
        name: /Create/i,
      });

      await user.click(createButton);

      await waitFor(() => {
        expect(onCreatedMock).toHaveBeenCalled();
      });
    });
  });

  test('should send the correct data to the server', async () => {
    const onCreatedMock = jest.fn();
    const createApprovalPolicy = jest.spyOn(
      cachedMoniteSDK.api.approvalPolicies,
      'create'
    );

    renderWithClient(<ApprovalPolicyDetails onCreated={onCreatedMock} />);

    await fillForm(name, description, trigger, script);

    const createButton = screen.getByRole('button', {
      name: /Create/i,
    });

    await user.click(createButton);

    const callArguments = createApprovalPolicy.mock.calls;

    if (!callArguments.length) {
      throw new Error('createApprovalPolicy was not called');
    }

    const requestBody = callArguments[0][0];

    expect(requestBody).toMatchObject({
      name,
      description,
      trigger: approvalPoliciesSearchFixture.data[0].trigger,
      script: approvalPoliciesSearchFixture.data[0].script,
    });
  });
});
