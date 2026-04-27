import React, { useState, useRef, useEffect } from 'react';

interface Task {
  title: string;
  description: string;
  time: number;
  priority: 'High' | 'Medium' | 'Low';
}

const tasks: Task[] = [
  { title: 'Review student report', description: 'Go through the latest student performance report', time: 25, priority: 'High' },
  { title: 'Prepare weekly schedule', description: 'Plan out the tasks for the upcoming week', time: 40, priority: 'Medium' },
  { title: 'Reply to student emails', description: 'Respond to emails from students', time: 15, priority: 'Low' },
];

const App: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [debounce, setDebounce] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        const index = Math.round(scrollTop / window.innerHeight);
        setCurrentIndex(Math.min(index, tasks.length - 1));
      }
    };
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTask = (index: number) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * window.innerHeight,
        behavior: 'smooth',
      });
    }
  };

  const handleStartNow = () => {
    if (debounce) return;
    setDebounce(true);
    // Visual feedback: maybe alert or change style, for now alert
    alert('Starting task now!');
    setTimeout(() => setDebounce(false), 1000);
  };

  const handleScheduleIt = () => {
    if (debounce) return;
    setDebounce(true);
    alert('Scheduling task!');
    setTimeout(() => setDebounce(false), 1000);
  };

  const handleSkip = () => {
    if (debounce) return;
    setDebounce(true);
    const nextIndex = (currentIndex + 1) % tasks.length;
    scrollToTask(nextIndex);
    setTimeout(() => setDebounce(false), 1000);
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="task-container" ref={containerRef}>
      {tasks.map((task, index) => (
        <div key={index} className="task">
          <div className="progress">Task {index + 1} of {tasks.length}</div>
          <h1 className="task-title">{task.title}</h1>
          <p className="task-description">{task.description}</p>
          <p className="task-time">Estimated time: {task.time} min</p>
          <div className={`task-priority ${getPriorityClass(task.priority)}`}>{task.priority} Priority</div>
          <div className="buttons">
            <button className="button start-now" onClick={handleStartNow}>Start Now</button>
            <button className="button schedule-it" onClick={handleScheduleIt}>Schedule It</button>
            <button className="button skip" onClick={handleSkip}>Skip</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;