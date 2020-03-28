import React, { useEffect, useState } from 'react';
import './App.css';
import AppBar from '@material-ui/core/AppBar';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/CssBaseline';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Switch, Link, useLocation } from 'react-router-dom';
import { getEnvironmentInfo } from './modules/environment';
import { initializeUserAuth, cacheLaunchURL } from './modules/user';
import { firebase } from './firebase';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Hidden from '@material-ui/core/Hidden';

// Pages
import Homepage from './components/Homepage';
import Login from './components/Login';
import Logout from './components/Logout';
import RequestHelp from './components/RequestHelp';
import RequestSuccessful from './components/RequestSuccessful';
import AuthenticatedContainer from './components/AuthenticatedContainer';
import { version } from '../package.json';
import Volunteers from './components/Volunteers';
import ContactUs from './components/ContactUs';
import About from './components/About';
// import Maps from './components/Maps';
// import Geolocation from './components/Geolocation';
// import MyTasks from './components/MyTasks';
import NeedHelp from './components/RequestHelp';
import NeedDetails from './pages/NeedDetailsPage';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  grow: { flexGrow: 1 },
  headerLink: {
    color: theme.palette.primary.contrastText,
    textDecoration: 'none'
  },
  footer: {
    // backgroundColor: theme.palette.background.paper,
    marginTop: 'auto',
    padding: theme.spacing(3),
  },
  appBar: {
    marginBottom: theme.spacing(2)
  },
  bodyContainer: {
    paddingBottom: theme.spacing(9),
    marginBlock: theme.spacing(6)
  }
}));

function MainMenu(props){
  {
    const [anchorEl, setAnchorEl] = React.useState(null);
    
    const handleClick = event => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    if(props.mobile){
      return (
        <Hidden only={['lg', 'xl', 'md']}>
          <IconButton edge="start" className={props.classes} color="inherit" aria-label="menu" aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick} >
              <MenuIcon />
            </IconButton>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose} component={Link} to="/volunteers">Volunteers</MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/contactus">Contact us</MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/twitter">Twitter</MenuItem>
            <MenuItem onClick={handleClose} component={Link} to="/about">About</MenuItem>
          </Menu>
          </Hidden>
      );
      }else{
        return(          
        <Hidden only={['sm', 'xs']}>
        <ButtonGroup variant="text" color="inherit" aria-label="text primary button group">
        <Button component={Link} to="/volunteers">Volunteers</Button>
        <Button component={Link} to="/contactus">Contact us</Button>
        <Button component={Link} to="/twitter">Twitter</Button>
        <Button component={Link} to="/about">About</Button>
        </ButtonGroup>
      </Hidden>
      );
      }
  }
}
function App(props) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const location = useLocation();
  const environment = useSelector(state => state.get("environment") );
  const user = useSelector(state => state.get("user"));

  const [ profileMenuAnchor, setProfileMenuAnchor ] = useState(null);

  const handleProfileMenuClick = () => {
    setProfileMenuAnchor(null);
  }

  useEffect(() => {
    dispatch(getEnvironmentInfo());
    dispatch(cacheLaunchURL(location.pathname));
    firebase.auth().onAuthStateChanged(user => {
      dispatch(initializeUserAuth());
    });
  }, [dispatch]);

  // Don't render anything until firebase auth is fully initialized.
  if (user.get("isInitialized") !== true) {
    return (
      <React.Fragment>
        <CircularProgress />
        <Typography variant="h6" noWrap>
            Loading...
        </Typography>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Helmet titleTemplate="%s | CV19 Assist" />
      <CssBaseline />

      <div className={classes.root}>
        <AppBar position="relative" className={classes.appBar}>
          <Toolbar>
          <MainMenu mobile={true}/>
            <Typography variant="h6" color="inherit" noWrap>
              <Link to="/" className={classes.headerLink}>
                COVID-19 Assist
              </Link>
            </Typography>
            <div className={classes.grow} />
            <MainMenu mobile={false}/>
            {user.get("isAuthenticated") === true &&
              user.get("userProfile") !== null && (
                <React.Fragment>
                  <Button
                    startIcon={<AccountCircle />}
                    edge="end"
                    color="inherit"
                    onClick={event => setProfileMenuAnchor(event.currentTarget)}
                  >
                    {user.get("userProfile").get("displayName")}
                  </Button>
                  <Menu
                    open={Boolean(profileMenuAnchor)}
                    anchorEl={profileMenuAnchor}
                    onClose={handleProfileMenuClick}
                  >
                    <MenuItem
                      component={Link}
                      to="/profile/tasks"
                      onClick={handleProfileMenuClick}
                    >
                      My Tasks
                    </MenuItem>
                    <MenuItem
                      component={Link}
                      to="/profile"
                      onClick={handleProfileMenuClick}
                    >
                      Profile
                    </MenuItem>
                    {/* <MenuItem component={Link} to="/tasks" onClick={handleProfileMenuClick}>My Tasks</MenuItem> */}
                    <MenuItem
                      component={Link}
                      to="/logout"
                      onClick={handleProfileMenuClick}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </React.Fragment>
              )}
          </Toolbar>
        </AppBar>

        <Container classes={classes.bodyContainer}>
          <main>
            <Switch>
              <Route exact path="/" component={Homepage} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/logout" component={Logout} />
              <Route exact path="/request" component={RequestHelp} />
              <Route exact path="/need-help" component={NeedHelp} />
              <Route exact path='/twitter' component={() => { 
                    window.open('https://twitter.com/CV19Assist','_blank');
                    window.history.back();
                }}/>
              <Route exact path="/volunteers" component={Volunteers} />  
              <Route exact path="/contactus" component={ContactUs} />  
              <Route exact path="/about" component={About} />  
              <Route
                exact
                path="/request-successful"
                component={RequestSuccessful}
              />
              <Route exact path="/needs/:id" component={NeedDetails} />

              {/* TODO: Remove temporary routes */}
              {/* <Route exact path="/geo" component={Geolocation} />
              <Route exact path="/myTasks" component={MyTasks} /> */}

              <Route exact path="/contact">
                <p>Contact Us</p>
                <p>coming soon...</p>
              </Route>
              <Route component={AuthenticatedContainer} />
            </Switch>
          </main>
        </Container>

        <footer className={classes.footer}>
          <Typography variant="body2" color="textSecondary" align="center">
            {"Copyright © "}
            <a
              href="https://www.cv19assist.com"
              target="_blank"
              rel="noopener noreferrer"
            >CV19Assist.com</a>{" "}
            {`${new Date().getFullYear()} - v${version} ${environment.get("abbreviation")}`}
          </Typography>
        </footer>
      </div>
    </React.Fragment>
  );
}

export default App;