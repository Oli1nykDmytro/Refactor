import React from "react";
import { Grid } from "@material-ui/core";

export const Modal = (): React.FC => {
  return (
    <>
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
    </>
  );
};
