

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