import React, { useReducer, useEffect, useState } from "react";
import {
  Button,
  FormControlLabel,
  Grid,
  Switch,
  TextField as TextFieldMaterial,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Box,
  InputAdornment,
} from "@material-ui/core";


import DateFnsUtils from "@date-io/date-fns";
import { PdfPreview } from "./";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { red, blue } from "@material-ui/core/colors";

import { ReactComponent as ErrorOutlineIcon } from "../icons/errorOutline.svg";
import { ReactComponent as FileIcon } from "../icons/fileIcon.svg";
import {reducer, initialEventForm} from '../../reducer/reducer'

import {
  File,
  User,
  Calendar,
  GetSharedAccessQuery,
} from "../graphql/generated";


import TextField from "./TextField";
import ChipsInput from "./ChipsInput";
import { ReactComponent as DropdownIcon } from "../icons/dropdownRegular.svg";
import NumberFormatTime from "../common/NumberFormatTime";
import { Link } from "react-router-dom";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import useStyles from "./src/style/type-style";





export const Form = (): React.FC => {
  const [allDay, setAllDay] = useState<boolean>(false);
  const [allDayBufferStartTime, setAllDayBufferStartTime] = useState("00:00");
  const [allDayBufferEndTime, setAllDayBufferEndTime] = useState("23:59");
  const [calendarChips, setCalendarChips] = useState<string[]>([]);
  const [sharedDataAccess, setSharedDataAccess] = useState<
    GetSharedAccessQuery | undefined | null
  >(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = React.useState(0);
  const [eventForm, dispatch] = useReducer(reducer, initialEventForm);
  const link = createLink(
    currentUser.email,
    messageId,
    isMessageDone,
    isMessageDeleted
  );

  const classes = useStyles();

  useEffect(() => {
    const chipSharedAccessValues: string[] = sharedDataAccess?.sharedAccess
      ?.targetUsers
      ? sharedDataAccess.sharedAccess.targetUsers.map(
          (user: User) => `${user?.name}'s Calendar`
        )
      : [];

    let userCalendars: string[] = [];
    if (currentUser) {
      userCalendars =
        currentUser.eventCalendars.map(
          (calendar: Calendar) => `${calendar.name}`
        ) || [];
    }

    const chipValues = [...chipSharedAccessValues, ...userCalendars];
    if (event?.nylasCalendarName) {
      chipValues.unshift(event.nylasCalendarName);
    }
    setCalendarChips(chipValues);
  }, [event, sharedDataAccess, currentUser]);

  const hasGraphQlConflictError = () => {
    if (createError?.graphQLErrors && createError?.graphQLErrors.length > 0) {
      const error = createError.graphQLErrors[0] as any;
      if (error.code === "has_conflict") {
        return true;
      }
    }

    if (updateError?.graphQLErrors && updateError?.graphQLErrors.length > 0) {
      const error = updateError.graphQLErrors[0] as any;
      if (error.code === "has_conflict") {
        return true;
      }
    }

    return false;
  };


  const normaliseEventForm = (): UpdateEventInput => {
    const startTime = moment(
      `${eventForm.startDate} ${eventForm.startTime}`,
      "l HH:mm",
    ).format();

    const endTime = moment(
      `${eventForm.endDate} ${eventForm.endTime}`,
      "l HH:mm",
    ).format();

    let startTimeUTC = startTime;
    let endTimeUTC = endTime;
    // Converting dates to UTC for all day,
    // because nylas shows wrong date range with local time
    if (allDay) {
      startTimeUTC = moment(startTime).utcOffset(0, true).format();
      endTimeUTC = moment(endTime).utcOffset(0, true).format();
    }


  const handleFormSave = async (eventDom: React.FormEvent<HTMLFormElement>) => {
    eventDom.preventDefault();

const convertTimeStringToNumber = (timeString: string) =>
    timeString.split(":").join("");

 const handleChipClick = (attachmentIndex: number) => {
    setCurrentAttachmentIndex(attachmentIndex);
    setPreviewOpen(true);
  };

    const {
      title,
      startTime,
      endTime,
      location,
      description,
      notifications,
      attachmentIds,
    } = normaliseEventForm();

    if (event) {
      await updateEventMutation({
        variables: {
          eventId: event.id,
          title,
          startTime,
          endTime,
          location,
          description,
          allDay,
          notifications,
          attachmentIds,
        },
      }).catch((err) => console.log(`Event update error: ${err}`));
    } else if (message) {
      try {
        // TODO: Fix the types. In rush atm to demo this
        const newEvent: any = await createEventMutation({
          variables: {
            messageId: message.id,
            title,
            startTime,
            endTime,
            location,
            description,
            allDay,
            notifications,
            attachmentIds,
          },
        });
        const data = newEvent.data;

        const hasConflict = hasGraphQlConflictError();
        if (hasConflict) {
          return;
        }

        if (data?.createEvent && onCreateEventFromMessageItem) {
          onCreateEventFromMessageItem(data.createEvent.id, data?.createEvent);
        }
        if (data?.createEvent && onEventCreation) {
          await onEventCreation(data.createEvent.id, data?.createEvent);
        }
      } catch (error) {
        console.log(`Event update error: ${error}`);
      }
    } else {
      return;
    }
    if (!createError && !updateError) {
      if (refetchEvents) {
        refetchEvents();
      }
      if (onDialogClose) {
        onDialogClose();
      }
    }
  };

  useEffect(() => {
    setSharedDataAccess(sharedData);
  }, [sharedData]);

  useEffect(() => {
    dispatch({
      field: "reset",
    });
  }, [event, notifications, sharingUsers]);


  const handleStartDateChange = (date: any) => {
    if (!date) return;
    const isAfter = moment(moment(date).format("l")).isAfter(eventForm.endDate);

    if (allDay && isAfter) {
      dispatch({
        field: "endDate",
        value: moment(date).format("l"),
      });
    }
    dispatch({
      field: "startDate",
      value: moment(date).format("l"),
    });
  };



  
  const handleAllDay = () => {
    if (allDay) {
      setAllDay(false);
      dispatch({
        field: "startTime",
        value: allDayBufferStartTime,
      });
      dispatch({
        field: "endTime",
        value: allDayBufferEndTime,
      });
    } else {
      const isAfter = moment(moment(eventForm.startDate).format("l")).isAfter(
        eventForm.endDate
      );

      if (isAfter) {
        dispatch({
          field: "endDate",
          value: eventForm.startDate,
        });
      }

      setAllDay(true);
      setAllDayBufferStartTime(eventForm.startTime);
      setAllDayBufferEndTime(eventForm.endTime);

      dispatch({
        field: "startTime",
        value: "00:00",
      });
      dispatch({
        field: "endTime",
        value: "23:59",
      });
    }
  };
  return (
    <>
      <form onSubmit={handleFormSave}>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <Grid
            className={classes.headerPart}
            container
            spacing={2}
            alignItems="center"
          >
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
                  <DatePicker
                    autoOk
                    className={classes.dateInput}
                    disableToolbar
                    disablePast={event ? false : true}
                    variant="inline"
                    format="M/d/yyyy"
                    value={eventForm.startDate}
                    inputVariant="outlined"
                    onChange={handleStartDateChange}
                    TextFieldComponent={(props) => (
                      <TextField
                        {...props}
                        size="small"
                        variant="outlined"
                        label="Start Date"
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
              <div className={`${classes.dateCol} ${classes.paddingBottom}`}>
                To
              </div>
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
          </Grid>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={9}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label="Calendar"
                value={calendarChips}
              />
            </Grid>
            <Grid
              item
              container
              xs={3}
              alignItems="center"
              className={hasGraphQlConflictError() ? classes.conflictError : ""}
            >
              <Box display="flex" mt={4}>
                <ErrorOutlineIcon className={classes.icon} />
                &nbsp;
                {event?.conflict || hasGraphQlConflictError() ? (
                  <>Has conflict.</>
                ) : (
                  <>No Conflict</>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label="Address"
                value={eventForm.location}
                onChange={(e: React.FormEvent<HTMLFormElement>) =>
                  dispatch({
                    field: "location",
                    value: e.currentTarget.value,
                  })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={6}>
                  <Link className={classes.linkStyles} to={link}>
                    <TextField
                      onClick={() => setOpen(false)}
                      fullWidth
                      size="small"
                      variant="outlined"
                      label="Mail"
                      InputProps={{
                        className: classes.multilineColor,
                      }}
                      value={
                        messageTitle ||
                        message?.caseStyle ||
                        message?.subject ||
                        event?.message?.caseStyle ||
                        ""
                      }
                    />
                  </Link>
                </Grid>
                <Grid item xs={6}>
                  <ChipsInput
                    value={
                      event?.message?.tags?.map((tag) => tag.name) ||
                      message?.tags.map((tag) => tag.name) ||
                      []
                    }
                    label="Category:"
                    isLineType
                    borderType="square"
                    withBorder
                  />
                </Grid>
              </Grid>
            </Grid>
            {eventForm.notifications.map(
              (notify: NotificationItem, index: number) => (
                <>
                  <Grid item xs={4}>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <Select
                        value={notify.userId}
                        onChange={(e) =>
                          dispatch({
                            field: `notification:${index}:userId`,
                            value: e.target.value as string,
                          })
                        }
                      >
                        <MenuItem value="none">
                          <em>None</em>
                        </MenuItem>
                        {sharingUsers.map((item) => (
                          <MenuItem value={item.id} key={item.id}>
                            <em>{`${item.name} (Notification)`}</em>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2}>
                    <TextFieldMaterial
                      fullWidth
                      value={notify.period}
                      type="number"
                      size="small"
                      variant="outlined"
                      onChange={(e) =>
                        dispatch({
                          field: `notification:${index}:period`,
                          value: e.target.value as string,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <Select
                        value={notify.periodType}
                        onChange={(e) =>
                          dispatch({
                            field: `notification:${index}:periodType`,
                            value: e.target.value as string,
                          })
                        }
                      >
                        {periodTypes.map((periodType) => (
                          <MenuItem key={periodType} value={periodType}>
                            {`${periodType}${
                              notify.period === "1" ? "" : "s"
                            } Before`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() => {
                        dispatch({
                          field: `notification:${index}:remove`,
                        });
                      }}
                    >
                      <CloseOutlinedIcon className={classes.closeIcon} />
                    </IconButton>
                  </Grid>
                </>
              )
            )}
            <Grid item xs={12}>
              <Button
                className={classes.addReminder}
                onClick={() => {
                  dispatch({
                    field: `notification:0:add`,
                  });
                }}
                disableRipple
              >
                Add Reminder
              </Button>
            </Grid>
            {files ? (
              <>
                <Grid item xs={12}>
                  <ChipsInput
                    isLineType
                    type="files"
                    label="Attached File:"
                    borderType="square"
                    onClick={handleChipClick}
                    value={
                      files.map((attachment) => attachment?.name || "") || []
                    }
                    icon={<FileIcon width={13} height={13} />}
                    onDeleteChip={(index) =>
                      setFiles([
                        ...files.slice(0, index),
                        ...files.slice(index + 1),
                      ])
                    }
                  />
                  {files ? (
                    <PdfPreview
                      open={previewOpen}
                      setOpen={setPreviewOpen}
                      files={files as File[]}
                      selectedFileIndex={currentAttachmentIndex}
                      setFileIndex={setCurrentAttachmentIndex}
                    />
                  ) : null}
                </Grid>
              </>
            ) : null}
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                variant="outlined"
                label="Note"
                multiline
                rows={5}
                value={eventForm.description}
                onChange={(e: React.FormEvent<HTMLFormElement>) =>
                  dispatch({
                    field: "description",
                    value: e.currentTarget.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
        <Grid
          className={classes.actions}
          container
          alignItems="center"
          justify="space-between"
        >
          <Grid item className={classes.lastUpdated}>
            {"Event update time goes here"}
          </Grid>
          <Grid item>
            <Button
              className={classes.deleteButton}
              onClick={() => setIsOpenModalConfirm(true)}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              type="submit"
              disabled={updateLoading || createLoading}
            >
              {updateLoading ? <CircularProgress size={25} /> : "Save"}
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
};
