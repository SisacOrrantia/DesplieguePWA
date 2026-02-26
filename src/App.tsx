import { Header } from './components/Header'
import { AddTaskForm } from './components/AddTaskForm'
import { TaskList } from './components/TaskList'
import { useTasks } from './hooks/useTasks'
import './App.css'

function App() {
  const { tasks, filter, setFilter, addTask, toggleTask, deleteTask, stats, isOnline } = useTasks()

  return (
    <div className="app">
      <Header isOnline={isOnline} completed={stats.completed} total={stats.total} />
      <main className="app-main">
        <AddTaskForm onAdd={addTask} />
        <TaskList
          tasks={tasks}
          filter={filter}
          onSetFilter={setFilter}
          onToggle={toggleTask}
          onDelete={deleteTask}
          stats={stats}
        />
      </main>
      <footer className="app-footer">
        <p>Task Manager PWA — Germán Orrantia © 2026</p>
        <p className="footer-note">Los datos se guardan localmente en tu dispositivo</p>
      </footer>
    </div>
  )
}

export default App
