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



  const [sharedDataAccess, setSharedDataAccess] = useState<
  GetSharedAccessQuery | undefined | null
>(null);