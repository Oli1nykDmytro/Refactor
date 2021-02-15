import { DialogTitle, Grid, IconButton } from "@material-ui/core";

<DialogTitle className={classes.modalTitle}>
  <Grid container justify="space-between" alignItems="center">
    <Grid item>{message ? "Create new event" : "Event Details"}</Grid>
    <Grid item>
      <IconButton
        classes={{
          root: classes.iconButtonRoot,
        }}
        onClick={() => setOpen(false)}
      >
        <CloseOutlinedIcon />
      </IconButton>
    </Grid>
  </Grid>
</DialogTitle>;
