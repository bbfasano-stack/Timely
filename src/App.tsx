import React, { useEffect, useRef, useState } from 'react';

interface Task {
  title: string;
  description: string;
  time: number;
  priority: 'High' | 'Medium' | 'Low';
  status?: 'Pending' | 'In Progress' | 'Completed';
  scheduled?: boolean;
  scheduledTime?: string;
  customTitle?: string;
  info?: string;
}

const initialTasks: Task[] = [
  {
    title: 'Review student report',
    description: 'Go through the latest student performance report',
    time: 25,
    priority: 'High',
    status: 'Pending',
    customTitle: 'Prepare student report',
    info: 'Gather the latest scores, attendance, and comments.',
  },
  {
    title: 'Prepare weekly schedule',
    description: 'Plan out the tasks for the upcoming week',
    time: 40,
    priority: 'Medium',
    status: 'Pending',
    customTitle: 'Build weekly schedule',
    info: 'Map lessons, grading windows, and deadlines for students.',
  },
  {
    title: 'Reply to student emails',
    description: 'Respond to emails from students',
    time: 15,
    priority: 'Low',
    status: 'Pending',
    customTitle: 'Answer student questions',
    info: 'Address pending queries about assignments and meetings.',
  },
];

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  note?: string;
}

const timeOptions = ['Later Today', 'This Afternoon', 'Tomorrow Morning', 'Tomorrow Evening'];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string>('Later Today');
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [newEventHour, setNewEventHour] = useState<string>('6');
  const [newEventMinute, setNewEventMinute] = useState<string>('00');
  const [newEventMeridiem, setNewEventMeridiem] = useState<string>('PM');
  const [newEventNote, setNewEventNote] = useState('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [lastRemovedScheduledIndex, setLastRemovedScheduledIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scheduledItems = tasks
    .map((task, index) => ({ task, index }))
    .filter(({ task }) => task.scheduled);

  const updateTaskField = (index: number, field: 'customTitle' | 'info', value: string) => {
    setTasks((prev) =>
      prev.map((task, taskIndex) =>
        taskIndex === index ? { ...task, [field]: value } : task,
      ),
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / containerRef.current.clientHeight);
      setCurrentIndex(Math.min(index, tasks.length - 1));
    };

    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [tasks.length]);

  const scrollToTask = (index: number) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: index * container.clientHeight, behavior: 'smooth' });
    setCurrentIndex(index);
  };

  const activeTask = tasks[currentIndex];

  const handleStartNow = () => {
    if (!activeTask) return;

    const isInProgress = activeTask.status === 'In Progress';
    const updatedStatus = isInProgress ? 'Completed' : 'In Progress';

    setTasks((prevTasks) =>
      prevTasks.map((task, index) =>
        index === currentIndex ? { ...task, status: updatedStatus } : task,
      ),
    );

    setStatusMessage(`${activeTask.title} is now ${updatedStatus.toLowerCase()}.`);
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleScheduleIt = () => {
    if (!activeTask || activeTask.scheduled) return;

    const updatedTask = { ...activeTask, scheduled: true, scheduledTime: selectedTime };
    setTasks((prevTasks) => prevTasks.map((task, index) => (index === currentIndex ? updatedTask : task)));
    setStatusMessage(`${activeTask.title} scheduled for ${selectedTime}.`);
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleMarkComplete = () => {
    if (!activeTask || activeTask.status === 'Completed') return;

    setTasks((prevTasks) =>
      prevTasks.map((task, index) =>
        index === currentIndex ? { ...task, status: 'Completed' } : task,
      ),
    );
    setStatusMessage(`${activeTask.title} is now completed.`);
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleSkip = () => {
    const nextIndex = currentIndex < tasks.length - 1 ? currentIndex + 1 : 0;
    scrollToTask(nextIndex);
  };

  const handleAddCalendarEvent = () => {
    if (!newEventTitle.trim()) return;

    const eventTime = `${newEventHour.padStart(2, '0')}:${newEventMinute.padStart(2, '0')} ${newEventMeridiem}`;
    const event: CalendarEvent = {
      id: `${newEventTitle}-${newEventDate}-${eventTime}`,
      title: newEventTitle.trim(),
      date: newEventDate,
      time: eventTime,
      note: newEventNote.trim() || undefined,
    };

    setCalendarEvents((prev) => [event, ...prev]);
    setNewEventTitle('');
    setNewEventNote('');
    setStatusMessage(`Added "${event.title}" to ${event.date} at ${event.time}.`);
    setTimeout(() => setStatusMessage(''), 2500);
  };

  const handleCompleteScheduledTask = (taskIndex: number) => {
    setTasks((prevTasks) =>
      prevTasks.map((task, index) =>
        index === taskIndex
          ? { ...task, status: 'Completed', scheduled: false }
          : task,
      ),
    );
    setLastRemovedScheduledIndex(taskIndex);
    setStatusMessage(`Marked done. `);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
      setLastRemovedScheduledIndex(null);
      setStatusMessage('');
    }, 5000);
  };

  const handleUndoCompleteScheduledTask = () => {
    if (lastRemovedScheduledIndex === null) return;
    setTasks((prevTasks) =>
      prevTasks.map((task, index) =>
        index === lastRemovedScheduledIndex
          ? { ...task, status: 'Pending', scheduled: true }
          : task,
      ),
    );
    setLastRemovedScheduledIndex(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setStatusMessage('');
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'priority-high';
      case 'Medium':
        return 'priority-medium';
      case 'Low':
        return 'priority-low';
      default:
        return '';
    }
  };

  return (
    <div className="app-shell">
      <main className="task-container" ref={containerRef}>
        {tasks.map((task, index) => {
          const status = task.status ?? 'Pending';
          const isActive = index === currentIndex;
          const isScheduled = task.scheduled;
          const taskClassName = `task ${isActive ? 'task-active' : ''} ${status === 'In Progress' ? 'task-in-progress' : ''} ${status === 'Completed' ? 'task-completed' : ''}`;
          const startText = status === 'Pending' ? 'Start Now' : status === 'In Progress' ? 'Complete Task' : 'Completed';

          return (
            <section key={task.title} className={taskClassName}>
              <div className="progress">Task {index + 1} of {tasks.length}</div>
              <h1 className="task-title">{task.title}</h1>
              <p className="task-description">{task.description}</p>
              <p className="task-time">Estimated time: {task.time} min</p>
              <div className={`task-priority ${getPriorityClass(task.priority)}`}>{task.priority} Priority</div>
              <div className="task-status-row">
                <span className={`status-badge status-${status.replace(' ', '-').toLowerCase()}`}>{status}</span>
                {isScheduled && <span className="status-chip">Scheduled</span>}
              </div>
              <div className="schedule-row">
                <label htmlFor={`schedule-time-${index}`}>Schedule for</label>
                <select id={`schedule-time-${index}`} value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="action-detail">
                <label>
                  Action title
                  <input
                    value={task.customTitle ?? task.title}
                    onChange={(event) => updateTaskField(index, 'customTitle', event.target.value)}
                  />
                </label>
                <label>
                  Notes
                  <textarea
                    value={task.info ?? ''}
                    onChange={(event) => updateTaskField(index, 'info', event.target.value)}
                    placeholder="Add any notes or details for this action"
                  />
                </label>
              </div>
              <div className="buttons">
                <button className="button start-now" onClick={handleStartNow} disabled={status === 'Completed'}>
                  {startText}
                </button>
                {status !== 'Completed' && (
                  <button className="button complete" onClick={handleMarkComplete}>
                    Mark Complete
                  </button>
                )}
                <button className="button schedule-it" onClick={handleScheduleIt} disabled={isScheduled}>
                  {isScheduled ? 'Scheduled' : 'Schedule It'}
                </button>
                <button className="button skip" onClick={handleSkip}>Skip</button>
              </div>
            </section>
          );
        })}
      </main>

      <aside className="scheduled-panel">
        <div className="scheduled-header">
          <div>
            <h2>Scheduled Tasks</h2>
            <p>{scheduledItems.length} task{scheduledItems.length === 1 ? '' : 's'} scheduled</p>
          </div>
        </div>

        {statusMessage && (
          <div className="status-message">
            {statusMessage}
            {lastRemovedScheduledIndex !== null && (
              <button className="button undo-action" onClick={handleUndoCompleteScheduledTask}>
                Undo
              </button>
            )}
          </div>
        )}

        {scheduledItems.length === 0 ? (
          <div className="empty-state">No tasks scheduled yet. Use "Schedule It" to add one.</div>
        ) : (
          scheduledItems.map(({ task, index }) => (
            <div key={`${task.title}-${task.scheduledTime}-${index}`} className={`scheduled-task ${task.status === 'Completed' ? 'scheduled-completed' : ''}`}>
              <div className="scheduled-top-row">
                <div>
                  <div className="scheduled-title">{task.customTitle || task.title}</div>
                  <div className="scheduled-info">{task.info || task.description}</div>
                </div>
                <button
                  className={`button scheduled-check ${task.status === 'Completed' ? 'completed' : ''}`}
                  onClick={() => handleCompleteScheduledTask(index)}
                >
                  {task.status === 'Completed' ? 'Done' : 'Mark done'}
                </button>
              </div>
              <div className="scheduled-meta">
                <span>{task.time} min</span>
                <span>{task.scheduledTime ?? 'Later Today'}</span>
              </div>
            </div>
          ))
        )}

        <div className="calendar-panel">
          <div className="calendar-header">
            <h2>Calendar</h2>
            <p>Add tasks to your plan and see them by date.</p>
          </div>

          <div className="calendar-form">
            <input
              aria-label="New calendar task"
              placeholder="What do you need to do?"
              value={newEventTitle}
              onChange={(event) => setNewEventTitle(event.target.value)}
            />
            <div className="calendar-row">
              <label>
                Date
                <input type="date" value={newEventDate} onChange={(event) => setNewEventDate(event.target.value)} />
              </label>
              <div className="time-select-row">
                <label>
                  Hour
                  <select value={newEventHour} onChange={(event) => setNewEventHour(event.target.value)}>
                    {Array.from({ length: 12 }, (_, i) => `${i + 1}`).map((hour) => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Min
                  <select value={newEventMinute} onChange={(event) => setNewEventMinute(event.target.value)}>
                    {['00', '15', '30', '45'].map((minute) => (
                      <option key={minute} value={minute}>{minute}</option>
                    ))}
                  </select>
                </label>
                <label>
                  AM/PM
                  <select value={newEventMeridiem} onChange={(event) => setNewEventMeridiem(event.target.value)}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </label>
              </div>
            </div>
            <textarea
              placeholder="Notes (optional)"
              value={newEventNote}
              onChange={(event) => setNewEventNote(event.target.value)}
            />
            <button className="button add-calendar" type="button" onClick={handleAddCalendarEvent}>
              Add to calendar
            </button>
          </div>

          <div className="calendar-list">
            {calendarEvents.length === 0 ? (
              <div className="empty-state">No calendar items yet. Add one to plan your day.</div>
            ) : (
              calendarEvents.map((event) => (
                <div key={event.id} className="calendar-event">
                  <div className="calendar-event-title">{event.title}</div>
                  <div className="calendar-event-meta">
                    <span>{event.date}</span>
                    <span>{event.time}</span>
                  </div>
                  {event.note && <div className="calendar-event-note">{event.note}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default App;
