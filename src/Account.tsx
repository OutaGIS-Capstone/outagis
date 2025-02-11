import React, { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, updateUserAttributes, signOut, resetPassword } from 'aws-amplify/auth';
import { Button, TextField, Container, Typography, Paper, Grid, Snackbar } from '@mui/material';
import '@aws-amplify/ui-react/styles.css';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

function Account() {
  const [userInfo, setUserInfo] = useState({
    email: '',
    name: '',
    newPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        setUserInfo({
          email: user.signInDetails?.loginId || '',
          name: user.signInDetails?.loginId || '',
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

  const updateUserInfo = async () => {
    try {
      const user = await getCurrentUser();
      await updateUserAttributes(user, {
        email: userInfo.email,
        name: userInfo.name,
      });
      if (userInfo.newPassword) {
        await resetPassword({ username: userInfo.email });
      }
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
            <Grid item>
              <Typography variant="h4" color="primary" align="center">
                Account Settings
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField label="Email" variant="outlined" fullWidth name="email" value={userInfo.email} onChange={handleChange} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Name" variant="outlined" fullWidth name="name" value={userInfo.name} onChange={handleChange} margin="normal" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="New Password" variant="outlined" fullWidth name="newPassword" type="password" value={userInfo.newPassword} onChange={handleChange} margin="normal" />
            </Grid>
            <Grid item>
              <Button variant="contained" color="primary" fullWidth onClick={updateUserInfo} sx={{ marginTop: 2 }}>
                Save Changes
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="secondary" fullWidth onClick={() => signOut()} sx={{ marginTop: 2 }}>
                Sign Out
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)} message="Account info updated successfully!" anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError('')} message={error} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} />
    </div>
  );
}

export default Account; 
