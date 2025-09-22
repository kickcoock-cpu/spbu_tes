import { Main } from '@/components/layout/main'
import { TasksDialogs } from './components/tasks-dialogs'
import { TasksPrimaryButtons } from './components/tasks-primary-buttons'
import { TasksProvider } from './components/tasks-provider'
import { TasksTable } from './components/tasks-table'
import { tasks } from './data/tasks'

export function Tasks() {
  return (
    <TasksProvider>
      <Main fullWidth>
        <div className='mb-6 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Tasks</h2>
            <p className='text-muted-foreground'>
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className='flex-1 overflow-auto py-1'>
          <TasksTable data={tasks} />
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  )
}
