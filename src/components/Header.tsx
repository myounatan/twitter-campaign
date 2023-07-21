import Image from 'next/image'
import { AppBar, Box, Button, Toolbar, Typography, Stack } from '@mui/material';

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Stack spacing={2} direction="row">
          <Button variant="outlined" color="inherit">
            <Typography variant="body1" color="inherit">
              Campaigns
            </Typography>
          </Button>
          <Button variant="text" color="inherit">
            <Typography variant="body1" color="inherit">
              All Reward History
            </Typography>
          </Button>
        </Stack>
        <Box component="div" sx={{ flexGrow: 1 }}>
        </Box>
        <Button variant="outlined" color="inherit">
          <Stack spacing={2} direction="row">
          <Typography variant="body1" color="inherit">
            Login
          </Typography>
          <Image
            src="/twitter-48.png"
            alt="Twitter Login Logo"
            width={25}
            height={25}
            priority
          />
          </Stack>
        </Button>
      </Toolbar>
    </AppBar>
  );
}