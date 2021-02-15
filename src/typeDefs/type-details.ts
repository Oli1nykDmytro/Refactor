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

type NotificationItem = {
  userId: string;
  period: string;
  periodType: PeriodType;
};
