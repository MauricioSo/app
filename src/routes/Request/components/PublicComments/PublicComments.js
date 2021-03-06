import React, { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import {
  useFirestore,
  useFirestoreCollection,
  useUser,
  useFirestoreDoc,
} from 'reactfire';
import { Skeleton } from '@material-ui/lab';
import { useNotifications } from 'modules/notification';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  Avatar,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  TextField,
  Typography,
  makeStyles,
} from '@material-ui/core';
import {
  REQUESTS_COMMENTS_PUBLIC_COLLECTION,
  USERS_COLLECTION,
} from 'constants/collections';
import styles from './PublicComments.styles';

const useStyles = makeStyles(styles);

function CommentList({ requestId }) {
  const classes = useStyles();
  const firestore = useFirestore();

  const querySnapshot = useFirestoreCollection(
    firestore
      .collection(`${REQUESTS_COMMENTS_PUBLIC_COLLECTION}`)
      .where('requestId', '==', requestId)
      .orderBy('createdAt', 'asc'),
  );

  if (querySnapshot.empty) {
    return (
      <Box color="text.disabled">
        <Typography
          variant="body2"
          className={classes.noComments}
          data-test="no-comments">
          No public comments.
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {querySnapshot.docs.map(
        (docSnap) =>
          // When new comment is added locally, the createdAt can be the serverTimestamp() value.
          // So, we wait on rendering until any new snapshot has finished writing.
          !docSnap.metadata.hasPendingWrites && (
            <ListItem key={docSnap.id} divider alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{docSnap.get('author.firstName').slice(0, 1)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                disableTypography
                primary={
                  <Typography variant="subtitle2">
                    {docSnap.get('author.firstName')} &ndash;{' '}
                    <Typography
                      variant="body2"
                      display="inline"
                      color="textSecondary">
                      {format(docSnap.get('createdAt').toDate(), 'p - PPPP')}
                    </Typography>
                  </Typography>
                }
                secondary={docSnap
                  .get('content')
                  .split('\n')
                  .map((content, key) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Typography variant="body1" key={key} gutterBottom>
                      {content}
                    </Typography>
                  ))}
              />
            </ListItem>
          ),
      )}
    </List>
  );
}

CommentList.propTypes = {
  requestId: PropTypes.string.isRequired,
};

function CommentEntry({ requestId }) {
  const firestore = useFirestore();
  const user = useUser();
  const { FieldValue } = useFirestore;
  const { showSuccess, showError } = useNotifications();

  const { register, handleSubmit, errors, reset, isSubmitting } = useForm({
    nativeValidation: false,
  });
  const [showForm, setShowForm] = useState(false);

  const userProfile = useFirestoreDoc(
    firestore.doc(`${USERS_COLLECTION}/${user.uid}`),
  );

  if (userProfile.get('role') !== 'system-admin') {
    return (
      <Typography variant="body2">
        Only administrators are allowed to add public comments.
      </Typography>
    );
  }

  if (!showForm) {
    return <Button onClick={() => setShowForm(true)}>Add Comment</Button>;
  }

  async function onSubmit(values) {
    const comment = {
      requestId,
      createdBy: user.uid,
      createdAt: FieldValue.serverTimestamp(),
      author: {
        firstName: userProfile.get('firstName'),
        displayName: userProfile.get('displayName'),
      },
      contentType: 'text',
      content: values.comment,
    };
    try {
      await firestore
        .collection(REQUESTS_COMMENTS_PUBLIC_COLLECTION)
        .add(comment);
      reset();
      setShowForm(false);
      showSuccess('Comment added');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Comment add error', err);
      showError('Unexpected error, failed to add comment.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        name="comment"
        multiline
        label="Public Comment"
        variant="outlined"
        fullWidth
        margin="dense"
        error={!!errors.comment}
        helperText={errors.comment && 'Please enter a comment.'}
        inputRef={register({ required: true })}
      />
      <Button
        size="small"
        color="primary"
        variant="contained"
        type="submit"
        disabled={isSubmitting}>
        Add Comment
      </Button>
    </form>
  );
}

CommentEntry.propTypes = {
  requestId: PropTypes.string.isRequired,
};

function PublicComments({ requestId }) {
  const user = useUser();

  return (
    <>
      <Typography variant="h6">Public Comments</Typography>
      <Suspense
        fallback={
          <>
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </>
        }>
        <CommentList requestId={requestId} />
      </Suspense>
      {user && <CommentEntry requestId={requestId} />}
    </>
  );
}

PublicComments.propTypes = {
  requestId: PropTypes.string.isRequired,
};

export default PublicComments;
