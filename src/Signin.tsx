import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import { Box } from '@mui/material';
import  { Navigate } from 'react-router-dom'

Amplify.configure(outputs);

function Signin() {
  const { authStatus } = useAuthenticator(context => [context.authStatus]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
	  <Box sx={{ flexGrow: 1, overflow: "hidden", position: "relative", mt: 3, marginTop: "5em"}}>
	    {authStatus === 'configuring' && 'Loading...'}
	    {authStatus !== 'authenticated' ? <Authenticator /> : <Navigate to="/" />}
	  </Box>
    </Box>
  );
}

export default Signin;
