import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Switch,
  Snackbar,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from '@mui/icons-material/Close';
import { useAdmin } from "./AdminContext.tsx";

const pages = [
  { name: "Outage Map", path: "/" },
  { name: "Outage List", path: "/outage-list" },
  { name: "Report an Outage", path: "/report-outage" },
];

function NavBar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [activePage, setActivePage] = useState("/"); // Track the active page

  const { user, signOut } = useAuthenticator((context) => [context.user]);
  const { isAdmin, toggleAdmin } = useAdmin();

  const navigate = useNavigate();
  const [openSignoutSnackbar, setOpenSignoutSnackbar] = useState(false);

  const settings = user
    ? [{ name: "Account", path: "/account" }, { name: "Sign Out", path: "/"}]
    : [{ name: "Sign In", path: "/signin" }];

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === "keydown" &&
        ((event as React.KeyboardEvent).key === "Tab" ||
          (event as React.KeyboardEvent).key === "Shift")
      ) {
        return;
      }
      setIsDrawerOpen(open);
    };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleSignInClick = (path: string) => {
    setActivePage(path);
  };

  const handlePageClick = (path: string) => {
    setActivePage(path);
  };

  const snackbarAndRedirect = () => {
    setOpenSignoutSnackbar(true);

    // Delay navigation slightly to allow Snackbar to be seen
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  return (
	<>
    <AppBar style={{ backgroundColor: "#F5F5F5" }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
            <IconButton
              size="large"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ color: "#6D6D6D" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

           <Drawer
            anchor="left"
            open={isDrawerOpen}
            onClose={toggleDrawer(false)}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <Box
              sx={{ width: 250 }}
              role="presentation"
              onClick={toggleDrawer(false)}
              onKeyDown={toggleDrawer(false)}
            >
              <List>
                <IconButton
                  size="medium"
                  aria-label="close"
                  onClick={toggleDrawer(false)}
                  sx={{ color: "#6D6D6D" }}
                >
                  <CloseIcon />
                </IconButton>

              </List>
              <Divider />
              <List>
                {pages.map((page) => (
                  <ListItem
                    key={page.name}
                    component={Link}
                    to={page.path}
                    onClick={() => handlePageClick(page.path)}
                    sx={{
                      color:  "#1f1e1e",
                      backgroundColor: activePage === page.path ? "#e0e0e0" : "inherit",
                    }}
                  >
                    <ListItemText primary={page.name} />
                  </ListItem>
                ))}
              </List>
              <Divider />
              <List>
                {settings.map((setting) => (
                  <ListItem
                    key={setting.name}
                    component={Link}
                    to={setting.path}
                    onClick={() => {
                      handleCloseUserMenu();
                      if (setting.name === "Sign Out") {
                        signOut();
					    snackbarAndRedirect();
                      }
                      setActivePage(setting.path);
                    }}
                      sx={{
                      color:  "#1f1e1e",
                      backgroundColor: "inherit",
                    }}
                  >
                    <ListItemText primary={setting.name} />
                  </ListItem>
                ))}
              </List>
              {user && (
                <Divider/>
              )}
              {user && (
                <List>
                  <ListItem>
                    <Typography variant="body1" sx={{ mr: 1 }}>
                      Admin Mode
                    </Typography>
                    <Switch checked={isAdmin} onChange={toggleAdmin} color="primary" />
                  </ListItem>
                </List>
              )}
            </Box>
          </Drawer>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            <img src="/src/assets/bch-full.png" style={{ height: "4em", width: "11em" }} alt="logo" />
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" }, justifyContent: "center", flexGrow: 2 }}>
            <img src="/src/assets/bch-full.png" style={{ height: "4em", width: "11em" }} alt="logo" />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                to={page.path}
                onClick={() => handlePageClick(page.path)}
                sx={{
                  my: 2,
                  color:  "#1f1e1e",
                  display: "block",
                  backgroundColor: activePage === page.path ? "#e0e0e0" : "inherit",
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {user && (
            <Box sx={{ display: { xs: "none", md: "inline"},  mx: 2 }}>
              <Typography variant="body1" sx={{color: "#1f1e1e", display: "inline", mr: 1 }}>
                Admin Mode
              </Typography>
              <Switch checked={isAdmin} onChange={toggleAdmin} color="primary" />
            </Box>
          )}
          {user && (
            <Box sx={{display: { xs: "none", md: "inline"}, flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar alt="User Avatar" src="/static/images/avatar/2.jpg" />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting.name}
                    onClick={() => {
                      handleCloseUserMenu();
                      if (setting.name === "Sign Out") {
                        signOut();
					    snackbarAndRedirect();
                      }
                      setActivePage(setting.path);
                    }}
                    {...(setting.name !== "Sign Out" ? { component: Link, to: setting.path } : {})}

                  >
                    <Typography sx={{ textAlign: "center" }}>{setting.name}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
          {!user && (
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "flex-end"}}>
              {settings.map((setting) => (
                <Button
                  key={setting.name}
                  component={Link}
                  to={setting.path}
                  onClick={() => {
                    handleSignInClick(setting.path);
                    setActivePage(setting.path);
                  }}
                  sx={{
                    my: 2,
                    color:  "#1f1e1e",
                    display: "block",
                  }}
                >
                  {setting.name}
                </Button>
              ))}
            </Box>
          )}

        </Toolbar>
      </Container>
    </AppBar>
	<Box>
      <Snackbar open={openSignoutSnackbar} autoHideDuration={20000} onClose={() => setOpenSignoutSnackbar(false)}>
        <Alert severity="success" sx={{ width: "100%" }}>
          You have been signed out successfully!
        </Alert>
      </Snackbar>
	</Box>
	</>
  );
}

export default NavBar;