import { IconLogo } from './Icons'

interface HeaderProps {
  isOnline: boolean
  completed: number
  total: number
}

export const Header: React.FC<HeaderProps> = ({ isOnline, completed, total }) => {
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="header-title">
          <div className="header-icon"><IconLogo /></div>
          <h1>Task Manager</h1>
        </div>
        <span className={`status-badge ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      {total > 0 && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-label">{completed}/{total} completadas ({progress}%)</span>
        </div>
      )}
    </header>
  )
}
