import React from 'react';
import { Link } from 'react-router-dom';
import {
  makeStyles,
  Typography,
  Container,
  Grid,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@material-ui/core';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useFirestore, useFirestoreDocData, useUser } from 'reactfire';
import styles from './HomePage.styles';

const useStyles = makeStyles(styles);

function Homepage() {
  const classes = useStyles();
  const user = useUser();
  const firestore = useFirestore();
  const unfulfilledNeedsRef = firestore
    .collection('aggregates')
    .doc('unfulfilledNeedsInfo');
  const unfulfilledNeedsInfo = useFirestoreDocData(unfulfilledNeedsRef);

  return (
    <>
      <Helmet>
        <title>Welcome</title>
      </Helmet>
      <Container className={classes.header} maxWidth={false} disableGutters>
        <Container maxWidth="md" className={classes.introContainer}>
          <Paper className={classes.introText} elevation={5}>
            <Typography
              variant="h5"
              align="center"
              // color="textPrimary"
              gutterBottom>
              Welcome to the Volunteer Coronavirus Assistance System
            </Typography>

            <Typography
              id="content-homepage"
              variant="subtitle1"
              align="center">
              The spread of COVID19 is having a huge impact on our lives,
              especially older adults and people of any age who have serious
              underlying medical conditions might be at higher risk for severe
              illness from COVID-19 (
              <a
                href="https://www.cdc.gov/coronavirus/2019-ncov/specific-groups/people-at-higher-risk.html"
                target="_blank"
                rel="noopener noreferrer">
                &quot;at-risk population&quot;
              </a>
              ). It is more important now than ever for us to come together and
              support our communities, whether it be material support or
              emotional support. Our goal is to connect those in such high-risk
              population with those that are able to help.
            </Typography>
          </Paper>
        </Container>
      </Container>

      <Container className={classes.sectionContainer}>
        <Grid container spacing={2}>
          <Grid item className={classes.sectionContent} xs={12} md={6}>
            <Typography variant="h6">Request Assistance</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                We provide free services for the most at-risk community members.
                Request grocery delivery, prescription pick-up, or a phone call
                for emotional support. There is no charge for the delivery.
              </Typography>
              <div className={classes.actionButtons}>
                {/* <Button
                  component={Link}
                  to="/request?type=grocery-pickup"
                  variant="contained"
                  color="primary">
                  {activeCategoryMap['grocery-pickup'].shortDescription}
                </Button>
                <Button
                  component={Link}
                  to="/request?type=emotional-support"
                  variant="outlined"
                  color="primary">
                  {activeCategoryMap['emotional-support'].shortDescription}
                </Button>
                <Button
                  component={Link}
                  to="/request?type=other"
                  variant="outlined"
                  color="primary">
                  {activeCategoryMap.other.shortDescription}
                </Button> */}
              </div>
            </Paper>
          </Grid>
          <Grid item className={classes.sectionContent} xs={12} md={6}>
            <Typography variant="h6">Volunteer</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                At-risk community members need us now more than ever. Sign up to
                see available requests (like picking up grocery) near you and
                see how you can help keep our communities healthy during this
                pandemic!
              </Typography>

              <div className={classes.actionButtons}>
                <Button
                  component={Link}
                  to="/search"
                  variant="contained"
                  color="primary">
                  {user ? 'View Requests for Assistance' : 'Sign Up'}
                </Button>
              </div>

              <Divider className={classes.divider} />

              {unfulfilledNeedsInfo.count === 0 ? (
                <p>All needs have been fulfilled.</p>
              ) : (
                <>
                  <Typography variant="body2" gutterBottom>
                    Below are a few of the currently open requests. Note that
                    these are not restricted to any specific geographic location
                    yet. If you are in the request area or know of someone in
                    the request area, please help spread the word and refer them
                    to this site.
                  </Typography>

                  <TransitionGroup component={List}>
                    {/* <List> */}
                    {unfulfilledNeedsInfo.needs.map((item) => (
                      <CSSTransition
                        key={item.id}
                        className="Test"
                        unmountOnExit
                        timeout={1000}
                        classNames={{
                          enter: classes.listTransitionEnter,
                          enterActive: classes.listTransitionEnterActive,
                          exit: classes.listTransitionExit,
                          exitActive: classes.listTransitionExitActive,
                        }}>
                        <ListItem
                          button
                          divider
                          dense
                          key={item.id}
                          component={Link}
                          to={`/needs/${item.id}`}>
                          <ListItemText
                            primary={format(item.createdAt.toDate(), 'PPpp')}
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="textPrimary">
                                  {item.immediacy === '10' && (
                                    <>Urgent &ndash; </>
                                  )}
                                  {item.firstName}
                                </Typography>
                                :{' '}
                                {/* {item.needs
                                  .map(
                                    (title) =>
                                      allCategoryMap[title].shortDescription,
                                  )
                                  .join(', ')} */}
                                <br />
                                {item.location}
                              </>
                            }
                          />
                        </ListItem>
                      </CSSTransition>
                    ))}
                    {/* </List> */}
                  </TransitionGroup>
                </>
              )}
            </Paper>
          </Grid>

          <Grid item md={12}>
            <Typography variant="h6">Press Coverage</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                Our vision is to help communities across the US. Thanks to our
                volunteers, we are starting to get local media coverage. We
                intend to leverage these opportunities to spread the word,
                especially to our target at-health-risk population.
              </Typography>
              <ul>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://madison365.com/local-entrepreneur-develops-volunteer-coronavirus-assistance-system-to-connect-those-in-need-with-volunteers/">
                    Madison 365: Local entrepreneur develops Volunteer
                    Coronavirus Assistance System to connect those in need with
                    volunteers
                  </a>
                </li>
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://wkow.com/2020/04/05/local-developers-create-website-to-link-volunteers-with-people-in-need-of-help/">
                    WKOW: Local developers create website to link volunteers
                    with people in need of help
                  </a>
                </li>
              </ul>
              <Typography variant="body2" gutterBottom>
                Please <Link to="/contact">contact us</Link> if you represent a
                press organization or are connected to one who would be open to
                covering this initiative.
              </Typography>
            </Paper>
          </Grid>

          {/* <Grid item className={classes.sectionContent} xs={12} md={12}>
            <Typography variant="h6">Quick Info</Typography>
            <Grid container spacing={1}>

              <Grid item md={3} xs={12}>
                <Paper className={classes.statBox}>
                  <Typography variant="h6">Stats</Typography>
                  <Divider light />
                  <Box display={"flex"}>
                    <Box p={1} flex={"auto"}>
                      <Typography variant="overline">Volunteers</Typography>
                      <Typography variant="h6">xxx</Typography>
                    </Box>
                    <Box p={1} flex={"auto"}>
                      <Typography variant="overline">Requests</Typography>
                      <Typography variant="h6">xx</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Grid> */}

          <Grid item md={12}>
            <Typography variant="h6">Note About Financial Need</Typography>
            <Paper className={classes.sectionContentPaper}>
              <Typography variant="body2" gutterBottom>
                This service is for anyone that falls in the at-risk category,
                regardless of if they can afford groceries or not. If someone
                needs help covering the cost of the items, please let us know in
                the request, and we will do our best to help.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Homepage;
