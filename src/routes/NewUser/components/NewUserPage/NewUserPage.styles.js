export default (theme) => ({
  header: {
    marginBottom: theme.spacing(4),
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(3),
  },
  optionalDivider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  paper: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(1),
  },
  intro: {
    marginBottom: theme.spacing(2),
  },
  warrantyInfo: {
    marginTop: theme.spacing(3),
  },
});
