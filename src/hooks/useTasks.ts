import { useState, useEffect, useCallback } from 'react'
import { Task, FilterType } from '../types/Task'
import { loadTasks, saveTasks, generateId } from '../utils/storage'

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    setTasks(loadTasks())
  }, [])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    saveTasks(tasks)
  }, [tasks])

  const addTask = useCallback((title: string, description: string, priority: Task['priority']) => {
    const newTask: Task = {
      id: generateId(),
      title,
      description,
      completed: false,
      priority,
      createdAt: new Date().toISOString(),
    }
    setTasks(prev => [newTask, ...prev])
  }, [])

  const toggleTask = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(task => (task.id === id ? { ...task, completed: !task.completed } : task))
    )
  }, [])

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }, [])

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed
    if (filter === 'completed') return task.completed
    return true
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length,
  }

  return { tasks: filteredTasks, filter, setFilter, addTask, toggleTask, deleteTask, stats, isOnline }
}
