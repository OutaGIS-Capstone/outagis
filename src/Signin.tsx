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
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
	  <Box sx={{ flexGrow: 1, overflow: "hidden", position: "relative", mt: 3, marginTop: "5em"}}>
	    {authStatus === 'configuring' && 'Loading...'}
	    {authStatus !== 'authenticated' ? <Authenticator /> : <Home />}
	  </Box>
    </Box>
  );
}

export default Signin;
