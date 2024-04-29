import { styled } from '@mui/system';
import { Box, Card as MuiCard } from '@mui/material';

export const CustomContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
}));

export const CustomMain = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(4),
}));

export const CustomCard = styled(MuiCard)(({ theme }) => ({
    marginBottom: theme.spacing(2),
  }));