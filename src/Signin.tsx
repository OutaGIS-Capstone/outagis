import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useAuthenticator } from '@aws-amplify/ui-react';
import Home from "./Home.tsx";

Amplify.configure(outputs);

function Signin() {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);

  return (
    <>
      {authStatus === 'configuring' && 'Loading...'}
      {authStatus !== 'authenticated' ? <Authenticator /> : <Home />}
    </>
  );
}

export default Signin;
