import React, { useReducer, useEffect, useState } from "react";

import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Grid,
  Switch,
  TextField as TextFieldMaterial,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Snackbar,
  Box,
  InputAdornment,
} from "@material-ui/core";


import { CloseOutlined as CloseOutlinedIcon } from "@material-ui/icons";

import { PdfPreview } from "./";
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";
import { red, blue } from "@material-ui/core/colors";

import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import moment from "moment";
import format from "date-fns/format";
import isValid from "date-fns/isValid";
import differenceInMinutes from "date-fns/differenceInMinutes";
import addMinutes from "date-fns/addMinutes";
import differenceInDays from "date-fns/differenceInDays";
import addDays from "date-fns/addDays";
import parse from "date-fns/parse";
import { ReactComponent as ErrorOutlineIcon } from "../icons/errorOutline.svg";
import { ReactComponent as FileIcon } from "../icons/fileIcon.svg";


import {EventDetailsProps, NotificationItem} from './src/typeDefs/type-details'


//component 
import FormComponent from './src/component/Form'
//style 
import useStyles from './src/style/type-style'

// periodTime 
import { periodTypes, periodRate } from './src/timePeriod/period'
import {
  File,
  Event,
  UpdateEventInput,
  useUpdateEventMutation,
  useCreateEventMutation,
  useDeleteEventMutation,
  Maybe,
  Message,
  useGetSharedAccessQuery,
  User,
  Calendar,
  EventDocument,
  useGetNotificationSettingsByTagLazyQuery,
  EventNotificationInput,
  GetSharedAccessQuery,
} from "../graphql/generated";

import convertMStoTimeLeft from "../common/convertMSToTimeLeft";
import { gql } from "@apollo/client";

import TextField from "./TextField";
import ChipsInput from "./ChipsInput";
import { ReactComponent as DropdownIcon } from "../icons/dropdownRegular.svg";
import NumberFormatTime from "../common/NumberFormatTime";
import { Link } from "react-router-dom";
// import EventDeleteModal from "./EventDeleteModal";


interface EventForm {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  notifications: NotificationItem[];
}

type ActionType = "userId" | "periodType" | "period";
type PeriodType = "Minute" | "Hour" | "Day" | "Week";

type EventDetailsProps = {
    event?: Event;
    open: boolean;
    setOpen: (open: boolean) => void;
    onDialogClose?: () => void;
    refetchEvents?: () => void;
    message?: Maybe<Message>;
    onEventCreation?: (eventId: string, event: Event) => void;
    onCreateEventFromMessageItem?: (eventId: string, event: Event) => void;
    currentUser: User;
    onEventDelition?: () => void;
    messageId?: string;
    messageTitle?: string | null | undefined;
    isMessageDone?: boolean | null | undefined;
    isMessageDeleted?: boolean | null | undefined;
  };





export const createLink = (
  userEmail: string,
  messageId: string | null | undefined,
  isDone: boolean | null | undefined,
  isDeleted: boolean | null | undefined,
): string => {
  if (isDone) {
    return `/messages/done/${messageId}`;
  } else if (isDeleted) {
    return `/messages/deleted/${messageId}`;
  } else {
    return `/inbox/${userEmail}/${messageId}`;
  }
};

const messageFragment = gql`
  fragment MyMessage on Message {
    id
    event {
      id #id should be for correct render
    }
  }
`;

