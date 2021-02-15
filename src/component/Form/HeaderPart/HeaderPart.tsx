import React from "react";

<Grid className={classes.headerPart} container spacing={2} alignItems="center">
  <Grid item xs={12}>
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      label="Title"
      value={eventForm.title}
      onChange={(e: React.FormEvent<HTMLFormElement>) =>
        dispatch({
          field: "title",
          value: e.currentTarget.value,
        })
      }
    />
  </Grid>
  <div className={classes.dateRow}>
    <div className={classes.dateCol}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DateInput />
      </MuiPickersUtilsProvider>
    </div>
    <div className={classes.dateCol}>
      <TextField
        className={classes.timeInput}
        required
        size="small"
        label="Start Time"
        variant="outlined"
        value={convertTimeStringToNumber(eventForm.startTime)}
        InputProps={{
          inputComponent: NumberFormatTime as any,
        }}
        onChange={(e: any) =>
          dispatch({
            field: "startTime",
            value: e.target.value,
          })
        }
      />
    </div>
    <div className={`${classes.dateCol} ${classes.paddingBottom}`}>To</div>
    <div className={classes.dateCol}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <DatePicker
          autoOk
          className={classes.dateInput}
          disablePast={event ? false : true}
          disableToolbar
          variant="inline"
          format="M/d/yyyy"
          value={eventForm.endDate}
          inputVariant="outlined"
          onChange={(date) => {
            if (!date) return;
            dispatch({
              field: "endDate",
              value: moment(date).format("l"),
            });
          }}
          TextFieldComponent={(props) => (
            <TextField
              {...props}
              size="small"
              variant="outlined"
              label="End Date"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <DropdownIcon />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
      </MuiPickersUtilsProvider>
    </div>
    <div className={classes.dateCol}>
      <TextField
        className={classes.timeInput}
        required
        size="small"
        label="End Time"
        variant="outlined"
        value={convertTimeStringToNumber(eventForm.endTime)}
        InputProps={{
          inputComponent: NumberFormatTime as any,
        }}
        onChange={(e: any) =>
          dispatch({
            field: "endTime",
            value: e.target.value,
          })
        }
      />
    </div>
    <div className={`${classes.dateCol} ${classes.paddingBottom}`}>
      <FormControlLabel
        control={
          <Switch
            classes={{
              root: classes.switchRoot,
              switchBase: classes.switchBase,
              thumb: classes.switchThumb,
              track: classes.switchTrack,
            }}
            checked={allDay}
            color="primary"
            onClick={handleAllDay}
          />
        }
        label="All Day"
      />
    </div>
  </div>
</Grid>;
