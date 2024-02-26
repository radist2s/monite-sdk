import { Dialog } from '@/components/Dialog';
import { action } from '@storybook/addon-actions';
import type { Meta, StoryObj } from '@storybook/react';

import { ApprovalPolicyDetails } from './ApprovalPolicyDetails';

const meta: Meta<typeof ApprovalPolicyDetails> = {
  title: 'Approval Policies/Approval Policies — Details View',
  component: ApprovalPolicyDetails,
};

type Story = StoryObj<typeof ApprovalPolicyDetails>;

export const DialogDetailsView: Story = {
  args: {},
  render: (args) => (
    <Dialog open={true} alignDialog="right" onClose={action('onClose')}>
      <ApprovalPolicyDetails />
    </Dialog>
  ),
};

export default meta;
