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

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
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
                {tasks.map((task) => {
                  const overdue = isOverdue(task.dueDate, task.completedDate);
                  return (
                    <TableRow key={task.id} className={overdue ? 'bg-amber-50/30' : ''}>
                      <TableCell className={overdue ? 'text-amber-900 font-medium' : ''}>
                        {task.taskList}
                      </TableCell>
                      <TableCell>{task.taskOwner}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(task.status)}>
                          {task.status}
                        </Badge>
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
