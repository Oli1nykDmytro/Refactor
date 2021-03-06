import React, { useReducer, useState } from "react";
import "date-fns";
import moment from "moment";
import format from "date-fns/format";
import isValid from "date-fns/isValid";
import differenceInMinutes from "date-fns/differenceInMinutes";
import addMinutes from "date-fns/addMinutes";
import differenceInDays from "date-fns/differenceInDays";
import addDays from "date-fns/addDays";
import parse from "date-fns/parse";

const now = moment();
const oneHourFuture = moment(now).add(1, "hours");
const nowDateEndDate =
  Number(moment(now).format("HH")) >= 23 ? moment(now).add(1, "day") : now;
const [isOpenModalConfirm, setIsOpenModalConfirm] = useState<boolean>(false);
const [notifications, setNotifications] = useState<object[]>([]);
const [sharingUsers, setSharingUsers] = useState<User[]>([]);
const [files, setFiles] = useState<File[]>([]);

interface EventForm {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  notifications: NotificationItem[];
}

export const initialEventForm: any = {
  ...message?.eventPreview,
  ...message?.eventInfo,
  ...event,
  startDate: moment(
    event?.startTime || message?.eventInfo?.startTime || now
  ).format("l"),
  startTime: moment(
    event?.startTime || message?.eventInfo?.startTime || now
  ).format("HH:mm"),
  endTime: moment(
    event?.endTime || message?.eventInfo?.endTime || oneHourFuture
  ).format("HH:mm"),
  endDate: moment(
    event?.endTime || message?.eventInfo?.startTime || nowDateEndDate
  ).format("l"),
  notifications: notifications,
};

export const reducer = (
  // TODO: Fix the types. In rush atm to demo this.
  state: any,
  { field, value }: { field: string; value?: string }
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
          (el: NotificationItem, i: number) => i !== Number(index)
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
        new Date(event?.startTime || now)
      );

      const parsedDate = parse(value, "HH:mm", new Date());
      const endTime = addMinutes(parsedDate, timeDif);
      return {
        ...state,
        startTime: isValid(parsedDate)
          ? format(parsedDate, "HH:mm")
          : state.startTime,
        endTime: isValid(parsedDate) ? format(endTime, "HH:mm") : state.endTime,
      };
    }
    return { ...state, [field]: value };
  }
  if (field === "startDate") {
    if (value) {
      const timeDif = differenceInDays(
        new Date(event?.endTime || oneHourFuture),
        new Date(event?.startTime || now)
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
