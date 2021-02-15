

import React, {useReducer} from 'react';
import {
    Grid,
    TextField as TextFieldMaterial,
    FormControl,
    Select,
    MenuItem,
    IconButton,
   
  } from "@material-ui/core";import {reducer, initialEventForm} from '../../../reducer/reducer'




export const Notification =({eventForm,normaliseEventForm}):React.FC =>{
const {
    title,
    startTime,
    endTime,
    location,
    description,
    notifications,
    attachmentIds,
  } = normaliseEventForm();

  eventForm.notifications.forEach((item: NotificationItem) => {
    if (item?.period && Number(item?.period) > 0 && item.userId !== "none") {
      normalizedNotifications.push({
        userId: item.userId,
        notifyBefore: Number(item.period) * periodRate[item.periodType],
      });
    }
  });
  const [eventForm, dispatch] = useReducer(reducer, initialEventForm);
return(
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
)}