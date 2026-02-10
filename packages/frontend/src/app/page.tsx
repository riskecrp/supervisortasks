"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockTasks } from '@/lib/mockData';
import { Task } from '@/types';
import { api } from '@/lib/api';

function isOverdue(dueDate: string | null, completedDate: string | null): boolean {
  if (!dueDate || completedDate) return false;
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
}

function getStaleTaskThresholdDays(): number {
  const raw = process.env.NEXT_PUBLIC_STALE_TASK_THRESHOLD_DAYS;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}

const STALE_TASK_THRESHOLD_DAYS = getStaleTaskThresholdDays();
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const ROW_HIGHLIGHT_CLASS = 'bg-amber-100/60';

function isStale(claimedDate: string | null, completedDate: string | null): boolean {
  if (!claimedDate || completedDate) return false;
  const claimed = new Date(claimedDate);
  if (isNaN(claimed.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  claimed.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - claimed.getTime()) / MILLISECONDS_PER_DAY);
  return diffDays > STALE_TASK_THRESHOLD_DAYS;
}

const availableStatuses: Task['status'][] = ['Assigned', 'Not Started', 'In Progress', 'Completed', 'Blocked'];

// Normalize incoming task data, keeping compatibility with legacy claimedAssignedDate
// until all backends return claimedDate consistently.
const normalizeTask = (
  task: Partial<Task> & { claimedAssignedDate?: string | null }
): Task => {
  if (!task.id || !task.taskList || !task.taskOwner) {
    console.warn('normalizeTask received task with missing critical fields', {
      hasId: !!task.id,
      hasTaskList: !!task.taskList,
      hasTaskOwner: !!task.taskOwner,
    });
  }

  return {
    id: task.id || '',
    taskList: task.taskList || '',
    taskOwner: task.taskOwner || '',
    status: (task.status as Task['status']) || 'Not Started',
    claimedDate: task.claimedDate || task.claimedAssignedDate || null,
    dueDate: task.dueDate || null,
    completedDate: task.completedDate || null,
    notes: task.notes || '',
  };
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await api.tasks.getAll();
        const normalized = Array.isArray(data) ? data.map(normalizeTask) : [];
        setTasks(normalized.length ? normalized : mockTasks);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Using mock data - backend not available');
        // Keep using mock data as fallback
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const completedDate =
        newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : '';

      const updated = await api.tasks.update(taskId, {
        status: newStatus,
        completedDate,
      });
      const normalized = normalizeTask(updated);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? normalized : task
        )
      );
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Failed to update task status. Please check your connection and try again.');
    }
  };

  const filteredTasks = showCompleted 
    ? tasks 
    : tasks.filter(task => task.status !== 'Completed');

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Tasks</CardTitle>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              Show completed tasks
            </label>
          </div>
          {error && (
            <p className="text-sm text-muted-foreground mt-2">
              ⚠️ {error}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading tasks...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task List</TableHead>
                  <TableHead>Task Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Claimed/Assigned Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Completed Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.completedDate);
                  const stale = isStale(task.claimedDate, task.completedDate);
                  const highlight = overdue || stale;
                  return (
                    <TableRow key={task.id} className={highlight ? ROW_HIGHLIGHT_CLASS : ''}>
                      <TableCell className={highlight ? 'text-amber-900 font-semibold' : ''}>
                        {task.taskList}
                      </TableCell>
                      <TableCell>{task.taskOwner}</TableCell>
                      <TableCell>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                          className="px-2 py-1 rounded border border-gray-300 bg-white text-sm"
                          >
                          {availableStatuses.map(status => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell className={stale ? 'text-amber-900 font-medium' : ''}>
                        {task.claimedDate || '-'}
                      </TableCell>
                      <TableCell className={overdue ? 'text-amber-900 font-medium' : ''}>
                        {task.dueDate || '-'}
                      </TableCell>
                      <TableCell>{task.completedDate || '-'}</TableCell>
                      <TableCell>{task.notes}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
