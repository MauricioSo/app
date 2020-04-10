/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
import React from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { useFirestore } from 'reactfire';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import { makeStyles } from '@material-ui/core/styles';
import { LIST_PATH } from 'constants/paths';
import styles from './ProjectTile.styles';

const useStyles = makeStyles(styles);

function ProjectTile({ name, projectId, showDelete }) {
  const classes = useStyles();
  const history = useHistory();
  const firestore = useFirestore();

  function goToProject() {
    return history.push(`${LIST_PATH}/${projectId}`);
  }

  function deleteProject() {
    return firestore
      .doc(`projects/${projectId}`)
      .delete()
      .catch((err) => {
        console.error('Error:', err); // eslint-disable-line no-console
        return Promise.reject(err);
      });
  }

  return (
    <Paper className={classes.root}>
      <div className={classes.top}>
        <span className={classes.name} onClick={goToProject}>
          {name || 'No Name'}
        </span>
        {showDelete ? (
          <Tooltip title="delete">
            <IconButton onClick={deleteProject}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>
    </Paper>
  );
}

ProjectTile.propTypes = {
  projectId: PropTypes.string.isRequired,
  showDelete: PropTypes.bool,
  name: PropTypes.string,
};

ProjectTile.defaultProps = {
  showDelete: true,
};

export default ProjectTile;
