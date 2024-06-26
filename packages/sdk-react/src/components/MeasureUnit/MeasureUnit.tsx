import React, { memo } from 'react';

import { useMeasureUnitById } from '@/core/queries';
import { Skeleton } from '@mui/material';

export const MeasureUnit = memo(({ unitId }: { unitId: string }) => {
  const { data: unit, isLoading } = useMeasureUnitById(unitId);

  if (isLoading) {
    return (
      <Skeleton variant="text" height="1rem" width={100} animation="wave" />
    );
  }

  if (!unit) {
    return null;
  }

  return <span>{unit.name}</span>;
});
