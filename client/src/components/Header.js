import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Menu, MenuItem, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { AccountCircle, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '@fontsource/roboto';
import { styled } from '@mui/system';
import { jwtDecode } from 'jwt-decode';

const StyledAppBar = styled(AppBar)`
  .MuiToolbar-root {
    justify-content: space-between;
  }
`;

const StyledMenuItem = styled(MenuItem)`
  && {
    min-height: 48px;
    font-size: 16px;

    @media (min-width: 600px) {
      min-height: 56px;
      font-size: 20px;
    }
  }
`;

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    width: 240px;

    @media (min-width: 600px) {
      width: 300px;
    }
  }
`;

const StyledListItemText = styled(ListItemText)`
  .MuiListItemText-primary {
    font-size: 16px;

    @media (min-width: 600px) {
      font-size: 20px;
    }
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const decodedToken = jwtDecode(token);
  const roleId = decodedToken ? decodedToken.roleId : null;

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSideMenuToggle = () => {
    setSideMenuOpen(!sideMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMyProfile = () => {
    navigate('/myprofile');
  };

  const handleMenuItemClick = (route) => {
    handleSideMenuToggle();
    navigate(route);
  };

  const renderSideMenu = () => {
    const menuItems = [
      { label: 'Clientes', visible: roleId === 1 || roleId === 2, route: '/clients' },
      { label: 'Solicitudes', visible: roleId === 1 || roleId === 2, route: '/requests' },
      { label: 'Sitios', visible: roleId === 1, route: '/sites' },
      { label: 'Sistemas', visible: roleId === 1, route: '/systems' },
      { label: 'Tecnicos', visible: roleId === 1, route: '/technician' },
      { label: 'Usuarios', visible: roleId === 1, route: '/users' },
    ];

    return (
      <StyledDrawer anchor="left" open={sideMenuOpen} onClose={handleSideMenuToggle}>
        <List>
          {menuItems
            .filter((item) => item.visible)
            .map((item) => (
              <ListItem button key={item.label} onClick={() => handleMenuItemClick(item.route)}>
                <StyledListItemText primary={item.label} />
              </ListItem>
            ))}
        </List>
      </StyledDrawer>
    );
  };

  return (
    <StyledAppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={handleSideMenuToggle}
        >
          <MenuIcon />
        </IconButton>
        {renderSideMenu()}
        <div style={{ flexGrow: 1 }} />
        {token && (
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            aria-label="account"
            onClick={handleUserMenuOpen}
          >
            <AccountCircle />
          </IconButton>
        )}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleUserMenuClose}
        >
          <StyledMenuItem onClick={handleMyProfile}>My Profile</StyledMenuItem>
          <StyledMenuItem onClick={handleLogout}>Logout</StyledMenuItem>
        </Menu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;