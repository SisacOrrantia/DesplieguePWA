export interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

export type FilterType = 'all' | 'active' | 'completed'
