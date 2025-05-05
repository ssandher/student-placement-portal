import React, { useState, useRef, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  styled,
  Paper,
  MenuList,
  Popper,
  Grow,
  MenuItem
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import pdeulogo from '../photos/pdeulogo.jpg';
import { useNavigate } from 'react-router-dom';

const Logo = styled('img')({
  height: '40px',
  marginRight: '8px',
});

const Header = ({ handleDrawerToggle, isLoggedIn, onLogout, userName }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const anchorRef = useRef(null);
  const menuRef = useRef(null); // Ref to the menu itself
  const [isHoveringIcon, setIsHoveringIcon] = useState(false);  //Track hover on the icon
  const [isHoveringMenu, setIsHoveringMenu] = useState(false);   //Track hover on the menu

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/auth');
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleMouseEnter = () => {
      setIsHoveringIcon(true);
      if (!open) {
          setOpen(true); //Open only if the menu isn't open
      }
  };

    const handleMouseLeave = () => {
        setIsHoveringIcon(false);
        //Close menu if we're not hovering over icon or the menu
        setTimeout(() => {
            if (!isHoveringIcon && !isHoveringMenu) {
                setOpen(false);
            }
        }, 100); //Small delay to allow mouse to enter the menu

    };

    const handleMenuEnter = () => {
        setIsHoveringMenu(true);
    }

    const handleMenuLeave = () => {
        setIsHoveringMenu(false);
        if (!isHoveringIcon) {
            setOpen(false);
        }
    }


  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Logo src={pdeulogo} alt="PDEU Logo" />
        <Typography variant="h6" noWrap>
          CDC Placement cell
        </Typography>
        <Box sx={{ flexGrow: 1 }} />

        {isLoggedIn && (
          <div>
            <IconButton
              ref={anchorRef}
              id="composition-button"
              aria-controls={open ? 'composition-menu' : undefined}
              aria-expanded={open ? 'true' : undefined}
              aria-haspopup="true"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              placement="bottom-start"
              transition
              disablePortal
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === 'bottom-start' ? 'left top' : 'left bottom',
                  }}
                >
                  <Paper
                      onMouseEnter={handleMenuEnter}
                      onMouseLeave={handleMenuLeave}
                      ref={menuRef} //Assign ref to the Paper
                  >
                      <MenuList
                        autoFocusItem={open}
                        id="composition-menu"
                        aria-labelledby="composition-button"
                        onKeyDown={handleListKeyDown}
                      >
                        <MenuItem disabled sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', color: 'rgba(0, 0, 0, 0.87)' }}>
                          <Typography variant="body2">
                            Signed in as
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {userName || 'Admin'}
                          </Typography>
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>Log out</MenuItem>
                      </MenuList>
                  </Paper>
                </Grow>
              )}
            </Popper>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;