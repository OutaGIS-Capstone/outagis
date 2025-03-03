import React, { useState } from "react";
import { Link } from "react-router-dom";
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

  const settings = user
    ? [{ name: "Account", path: "/account" }, { name: "Sign Out" }]
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

  const handlePageClick = (path: string) => {
    setActivePage(path);
  };

  return (
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

          <Box sx={{ flexGrow: 0 }}>
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
                    }
                  }}
                  {...(setting.name !== "Sign Out" ? { component: Link, to: setting.path } : {})}
                >
                  <Typography sx={{ textAlign: "center" }}>{setting.name}</Typography>
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