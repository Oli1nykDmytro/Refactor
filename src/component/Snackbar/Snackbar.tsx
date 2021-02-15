import React, { useState } from "react";
import MuiAlert from "@material-ui/lab/Alert";
import { Snackbar } from "@material-ui/core";

export const SnackbarComponents = (): React.FC => {
  const [successMessageOpen, setSuccessMessageOpen] = useState(false);
  const [
    updateEventMutation,
    { data: updateEventData, loading: updateLoading, error: updateError },
  ] = useUpdateEventMutation();
  useEffect(() => {
    if (updateEventData && !updateError) {
      setSuccessMessageOpen(true);
      setOpen(false);
    }
  }, [updateEventData, updateError, setOpen]);
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
