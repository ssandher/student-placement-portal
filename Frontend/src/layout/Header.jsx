import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Mail as MailIcon } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Header = ({ handleDrawerToggle }) => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        {/* Logo or Title */}
        <Typography variant="h6" noWrap>
          CDC Placement cell
        </Typography>
        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />
        {/* User Account Icon */}
        <IconButton color="inherit">
            <MailIcon />
        </IconButton>
        <IconButton color="inherit">
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
