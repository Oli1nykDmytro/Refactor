import MuiAlert from "@material-ui/lab/Alert";


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
)