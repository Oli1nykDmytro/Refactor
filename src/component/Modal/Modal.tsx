import React from "react";
import { Grid, IconButton } from "@material-ui/core";
import { CloseOutlined as CloseOutlinedIcon } from "@material-ui/icons";

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
