import React, { useState } from "react";
import MuiAlert from "@material-ui/lab/Alert";
import { Snackbar } from "@material-ui/core";

export const SnackbarComponents = (): React.FC => {
  const [successMessageOpen, setSuccessMessageOpen] = useState(false);

  return (
    <>
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={successMessageOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessMessageOpen(false)}
      >
        <MuiAlert severity="success">Event has been saved</MuiAlert>
      </Snackbar>
    </>
  );
};
