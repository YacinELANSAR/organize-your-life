import React, { useState } from 'react';
import ReactCalendar from 'react-calendar';
import { Paper, Box, TextField, Button, List, ListItem, ListItemText, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function CalendarComponent() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState({});
  const [newEvent, setNewEvent] = useState('');

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const addEvent = () => {
    if (!newEvent.trim()) return;
    
    const dateStr = selectedDate.toDateString();
    setEvents(prev => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] || []), newEvent]
    }));
    setNewEvent('');
  };

  const removeEvent = (dateStr, index) => {
    setEvents(prev => ({
      ...prev,
      [dateStr]: prev[dateStr].filter((_, i) => i !== index)
    }));
  };

  const dateStr = selectedDate.toDateString();
  const currentEvents = events[dateStr] || [];

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <ReactCalendar
          onChange={handleDateChange}
          value={selectedDate}
          className="react-calendar"
        />
      </Paper>
      
      <Paper elevation={3} sx={{ p: 2, flex: 1, minWidth: 300 }}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Nouvel événement"
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addEvent()}
          />
          <Button
            variant="contained"
            onClick={addEvent}
            sx={{ mt: 1 }}
            fullWidth
          >
            Ajouter un événement
          </Button>
        </Box>

        <List>
          {currentEvents.map((event, index) => (
            <ListItem
              key={index}
              secondaryAction={
                <IconButton edge="end" onClick={() => removeEvent(dateStr, index)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={event} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}

export default CalendarComponent;
