import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Paper,
  Divider,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Grid,
  makeStyles,
} from '@material-ui/core';
import {
  ExitToApp as LogoutIcon,
  Person as AccountIcon,
} from '@material-ui/icons';
import { Link, useHistory } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as Yup from 'yup';
import { useFirestore, useUser } from 'reactfire';
import { USERS_COLLECTION } from 'constants/collections';
import ClickableMap from 'components/ClickableMap';
import { useForm } from 'react-hook-form';
import { validateEmail } from 'utils/form';
import { ACCOUNT_PATH, LOGOUT_PATH, SEARCH_PATH } from 'constants/paths';
import styles from './NewUserPage.styles';

const useStyles = makeStyles(styles);

const userProfileSchema = Yup.object().shape({
  firstName: Yup.string().min(2, 'Too Short').required('Required'),
  lastName: Yup.string().min(2, 'Too Short').required('Required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Required'),
  phone: Yup.string().required('Required'),
  address1: Yup.string(),
  address2: Yup.string(),
  city: Yup.string(),
  state: Yup.string(),
  zipcode: Yup.string(),
});

function NewUser() {
  const classes = useStyles();
  const firestore = useFirestore();
  const history = useHistory();
  const user = useUser();
  const defaultValues = {};

  const [retries, setRetries] = useState(0);
  const [userRef, setUserRef] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // Because of timing issues, this component will likely get run before the server has applied
  // the requested document access resulting in almost a guranteed permission-denied error. So,
  // we use this effect to monitor for permission-denied until the change has propagated, at which
  // point, we do the actual doc subscription (next useEffect);
  useEffect(() => {
    async function getData() {
      try {
        const ref = firestore.doc(`${USERS_COLLECTION}/${user.uid}`);
        // Call it once because this will throw the permission exception.
        await ref.get();
        setUserProfile(await ref.get());
        setUserRef(ref);
      } catch (err) {
        // We only try reloading if insufficient permissions.
        if (err.code !== 'permission-denied') {
          throw err;
        }
        window.setTimeout(() => {
          setRetries(retries + 1);
        }, 1000);
      }
    }
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retries]);

  if (user && user.uid) {
    defaultValues.email = user.email;
    const nameParts = user.displayName?.split(' ');
    if (nameParts) {
      [defaultValues.firstName] = nameParts;
      defaultValues.lastName = nameParts.length > 1 ? nameParts[1] : '';
    }
  }

  const {
    handleSubmit,
    errors,
    register,
    formState: { isValid, dirty },
  } = useForm({
    validationSchema: userProfileSchema,
    defaultValues,
  });
  const [userLocationInfo, setUserLocationInfo] = useState(null);

  if (userProfile && userProfile.preciseLocation) {
    return (
      <Container maxWidth="md">
        <Card style={{ minWidth: 275 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              New User Setup
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              You are already signed up so you do not have to sign up again.
            </Typography>
          </CardContent>
          <CardActions>
            <Button
              component={Link}
              to={ACCOUNT_PATH}
              startIcon={<AccountIcon />}
              size="small"
              color="primary">
              View Your Profile
            </Button>
            <Button
              component={Link}
              to={LOGOUT_PATH}
              startIcon={<LogoutIcon />}
              size="small"
              color="secondary">
              Logout
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  }

  // const handleLocationChange = (location) => {
  //   setUserLocation(location);
  // };

  async function handleFormSubmit(values) {
    if (!userLocationInfo) {
      alert('Please select a location above.'); // eslint-disable-line no-alert
      return;
    }

    const userUpdates = { ...values, ...userLocationInfo };
    await userRef.set(userUpdates, { merge: true });
    history.replace(SEARCH_PATH);
  }

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Volunteer Sign Up</title>
      </Helmet>
      <Typography variant="h4" gutterBottom>
        Volunteer Sign Up
      </Typography>
      <Paper className={classes.paper}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Container>
            <Typography gutterBottom>
              Thank you for volunteering with CV19 Assist. Please complete the
              following information so we can efficiently find matches.
            </Typography>
            <Grid container spacing={1} direction="row">
              <Grid item xs={6}>
                <TextField
                  name="firstName"
                  type="text"
                  label="First Name"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.firstName}
                  helperText={errors.firstName && 'First name must be valid'}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  name="lastName"
                  type="text"
                  label="Last Name"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.lastName}
                  helperText={errors.lastName && 'Last name must be valid'}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  type="email"
                  name="email"
                  label="Email"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register({
                    required: true,
                    validate: validateEmail,
                  })}
                  error={!!errors.email}
                  helperText={errors.email && 'Email must be valid'}
                />
              </Grid>
              <Grid item xs>
                <TextField
                  name="phone"
                  type="tel"
                  label="Phone"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.phone}
                  helperText={errors.phone && 'phone must be valid'}
                />
              </Grid>
            </Grid>
            <Divider className={classes.optionalDivider} />
            <Typography variant="h6" gutterBottom>
              Please click or tap on your location
            </Typography>
            <Typography gutterBottom>
              A rough location is needed to allow us to efficiently and quickly
              find a match. You can either click on the &quot;Detect
              Location&quot; button below the map or click on the map to specify
              the location.
            </Typography>
            <Card>
              <ClickableMap
                onLocationChange={setUserLocationInfo}
                locationInfo={userLocationInfo}
              />
            </Card>
            <Divider className={classes.optionalDivider} />
            <Typography variant="h6" gutterBottom>
              Optional &ndash; Address
            </Typography>
            <Grid container>
              <Grid item sm={12}>
                <TextField
                  name="address1"
                  label="Street 1"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.address1}
                  helperText={errors.address1 && 'address1 must be valid'}
                />
              </Grid>
              <Grid item sm={12}>
                <TextField
                  name="address2"
                  label="Street 2"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.address2}
                  helperText={errors.address2 && 'Address 2 must be valid'}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  name="city"
                  label="City"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.city}
                  helperText={errors.city && 'City must be valid'}
                />
              </Grid>
              <Grid item xs>
                <TextField
                  name="state"
                  label="State"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.state}
                  helperText={errors.state && 'State must be valid'}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="zipcode"
                  label="Zip"
                  variant="outlined"
                  margin="normal"
                  fullWidth
                  inputRef={register}
                  error={!!errors.zipcode}
                  helperText={errors.zipcode && 'State must be valid'}
                />
              </Grid>
            </Grid>

            <Typography className={classes.warrantyInfo}>
              Note: This website and all related work products are provided
              &quot;AS IS&quot;. The provider of this service makes no other
              warranties, express or implied, and hereby disclaims all implied
              warranties, including any warranty of merchantability and warranty
              of fitness for a particular purpose.
            </Typography>
            {dirty && errors && !!Object.keys(errors).length && !isValid && (
              <Typography variant="body2" className={classes.errorText}>
                Please fix the errors above.
              </Typography>
            )}
            <div className={classes.buttons}>
              <Button type="submit" variant="contained" color="primary">
                Sign Up!
              </Button>
            </div>
          </Container>
        </form>
      </Paper>
    </Container>
  );
}

export default NewUser;
