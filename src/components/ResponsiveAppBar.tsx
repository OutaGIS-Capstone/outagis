import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import Link from '@mui/material/Link';

// Reference: https://mui.com/material-ui/react-app-bar/

const user_options = ['Personal information', 'Change password', 'View your outage reports', 'Log out'];

function ResponsiveAppBar() {
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar position="sticky" color="inherit">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>
		  <Box
            component="img"
            sx={{
            height: 80,
            }}
            alt="BCH Logo"
            src="/src/assets/bch-logo.svg"
          />
		  <Box sx={{ display: "flex" }}>
          <Box>
		    <Link href="/help">
			  <QuestionMarkIcon fontSize="large"/>
		    </Link>
          </Box>
          <Box>
		    <Link href="/contact">
			  <PhoneIcon fontSize="large"/>
		    </Link>
          </Box>
          <Box>
            <Tooltip>
              <IconButton onClick={handleOpenUserMenu} sx={{ height: 40, p: 1 }}>
				  <PersonIcon fontSize="large"/>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
			  float="right"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {user_options.map((opt) => (
                <MenuItem key={opt} onClick={handleCloseUserMenu}>
                  <Typography sx={{ textAlign: 'center' }}>{opt}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
