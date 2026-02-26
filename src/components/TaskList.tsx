import { Task, FilterType } from '../types/Task'
import { TaskItem } from './TaskItem'

interface TaskListProps {
  tasks: Task[]
  filter: FilterType
  onSetFilter: (f: FilterType) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  stats: { total: number; completed: number; active: number }
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  filter,
  onSetFilter,
  onToggle,
  onDelete,
  stats,
}) => {
  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: `Todas (${stats.total})` },
    { key: 'active', label: `Activas (${stats.active})` },
    { key: 'completed', label: `Completadas (${stats.completed})` },
  ]

  return (
    <div className="task-list-container">
      <div className="filter-bar">
        {filters.map(f => (
          <button
            key={f.key}
            className={`filter-btn ${filter === f.key ? 'active' : ''}`}
            onClick={() => onSetFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <p>🎉 No hay tareas {filter === 'completed' ? 'completadas' : filter === 'active' ? 'activas' : ''}.</p>
          {filter === 'all' && <p className="empty-hint">¡Agrega tu primera tarea!</p>}
        </div>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <TaskItem key={task.id} task={task} onToggle={onToggle} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