const EventDetails = ({
  event,
  open,
  setOpen,
  onDialogClose,
  refetchEvents,
  message,
  onEventCreation,
  onEventDelition,
  onCreateEventFromMessageItem,
  currentUser,
  messageId,
  messageTitle,
  isMessageDone,
  isMessageDeleted,
}: EventDetailsProps) => {
  const {
    data: sharedData,
    loading: sharedDataLoading,
  } = useGetSharedAccessQuery();

  const classes = useStyles();

  const [
    updateEventMutation,
    { data: updateEventData, loading: updateLoading, error: updateError },
  ] = useUpdateEventMutation();
  const [
    getNotificationSettings,
    { data: notificationSettingsData },
  ] = useGetNotificationSettingsByTagLazyQuery();

  const [deleteEventMutation] = useDeleteEventMutation({
    onCompleted: async () => {
      if (refetchEvents) {
        refetchEvents();
      }
      if (onEventDelition) {
        await onEventDelition();
      }
      setOpen(false);
    },
    update(cache, { data }) {
      const { deleteEvent } = data || {};
      if (deleteEvent && event) {
        cache.writeQuery({
          query: EventDocument,
          data: {
            event: null,
          },
          variables: { eventId: event.id },
        });
        cache.writeFragment({
          id: "Message:" + message?.id,
          fragment: messageFragment,
          data: {
            event: null,
          },
        });
      }
    },
  });

  const now = moment();
  const oneHourFuture = moment(now).add(1, "hours");
  const nowDateEndDate =
    Number(moment(now).format("HH")) >= 23 ? moment(now).add(1, "day") : now;
  // const [allDay, setAllDay] = useState<boolean>(false);
  const [isOpenModalConfirm, setIsOpenModalConfirm] = useState<boolean>(false);
  // const [allDayBufferStartTime, setAllDayBufferStartTime] = useState("00:00");
  // const [allDayBufferEndTime, setAllDayBufferEndTime] = useState("23:59");
  // const [calendarChips, setCalendarChips] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<object[]>([]);
  const [sharingUsers, setSharingUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  // const [sharedDataAccess, setSharedDataAccess] = useState<
  //   GetSharedAccessQuery | undefined | null
  // >(null);

  const initialEventForm: any = {
    ...message?.eventPreview,
    ...message?.eventInfo,
    ...event,
    startDate: moment(
      event?.startTime || message?.eventInfo?.startTime || now,
    ).format("l"),
    startTime: moment(
      event?.startTime || message?.eventInfo?.startTime || now,
    ).format("HH:mm"),
    endTime: moment(
      event?.endTime || message?.eventInfo?.endTime || oneHourFuture,
    ).format("HH:mm"),
    endDate: moment(
      event?.endTime || message?.eventInfo?.startTime || nowDateEndDate,
    ).format("l"),
    notifications: notifications,
  };

  const reducer = (
    // TODO: Fix the types. In rush atm to demo this.
    state: any,
    { field, value }: { field: string; value?: string },
  ) => {
    if (field === "reset") {
      return initialEventForm;
    }
    if (field.match(/notification*/)) {
      const [, index, action] = field.split(":");
      if (action === "add") {
        return {
          ...state,
          notifications: [
            ...state.notifications,
            { userId: "none", period: "1", periodType: "Hour" },
          ],
        };
      } else if (action === "remove") {
        return {
          ...state,
          notifications: state.notifications.filter(
            (el: NotificationItem, i: number) => i !== Number(index),
          ),
        };
      } else if (action === "periodType") {
        const updatedArray: NotificationItem[] = [...state.notifications];
        updatedArray[Number(index)].periodType = value as PeriodType;

        return {
          ...state,
          notifications: updatedArray,
        };
      } else if (action === "period") {
        const updatedArray: NotificationItem[] = [...state.notifications];
        if (typeof value === "string") {
          updatedArray[Number(index)].period = value;
        }

        return {
          ...state,
          notifications: updatedArray,
        };
      } else if (action === "userId") {
        const updatedArray: NotificationItem[] = [...state.notifications];
        if (typeof value === "string") {
          updatedArray[Number(index)].userId = value;
        }

        return {
          ...state,
          notifications: updatedArray,
        };
      }
    }
    if (field === "startTime") {
      if (value) {
        const timeDif = differenceInMinutes(
          new Date(event?.endTime || oneHourFuture),
          new Date(event?.startTime || now),
        );

        const parsedDate = parse(value, "HH:mm", new Date());
        const endTime = addMinutes(parsedDate, timeDif);
        return {
          ...state,
          startTime: isValid(parsedDate)
            ? format(parsedDate, "HH:mm")
            : state.startTime,
          endTime: isValid(parsedDate)
            ? format(endTime, "HH:mm")
            : state.endTime,
        };
      }
      return { ...state, [field]: value };
    }
    if (field === "startDate") {
      if (value) {
        const timeDif = differenceInDays(
          new Date(event?.endTime || oneHourFuture),
          new Date(event?.startTime || now),
        );

        const addDaysDate = addDays(new Date(value), timeDif);
        const endDate = format(addDaysDate, "M/d/Y");
        return {
          ...state,
          startDate: value,
          endDate,
        };
      }
      return { ...state, [field]: value };
    }

    return { ...state, [field]: value };
  };
  const [eventForm, dispatch] = useReducer(reducer, initialEventForm);

  useEffect(() => {
    setSharedDataAccess(sharedData);
  }, [sharedData]);

  useEffect(() => {
    dispatch({
      field: "reset",
    });
  }, [event, notifications, sharingUsers]);

  useEffect(() => {
    if (message?.tags?.length) {
      getNotificationSettings({ variables: { tagId: message.tags[0].id } });
    }
  }, [message, getNotificationSettings]);

  const [
    createEventMutation,
    { data: createEventData, loading: createLoading, error: createError },
  ] = useCreateEventMutation({
    update(cache, { data }) {
      const { createEvent } = data || {};
      if (createEvent) {
        cache.writeQuery({
          query: EventDocument,
          data: {
            event: createEvent,
          },
          variables: { eventId: createEvent.id },
        });
        cache.writeFragment({
          id: "Message:" + message?.id,
          fragment: messageFragment,
          data: {
            event: createEvent,
          },
        });
      }
    },
  });

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

    const normalizedNotifications: EventNotificationInput[] = [];

    eventForm.notifications.forEach((item: NotificationItem) => {
      if (item?.period && Number(item?.period) > 0 && item.userId !== "none") {
        normalizedNotifications.push({
          userId: item.userId,
          notifyBefore: Number(item.period) * periodRate[item.periodType],
        });
      }
    });

    return {
      title: eventForm.title,
      startTime: startTimeUTC,
      endTime: endTimeUTC,
      location: eventForm.location,
      description: eventForm.description,
      notifications: normalizedNotifications,
      attachmentIds: files.map((attach) => attach.id),
    };
  };


  const handleDeleteEvent = async () => {
    if ("id" in eventForm) {
      setIsOpenModalConfirm(false);
      await deleteEventMutation({
        variables: {
          eventId: eventForm.id,
        },
      });
    }
  };

  const [successMessageOpen, setSuccessMessageOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [currentAttachmentIndex, setCurrentAttachmentIndex] = React.useState(0);

  useEffect(() => {
    if (updateEventData && !updateError) {
      setSuccessMessageOpen(true);
      setOpen(false);
    }
  }, [updateEventData, updateError, setOpen]);

  useEffect(() => {
    const eventFiles = event?.attachments || message?.files || [];
    if (eventFiles) {
      setFiles(eventFiles as File[]);
    } else {
      setFiles([]);
    }
  }, [event, message]);

  useEffect(() => {
    if (createEventData && !createError) {
      setSuccessMessageOpen(true);
      setOpen(false);
    }
  }, [createEventData, createError, setOpen]);


  useEffect(() => {
    if (!sharedDataLoading && sharedData?.sharedAccess?.targetUsers) {
      let sharedUsers: User[] = [];

      if (sharedData?.sharedAccess?.targetUsers) {
        sharedUsers = [...sharedData?.sharedAccess?.targetUsers];
        const isInclude = sharedUsers.find(({ id }) => id === currentUser.id);
        if (!isInclude) {
          sharedUsers.unshift(currentUser);
        }
      }

      const initialNotificationPeriod: NotificationItem[] = [];

      const periodTypeMap = {
        weeks: "Week",
        days: "Day",
        hours: "Hour",
        minutes: "Minute",
      };

      if (!event) {
        if (
          notificationSettingsData?.notificationSettingsByTag?.items &&
          notificationSettingsData?.notificationSettingsByTag?.items?.length > 0
        ) {
          notificationSettingsData.notificationSettingsByTag.items.forEach(
            (item) => {
              const { type, value } = convertMStoTimeLeft(item.notifyBefore);
              const tsType = type as keyof typeof periodTypeMap;
              sharedUsers.forEach((sharedUser) => {
                initialNotificationPeriod.push({
                  userId: sharedUser.id,
                  periodType: periodTypeMap[tsType] as PeriodType,
                  period: value.toString(),
                });
              });
            },
          );
        } else {
          sharedUsers.forEach((sharedUser) => {
            initialNotificationPeriod.push({
              userId: sharedUser.id,
              periodType: periodTypeMap.minutes as PeriodType,
              period: "10",
            });
          });
        }
      } else if (event?.notifications && event?.notifications?.length > 0) {
        event.notifications.forEach((notififcation) => {
          const { type, value } = convertMStoTimeLeft(
            notififcation.notifyBefore,
          );
          const tsType = type as keyof typeof periodTypeMap;
          initialNotificationPeriod.push({
            userId: notififcation.userId,
            periodType: periodTypeMap[tsType] as PeriodType,
            period: value.toString(),
          });
        });
      }
      setNotifications(initialNotificationPeriod);
      setSharingUsers(sharedUsers);
    }
  }, [
    event,
    sharedDataLoading,
    notificationSettingsData,
    currentUser,
    sharedData,
  ]);

  const handleDialogClose = () => {
    setOpen(false);
    if (onDialogClose) {
      onDialogClose();
    }
  };

  const handleChipClick = (attachmentIndex: number) => {
    setCurrentAttachmentIndex(attachmentIndex);
    setPreviewOpen(true);
  };




  // 16:00 => 1600 for number mask
  const convertTimeStringToNumber = (timeString: string) =>
    timeString.split(":").join("");


  const handleClose = () => setIsOpenModalConfirm(false);

  return (
    <>
      {/* <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={successMessageOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessMessageOpen(false)}
      >
        <MuiAlert severity="success">Event has been saved</MuiAlert>
      </Snackbar> */}
      <Dialog
        classes={{
          paper: classes.modal,
        }}
        open={open}
        onClose={handleDialogClose}
      >
        {/* <DialogTitle className={classes.modalTitle}>
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
        </DialogTitle> */}
        <DialogContent>
          <FormComponent/>
        </DialogContent>
      </Dialog>
      <EventDeleteModal
        isOpenModalConfirm={isOpenModalConfirm}
        handleClose={handleClose}
        handleDeleteEvent={handleDeleteEvent}
      />
    </>
  );
};

export default EventDetails;