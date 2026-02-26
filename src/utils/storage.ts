import { Task } from '../types/Task'

const STORAGE_KEY = 'pwa_tasks'

export const loadTasks = (): Task[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? (JSON.parse(data) as Task[]) : []
  } catch {
    return []
  }
}

export const saveTasks = (tasks: Task[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  } catch (err) {
    console.error('Error guardando tareas en LocalStorage:', err)
  }
}

export const generateId = (): string =>
  `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
