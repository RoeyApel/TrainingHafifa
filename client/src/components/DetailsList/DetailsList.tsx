import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';

const EMPTY_VALUE = '—';

interface DetailsRow {
  label: string;
  value: string | number | null;
}

interface DetailsListProps {
  rows: DetailsRow[];
}

export const DetailsList: FC<DetailsListProps> = ({ rows }) => {
  return (
    <Box
      component="dl"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        columnGap: 1.5,
        rowGap: 0.5,
        m: 0,
      }}
    >
      {rows.map(({ label, value }) => (
        <Box key={label} sx={{ display: 'contents' }}>
          <Typography component="dt" variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0 }}>
            {value ?? EMPTY_VALUE}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};
