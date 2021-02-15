import React, { useReducer, useEffect, useState } from "react";
import {
  Button,

  Grid,

  CircularProgress,
  Box,
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import { PdfPreview } from "./";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { red, blue } from "@material-ui/core/colors";
import { ReactComponent as ErrorOutlineIcon } from "../icons/errorOutline.svg";
import { ReactComponent as FileIcon } from "../icons/fileIcon.svg";
import {reducer, initialEventForm} from '../../reducer/reducer'

import { CloseOutlined as CloseOutlinedIcon } from "@material-ui/icons";

import DateInput from './DateInput/input'

import HeaderPart from './HeaderPart/HeaderPart'
import {
  File,
  User,
  Calendar,
  GetSharedAccessQuery,
} from "../graphql/generated";
import TextField from "./TextField";
import { ReactComponent as DropdownIcon } from "../icons/dropdownRegular.svg";
import NumberFormatTime from "../common/NumberFormatTime";
import { Link } from "react-router-dom";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import useStyles from "./src/style/type-style";
import createLink from './link'

import EventFormNetificatyion from './Notification/index'



export const Form = (): React.FC => {
  const [allDay, setAllDay] = useState<boolean>(false);
  const [allDayBufferStartTime, setAllDayBufferStartTime] = useState("00:00");
  const [allDayBufferEndTime, setAllDayBufferEndTime] = useState("23:59");
  const [calendarChips, setCalendarChips] = useState<string[]>([]);
  const [sharedDataAccess, setSharedDataAccess] = useState<
    GetSharedAccessQuery | undefined | null
  >(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [files, setFiles] = useState<File[]>([]);
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


  useEffect(() => {
    const eventFiles = event?.attachments || message?.files || [];
    if (eventFiles) {
      setFiles(eventFiles as File[]);
    } else {
      setFiles([]);
    }
  }, [event, message]);


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

         <HeaderPart  />
         
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

            <EventFormNetificatyion/>

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

            <FilesComponent files={files}/>
            
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
