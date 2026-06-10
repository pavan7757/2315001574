import React from 'react';
import { Card, CardContent, Chip, Stack, Typography, Box } from '@mui/material';

const TYPE_COLOR = {
  Placement: 'primary',
  Result: 'success',
  Event: 'warning',
};

export default function NotificationCard({ notification, viewed }) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        borderColor: viewed ? 'grey.300' : 'primary.main',
        opacity: viewed ? 0.76 : 1,
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              {notification.Message}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {notification.Timestamp}
            </Typography>
          </Box>
          <Chip label={notification.Type} color={TYPE_COLOR[notification.Type] || 'default'} />
        </Stack>
      </CardContent>
    </Card>
  );
}
