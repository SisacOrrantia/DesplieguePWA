import { useState } from 'react'
import { Task } from '../types/Task'
import { IconPlus } from './Icons'

interface AddTaskFormProps {
  onAdd: (title: string, description: string, priority: Task['priority']) => void
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('medium')
  const [isOpen, setIsOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), description.trim(), priority)
    setTitle('')
    setDescription('')
    setPriority('medium')
    setIsOpen(false)
  }

  return (
    <div className="add-task-container">
      {!isOpen ? (
        <button className="btn btn-primary add-task-toggle" onClick={() => setIsOpen(true)}>
          <IconPlus /> Nueva Tarea
        </button>
      ) : (
        <form className="add-task-form" onSubmit={handleSubmit}>
          <h3>Nueva Tarea</h3>
          <div className="form-group">
            <label htmlFor="task-title">Título *</label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="¿Qué necesitas hacer?"
              autoFocus
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-desc">Descripción</label>
            <textarea
              id="task-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalles opcionales..."
              rows={3}
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-priority">Prioridad</label>
            <select
              id="task-priority"
              value={priority}
              onChange={e => setPriority(e.target.value as Task['priority'])}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Agregar</button>
            <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
