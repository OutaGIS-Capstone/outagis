import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Amplify } from 'aws-amplify';
import {
	getCurrentUser,
	signOut,
	updateUserAttributes,
} from 'aws-amplify/auth';
import { Alert, Button, TextField, Container, Paper, Grid, Snackbar } from '@mui/material';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

function Account() {
  const [userInfo, setUserInfo] = useState({
    email: '',
    newPassword: '',
    oldPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        setUserInfo({
          email: user.signInDetails?.loginId || '',
          oldPassword: '',
          newPassword: '',
        });
      } catch (err) {
        console.error("Error fetching user info", err);
      }
    };
    fetchUserInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInfo({
      ...userInfo,
      [e.target.name]: e.target.value,
    });
  };

  const signout_redirect = () => {
    signOut();
    setOpenSnackbar(true);

    // Delay navigation slightly to allow Snackbar to be seen
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  // TODO: updateUserInfo causes the following error during deploy:
  // error TS2353: Object literal may only specify known properties, and 'oldpass' does not exist in type 'AuthUpdatePasswordInput'.
  const updateUserInfo = async () => {
    try {
      await updateUserAttributes({
	    userAttributes: {
          email: userInfo.email
		},
      });
	  //const newpass = userInfo.newPassword;
	  //const oldpass = userInfo.oldPassword;
      //if (newpass && oldpass) {
      //  await updatePassword({ newpass, oldpass }); // FIXME: something wrong here
      //}
      setSuccess(true);
    } catch (err) {
      console.error("Error updating user info", err);
      setError('Failed to update user information.');
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Container maxWidth="xs">
        <Paper sx={{ padding: 4, borderRadius: 2, boxShadow: 3, backgroundColor: '#ffffff' }}>
          <Grid container direction="column" spacing={2} alignItems="center">
            <Grid item xs={12}>
              <TextField label="Email" variant="outlined" fullWidth name="email" value={userInfo.email} onChange={handleChange} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Old Password" variant="outlined" fullWidth name="oldPassword" type="password" value={userInfo.oldPassword} onChange={handleChange} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="New Password" variant="outlined" fullWidth name="newPassword" type="password" value={userInfo.newPassword} onChange={handleChange} margin="normal" />
            </Grid>
            <Grid item>
              <Button onClick={() => updateUserInfo()} variant="contained" color="primary" fullWidth sx={{ marginTop: 2 }}>
                Save Changes
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="secondary" fullWidth onClick={() => signout_redirect()} sx={{ marginTop: 2 }}>
                Sign Out
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} message="Account info updated successfully!" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')} message={error} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Snackbar open={openSnackbar} autoHideDuration={20000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: "100%" }}>
          You have been signed out successfully!
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Account; 
