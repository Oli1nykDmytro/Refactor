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

  import messageFragment from './messageFragment'


  const normalizedNotifications: EventNotificationInput[] = [];
  const [sharedDataAccess, setSharedDataAccess] = useState<
  GetSharedAccessQuery | undefined | null
>(null);


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

useEffect(() => {
  if (message?.tags?.length) {
    getNotificationSettings({ variables: { tagId: message.tags[0].id } });
  }
}, [message, getNotificationSettings]);


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