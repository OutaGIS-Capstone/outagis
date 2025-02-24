import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Box, Button, Paper, Typography } from '@mui/material';

Amplify.configure(outputs);

function Signin() {
  return (
    <Box 
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: 2,
      }}
    >
        <Authenticator>
          {({ signOut, user }) => (
            <main>
              <Box sx={{ textAlign: 'center', marginBottom: 2 }}>
                <Typography variant="h4" color="primary">
                  Welcome Back!
                </Typography>
                <Typography variant="h6" color="textSecondary" sx={{ marginTop: 1 }}>
                  Hello {user?.userId}, you're logged in!
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={signOut}
                  sx={{ width: '100%', padding: 1.5 }}
                >
                  Sign Out
                </Button>
              </Box>
            </main>
          )}
        </Authenticator>
    </Box>
  );
}

export default Signin;
