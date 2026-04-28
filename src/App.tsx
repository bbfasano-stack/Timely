import React, { useEffect, useRef, useState } from 'react';

interface Task {
  title: string;
  description: string;
  time: number;
  priority: 'High' | 'Medium' | 'Low';
  status?: 'Pending' | 'In Progress' | 'Completed';
  scheduled?: boolean;
  scheduledTime?: string;
}

const initialTasks: Task[] = [
  {
    title: 'Review student report',
    description: 'Go through the latest student performance report',
    time: 25,
    priority: 'High',
    status: 'Pending',
  },
  {
    title: 'Prepare weekly schedule',
    description: 'Plan out the tasks for the upcoming week',
    time: 40,
    priority: 'Medium',
    status: 'Pending',
  },
  {
    title: 'Reply to student emails',
    description: 'Respond to emails from students',
    time: 15,
    priority: 'Low',
    status: 'Pending',
  },
];

const timeOptions = ['Later Today', 'This Afternoon', 'Tomorrow Morning', 'Tomorrow Evening'];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string>('Later Today');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

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
    setScheduledTasks((prev) => [...prev, updatedTask]);
    setStatusMessage(`${activeTask.title} scheduled for ${selectedTime}.`);
    setTimeout(() => setStatusMessage(''), 2000);
  };

  const handleSkip = () => {
    const nextIndex = currentIndex < tasks.length - 1 ? currentIndex + 1 : 0;
    scrollToTask(nextIndex);
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
              <div className="buttons">
                <button className="button start-now" onClick={handleStartNow} disabled={status === 'Completed'}>
                  {startText}
                </button>
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
          <h2>Scheduled Tasks</h2>
          <p>{scheduledTasks.length} task{scheduledTasks.length === 1 ? '' : 's'} scheduled</p>
        </div>

        {statusMessage && <div className="status-message">{statusMessage}</div>}

        {scheduledTasks.length === 0 ? (
          <div className="empty-state">No tasks scheduled yet. Use "Schedule It" to add one.</div>
        ) : (
          scheduledTasks.map((task) => (
            <div key={`${task.title}-${task.scheduledTime}`} className="scheduled-task">
              <div className="scheduled-title">{task.title}</div>
              <div className="scheduled-meta">
                <span>{task.time} min</span>
                <span>{task.scheduledTime ?? 'Later Today'}</span>
              </div>
            </div>
          ))
        )}
      </aside>
    </div>
  );
};

export default App;
