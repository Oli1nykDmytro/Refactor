import React from 'react'
import { MuiPickersUtilsProvider, DatePicker } from "@material-ui/pickers";

export const DatePickerComponent =():Reac.FC =>{  
return (
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
                    )
                    }