import React, { useReducer, useEffect, useState } from "react";

import { Dialog, DialogTitle, DialogContent, Grid } from "@material-ui/core";
import {
  EventDetailsProps,
  NotificationItem,
} from "./src/typeDefs/type-details";

//component
import FormComponent from "./src/component/Form";
import SnackbarComponents from "./src/component/Snackbar";
import { reducer, initialEventForm } from "./src/redux/reducer";
import { createEventMutation } from "./src/grapgql/graphq";
//style
import useStyles from "./src/style/type-style";

// periodTime
import { periodTypes, periodRate } from "./src/timePeriod/period";

import convertMStoTimeLeft from "../common/convertMSToTimeLeft";

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

  const [eventForm, dispatch] = useReducer(reducer, initialEventForm);

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

  eventForm.notifications.forEach((item: NotificationItem) => {
    if (item?.period && Number(item?.period) > 0 && item.userId !== "none") {
      normalizedNotifications.push({
        userId: item.userId,
        notifyBefore: Number(item.period) * periodRate[item.periodType],
      });
    }
  });

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

  // 16:00 => 1600 for number mask

  const handleClose = () => setIsOpenModalConfirm(false);

  return (
    <>
      <SnackbarComponents />
      <Dialog
        classes={{
          paper: classes.modal,
        }}
        open={open}
        onClose={handleDialogClose}
      >
        <DialogTitle className={classes.modalTitle}>
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
        </DialogTitle>
        <DialogContent>
          <FormComponent />
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
