import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { AppBar, Box, Toolbar, IconButton, Typography, Menu, Container, Avatar, Button, Tooltip, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const pages = [
  { name: 'Outage Map', path: '/' },
  { name: 'Outage List', path: '/outage-list' },
  { name: 'Report an Outage', path: '/report-outage' }
];

function NavBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

  const { user, signOut } = useAuthenticator((context) => [context.user]);

  const settings = user
    ? [{ name: 'Account', path: '/account' }, { name: 'Sign Out' }]
    : [{ name: 'Sign In', path: '/signin' }];

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <AppBar style={{ backgroundColor: "#F5F5F5" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Mobile view: Hamburger menu on left */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Desktop view: Logo and nav buttons on the left */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <img src="/src/assets/bch-full.png" style={{ height: "4em", width: "11em" }} alt="logo" />
          </Box>

          {/* Mobile view: Center logo and display nav buttons when hamburger menu is clicked */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, justifyContent: 'center', flexGrow: 2 }}>
            <img src="/src/assets/bch-full.png" style={{ height: "4em", width: "11em" }} alt="logo" />
          </Box>

          {/* Desktop view: Navigation buttons */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                sx={{ my: 2, color: '#1f1e1e', display: 'block' }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Mobile view: User icon on the right */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', ml: 'auto' }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.name}
                  onClick={() => {
                    handleCloseUserMenu();
                    if (setting.name === 'Sign Out') {
                      signOut();
                    }
                  }}
                  {...(setting.name !== 'Sign Out'
                    ? { component: Link, to: setting.path }
                    : {})}
                >
                  <Typography sx={{ textAlign: 'center' }}>{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* User menu */}
          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
              keepMounted
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting.name}
                  onClick={() => {
                    handleCloseUserMenu();
                    if (setting.name === 'Sign Out') {
                      signOut();
                    }
                  }}
                  {...(setting.name !== 'Sign Out'
                    ? { component: Link, to: setting.path }
                    : {})}
                >
                  <Typography sx={{ textAlign: 'center' }}>{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
