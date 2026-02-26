import { Task } from '../types/Task'
import { IconX } from './Icons'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

const priorityLabel: Record<Task['priority'], string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete }) => {
  const date = new Date(task.createdAt).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className={`task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`}>
      <div className="task-check">
        <input
          type="checkbox"
          id={`task-${task.id}`}
          checked={task.completed}
          onChange={() => onToggle(task.id)}
        />
        <label htmlFor={`task-${task.id}`} className="checkmark" aria-label="Marcar tarea" />
      </div>
      <div className="task-content">
        <p className="task-title">{task.title}</p>
        {task.description && <p className="task-description">{task.description}</p>}
        <div className="task-meta">
          <span className={`badge priority-badge-${task.priority}`}>
            {priorityLabel[task.priority]}
          </span>
          <span className="task-date">{date}</span>
        </div>
      </div>
      <button
        className="btn-delete"
        onClick={() => onDelete(task.id)}
        aria-label="Eliminar tarea"
        title="Eliminar"
      >
        <IconX />
      </button>
    </div>
  )
}
