import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Box,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControlLabel,
  Switch
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';

function WeeklyTasks() {
  const [schedule, setSchedule] = useState({});
  const [unavailableSlots, setUnavailableSlots] = useState({});
  const [open, setOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(getWeekDates(new Date()));
  const [newTask, setNewTask] = useState("");
  const [currentTasks, setCurrentTasks] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [periodDialogOpen, setPeriodDialogOpen] = useState(false);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('21:00');
  const [mergePeriodDialogOpen, setMergePeriodDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [mergedCells, setMergedCells] = useState({});
  const [disabledMergedCells, setDisabledMergedCells] = useState(new Set());

  // Fonction pour convertir l'heure en minutes depuis minuit
  const timeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Fonction pour convertir les minutes en format heure (HH:mm)
  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Fonction pour générer des périodes d'une heure
  const generateHourlyPeriods = (start, end) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    const periods = [];
    
    for (let time = startMinutes; time < endMinutes; time += 60) {
      const periodStart = minutesToTime(time);
      const periodEnd = minutesToTime(Math.min(time + 60, endMinutes));
      periods.push(`${periodStart} - ${periodEnd}`);
    }
    
    return periods;
  };

  // Fonction pour valider les heures
  const isValidTimeRange = (start, end) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    return endMinutes > startMinutes;
  };

  // Fonction pour ajouter des périodes
  const handleAddPeriods = () => {
    if (!isValidTimeRange(startTime, endTime)) {
      alert("L'heure de fin doit être après l'heure de début");
      return;
    }

    const newPeriods = generateHourlyPeriods(startTime, endTime);
    setPeriods(newPeriods);
    
    // Nettoyer les tâches existantes car les périodes ont changé
    setSchedule({});
  };

  // Fonction pour supprimer une période
  const handleRemovePeriod = (period) => {
    setPeriods(prev => prev.filter(p => p !== period));
    // Nettoyer les tâches de la période supprimée
    const newSchedule = { ...schedule };
    Object.keys(newSchedule).forEach(key => {
      if (key.includes(period)) {
        delete newSchedule[key];
      }
    });
    setSchedule(newSchedule);
  };

  // Fonction pour supprimer toutes les périodes
  const handleRemoveAllPeriods = () => {
    setPeriods([]);
    setSchedule({});
  };

  // Fonction pour obtenir les tâches d'une période spécifique
  const getTasksForPeriod = (date, period) => {
    if (!date || !period) return [];
    const key = `${date}-${period}`;
    const tasks = schedule[key];
    return Array.isArray(tasks) ? tasks : [];
  };

  // Fonction pour ajouter une tâche
  const handleAddTask = () => {
    if (!newTask.trim() || !selectedDay || !selectedPeriod) return;

    const key = `${selectedDay.date}-${selectedPeriod}`;
    const task = {
      id: Date.now(),
      text: newTask.trim(),
      completed: false
    };

    setSchedule(prev => ({
      ...prev,
      [key]: [...(getTasksForPeriod(selectedDay.date, selectedPeriod)), task]
    }));

    setNewTask('');
  };

  // Fonction pour supprimer une tâche
  const handleDeleteTask = (taskId) => {
    if (!selectedDay || !selectedPeriod) return;

    const key = `${selectedDay.date}-${selectedPeriod}`;
    const currentTasks = getTasksForPeriod(selectedDay.date, selectedPeriod);
    
    setSchedule(prev => ({
      ...prev,
      [key]: currentTasks.filter(task => task.id !== taskId)
    }));
  };

  // Fonction pour basculer l'état d'une tâche
  const handleToggleTask = (taskId) => {
    if (!selectedDay || !selectedPeriod) return;

    const key = `${selectedDay.date}-${selectedPeriod}`;
    const currentTasks = getTasksForPeriod(selectedDay.date, selectedPeriod);
    
    setSchedule(prev => ({
      ...prev,
      [key]: currentTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleCloseTaskDialog = () => {
    setTaskDialogOpen(false);
    setSelectedDay(null);
    setSelectedPeriod(null);
    setNewTask('');
  };

  const handleOpenMergePeriodDialog = () => {
    setMergePeriodDialogOpen(true);
    setSelectedDay(null);
    setSelectedPeriods([]);
  };

  const handleCloseMergePeriodDialog = () => {
    setMergePeriodDialogOpen(false);
    setSelectedDay(null);
    setSelectedPeriods([]);
  };

  const handleDaySelect = (day, date) => {
    console.log('Jour sélectionné:', day, date);
    setSelectedDay({ day, date });
  };

  const handlePeriodToggle = (period) => {
    console.log('Période sélectionnée:', period);
    setSelectedPeriods(prev => {
      const isSelected = prev.includes(period);
      if (isSelected) {
        return prev.filter(p => p !== period);
      } else {
        return [...prev, period];
      }
    });
  };

  const handleMergeSelectedPeriods = () => {
    if (selectedDay && selectedPeriods.length >= 2) {
      // Trier les périodes sélectionnées
      const sortedPeriods = [...selectedPeriods].sort((a, b) => {
        const aStart = a.split(' - ')[0];
        const bStart = b.split(' - ')[0];
        return aStart.localeCompare(bStart);
      });

      const startTime = sortedPeriods[0].split(' - ')[0];
      const endTime = sortedPeriods[sortedPeriods.length - 1].split(' - ')[1];
      const mergedPeriod = `${startTime} - ${endTime}`;
      
      // Créer la clé de fusion
      const mergeKey = `${selectedDay.date}`;
      
      // Stocker les informations de fusion
      setMergedCells(prev => ({
        ...prev,
        [mergeKey]: {
          startPeriod: sortedPeriods[0],
          endPeriod: sortedPeriods[sortedPeriods.length - 1],
          mergedPeriods: sortedPeriods,
          displayPeriod: mergedPeriod
        }
      }));

      // Rassembler toutes les tâches des périodes fusionnées
      const allTasks = [];
      sortedPeriods.forEach(period => {
        const key = `${selectedDay.date}-${period}`;
        const tasks = schedule[key] || [];
        allTasks.push(...tasks);
      });

      // Mettre à jour le schedule avec les tâches fusionnées
      const newSchedule = { ...schedule };
      sortedPeriods.forEach(period => {
        delete newSchedule[`${selectedDay.date}-${period}`];
      });
      newSchedule[`${selectedDay.date}-${mergedPeriod}`] = allTasks;
      
      setSchedule(newSchedule);
      handleCloseMergePeriodDialog();
    }
  };

  const handleSave = () => {
    handleCloseTaskDialog();
  };

  const handleToggleCellDisabled = (dayDate, period) => {
    const cellKey = `${dayDate}-${period}`;
    setDisabledMergedCells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cellKey)) {
        newSet.delete(cellKey);
      } else {
        newSet.add(cellKey);
      }
      return newSet;
    });
  };

  const days = ["LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI", "DIMANCHE"];

  function getWeekDates(date) {
    const curr = new Date(date);
    const week = [];
    
    curr.setDate(curr.getDate() - curr.getDay() + 1);
    
    for (let i = 0; i < 7; i++) {
      const first = curr.getDate().toString().padStart(2, '0');
      const month = (curr.getMonth() + 1).toString().padStart(2, '0');
      week.push({
        date: `${first}/${month}`,
        fullDate: new Date(curr)
      });
      curr.setDate(curr.getDate() + 1);
    }
    
    return week;
  }

  const nextWeek = () => {
    const nextWeekDate = new Date(currentWeek[0].fullDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    setCurrentWeek(getWeekDates(nextWeekDate));
  };

  const prevWeek = () => {
    const prevWeekDate = new Date(currentWeek[0].fullDate);
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);
    setCurrentWeek(getWeekDates(prevWeekDate));
  };

  const handlePrevWeek = () => {
    const prevWeekDate = new Date(currentWeek[0].fullDate);
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);
    setCurrentWeek(getWeekDates(prevWeekDate));
  };

  const handleNextWeek = () => {
    const nextWeekDate = new Date(currentWeek[0].fullDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    setCurrentWeek(getWeekDates(nextWeekDate));
  };

  const handleClickOpen = (day, period, date) => {
    if (!unavailableSlots[`${date}-${period}`]) {
      const slotKey = `${date}-${period}`;
      setSelectedSlot({ day, period, date });
      setCurrentTasks(schedule[slotKey] || []);
      setNewTask('');
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSlot(null);
    setNewTask('');
    setCurrentTasks([]);
  };

  const renderCell = (date, period) => {
    const isUnavailable = unavailableSlots[`${date}-${period}`];
    const periodIndex = periods.indexOf(period);
    
    // Vérifier si cette période fait partie d'une période fusionnée
    const mergedCell = Object.entries(schedule).find(([scheduleKey, data]) => {
      if (data?.isMerged) {
        const [scheduleDate, schedulePeriod] = scheduleKey.split('-');
        console.log('Vérification fusion:', {
          scheduleDate,
          schedulePeriod,
          currentDate: date,
          currentPeriod: period,
          mergedPeriods: data.mergedPeriods
        });
        return scheduleDate === date && data.mergedPeriods.includes(period);
      }
      return false;
    });

    console.log('Résultat recherche fusion:', { key: `${date}-${period}`, mergedCell });

    if (mergedCell) {
      const [mergedKey, mergedData] = mergedCell;
      console.log('Cellule fusionnée trouvée:', {
        mergedKey,
        mergedData,
        currentPeriod: period,
        firstPeriod: mergedData.mergedPeriods[0]
      });

      // Si ce n'est pas la première période de la fusion, ne rien rendre
      if (period !== mergedData.mergedPeriods[0]) {
        console.log('Skip période non-première:', period);
        return null;
      }

      // Rendre la cellule fusionnée
      console.log('Rendu cellule fusionnée avec rowSpan:', mergedData.mergedPeriods.length);
      return (
        <TableCell 
          key={mergedKey}
          rowSpan={mergedData.mergedPeriods.length}
          sx={{
            backgroundColor: '#e3f2fd',
            border: '2px solid #1976d2',
            position: 'relative',
            '&:hover': {
              backgroundColor: '#bbdefb',
            },
            padding: '10px',
            verticalAlign: 'top',
          }}
          onClick={() => handleCellClick(date, mergedData.startTime + ' - ' + mergedData.endTime)}
        >
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#1976d2', fontWeight: 'bold' }}>
              {`${mergedData.startTime} - ${mergedData.endTime}`}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {mergedData.tasks?.map((task, index) => (
                <Typography 
                  key={index} 
                  variant="body2"
                  sx={{
                    backgroundColor: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  {task.text}
                </Typography>
              ))}
            </Box>
          </Box>
        </TableCell>
      );
    }

    // Cellule normale
    const cellData = schedule[`${date}-${period}`];
    console.log('Rendu cellule normale:', { key: `${date}-${period}`, cellData });
    return (
      <TableCell 
        key={`${date}-${period}`}
        sx={{
          border: '1px solid #ddd',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
          padding: '10px',
          verticalAlign: 'top',
        }}
        onClick={() => handleCellClick(date, period)}
      >
        <Box>
          {Array.isArray(cellData) && cellData.map((task, index) => (
            <Typography 
              key={index} 
              variant="body2"
              sx={{
                backgroundColor: '#f5f5f5',
                padding: '4px 8px',
                borderRadius: '4px',
                marginBottom: '4px'
              }}
            >
              {task.text}
            </Typography>
          ))}
        </Box>
      </TableCell>
    );
  };

  const handleCellClick = (date, period) => {
    setSelectedDay({ date: date });
    setSelectedPeriod(period);
    setTaskDialogOpen(true);
  };

  const renderTableRow = (day) => {
    const mergeInfo = mergedCells[day.date];
    const cells = [];
    let skipCount = 0;

    cells.push(
      <TableCell key={`${day.date}-day`} component="th" scope="row">
        {days[day.dayIndex]} {day.date}
      </TableCell>
    );

    for (let i = 0; i < periods.length; i++) {
      if (skipCount > 0) {
        skipCount--;
        continue;
      }

      const period = periods[i];
      
      if (mergeInfo && period === mergeInfo.startPeriod) {
        const colspan = mergeInfo.mergedPeriods.length;
        skipCount = colspan - 1;
        const cellKey = `${day.date}-${mergeInfo.displayPeriod}`;
        const isDisabled = disabledMergedCells.has(cellKey);
        
        cells.push(
          <TableCell
            key={`${day.date}-${period}`}
            colSpan={colspan}
            onClick={() => !isDisabled && handleCellClick(day.date, mergeInfo.displayPeriod)}
            sx={{
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              '&:hover': {
                backgroundColor: isDisabled ? 'none' : 'action.hover',
              },
              minWidth: 150 * colspan,
              height: 100,
              verticalAlign: 'top',
              p: 1,
              backgroundColor: isDisabled ? 'rgba(255, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              opacity: isDisabled ? 0.7 : 1,
              position: 'relative'
            }}
          >
            <Box sx={{ position: 'relative', height: '100%' }}>
              {renderCell(day.date, mergeInfo.displayPeriod)}
              <Box
                sx={{
                  position: 'absolute',
                  top: 5,
                  right: 5,
                  zIndex: 1
                }}
              >
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleCellDisabled(day.date, mergeInfo.displayPeriod);
                  }}
                  sx={{
                    color: isDisabled ? 'error.main' : 'action.active',
                    '&:hover': {
                      backgroundColor: isDisabled ? 'error.light' : 'action.hover',
                    }
                  }}
                >
                  {isDisabled ? <LockIcon /> : <LockOpenIcon />}
                </IconButton>
              </Box>
              {isDisabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(255, 0, 0, 0.05)',
                    color: 'error.main'
                  }}
                >
                  <Typography variant="body2" color="error">Indisponible</Typography>
                </Box>
              )}
            </Box>
          </TableCell>
        );
      } else if (!mergeInfo || !mergeInfo.mergedPeriods.includes(period)) {
        cells.push(
          <TableCell
            key={`${day.date}-${period}`}
            onClick={() => handleCellClick(day.date, period)}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
              minWidth: 150,
              height: 100,
              verticalAlign: 'top',
              p: 1
            }}
          >
            {renderCell(day.date, period)}
          </TableCell>
        );
      }
    }

    return <TableRow key={day.date}>{cells}</TableRow>;
  };

  useEffect(() => {
    console.log('Schedule mis à jour:', schedule);
  }, [schedule]);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handlePrevWeek}>
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={handleNextWeek}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AccessTimeIcon />}
            onClick={() => setPeriodDialogOpen(true)}
          >
            Périodes
          </Button>
          <Button
            variant="outlined"
            startIcon={<MergeTypeIcon />}
            onClick={handleOpenMergePeriodDialog}
          >
            Fusionner
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} size="small">
          <TableHead>
            <TableRow>
              <TableCell>Jours</TableCell>
              {periods.map((period) => (
                <TableCell key={period} align="center">{period}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {currentWeek.map((day) => renderTableRow(day))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Activités {selectedSlot && `${selectedSlot.day} - ${selectedSlot.period}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Nouvelle activité"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTask();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddTask}
              disabled={!newTask.trim()}
              startIcon={<AddIcon />}
            >
              Ajouter
            </Button>
          </Box>
          <List>
            {currentTasks.map((task) => (
              <ListItem
                key={task.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={task.text}
                  onClick={() => handleToggleTask(task.id)}
                  sx={{
                    textDecoration: task.completed ? 'line-through' : 'none',
                    cursor: 'pointer'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={taskDialogOpen} 
        onClose={handleCloseTaskDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedDay && selectedPeriod ? `Activités ${selectedDay.day} - ${selectedPeriod}` : 'Activités'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              label="Nouvelle activité"
              variant="outlined"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddTask();
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleAddTask}
              disabled={!newTask.trim() || !selectedDay || !selectedPeriod}
              startIcon={<AddIcon />}
            >
              Ajouter
            </Button>
          </Box>
          {selectedDay && selectedPeriod && (
            <List>
              {getTasksForPeriod(selectedDay.date, selectedPeriod).map((task, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDeleteTask(task.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemIcon>
                    <IconButton onClick={() => handleToggleTask(task.id)}>
                      <CheckIcon color={task.completed ? "primary" : "disabled"} />
                    </IconButton>
                  </ListItemIcon>
                  <ListItemText 
                    primary={task.text}
                    sx={{
                      textDecoration: task.completed ? 'line-through' : 'none',
                      color: task.completed ? 'text.secondary' : 'text.primary'
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTaskDialog} color="primary">
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={mergePeriodDialogOpen} 
        onClose={handleCloseMergePeriodDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Fusionner des périodes</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              1. Sélectionnez un jour
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {currentWeek.map((day) => (
                <Button
                  key={day.date}
                  variant={selectedDay?.date === day.date ? "contained" : "outlined"}
                  onClick={() => handleDaySelect(days[day.dayIndex], day.date)}
                >
                  {days[day.dayIndex]} - {day.date}
                </Button>
              ))}
            </Box>
          </Box>
          {selectedDay && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                2. Sélectionnez les périodes à fusionner (minimum 2)
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {periods.map((period) => (
                  <FormControlLabel
                    key={period}
                    control={
                      <Switch
                        checked={selectedPeriods.includes(period)}
                        onChange={() => handlePeriodToggle(period)}
                      />
                    }
                    label={period}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMergePeriodDialog}>
            Annuler
          </Button>
          <Button
            onClick={handleMergeSelectedPeriods}
            variant="contained"
            color="primary"
            disabled={!selectedDay || selectedPeriods.length < 2}
          >
            Fusionner
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={periodDialogOpen} 
        onClose={() => setPeriodDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Définir les périodes</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Définir la plage horaire
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
              <TextField
                label="Heure de début"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 3600, // 1 heure
                }}
                sx={{ width: 150 }}
              />
              <Typography>à</Typography>
              <TextField
                label="Heure de fin"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 3600, // 1 heure
                }}
                sx={{ width: 150 }}
              />
              <Button
                variant="contained"
                onClick={handleAddPeriods}
                startIcon={<AddIcon />}
              >
                Générer
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle1">
                Périodes actuelles
              </Typography>
              {periods.length > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={handleRemoveAllPeriods}
                  startIcon={<DeleteIcon />}
                >
                  Tout supprimer
                </Button>
              )}
            </Box>
            <List>
              {periods.map((period, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleRemovePeriod(period)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText primary={period} />
                </ListItem>
              ))}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPeriodDialogOpen(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default WeeklyTasks;
