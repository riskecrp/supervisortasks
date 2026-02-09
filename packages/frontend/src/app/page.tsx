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
import { Badge } from '@/components/ui/badge';
import { mockTasks } from '@/lib/mockData';
import { Task } from '@/types';
import { api } from '@/lib/api';

function getStatusVariant(status: Task['status']) {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'In Progress':
      return 'info';
    case 'Not Started':
      return 'secondary';
    case 'Blocked':
      return 'destructive';
    default:
      return 'default';
  }
}

function isOverdue(dueDate: string | null, completedDate: string | null): boolean {
  if (!dueDate || completedDate) return false;
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
}

const availableStatuses: Task['status'][] = ['Not Started', 'In Progress', 'Completed', 'Blocked'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const data = await api.tasks.getAll();
        setTasks(data as Task[]);
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
      await api.tasks.update(taskId, { status: newStatus });
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Failed to update task status. Please try again.');
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
                  return (
                    <TableRow key={task.id} className={overdue ? 'bg-amber-50/30' : ''}>
                      <TableCell className={overdue ? 'text-amber-900 font-medium' : ''}>
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
                      <TableCell>{task.claimedAssignedDate || '-'}</TableCell>
                      <TableCell className={overdue ? 'text-amber-800' : ''}>
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
