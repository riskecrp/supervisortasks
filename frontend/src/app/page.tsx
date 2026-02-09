"use client"

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
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
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
              {mockTasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.completedDate);
                return (
                  <TableRow key={task.id} className={overdue ? 'bg-red-50' : ''}>
                    <TableCell className={overdue ? 'text-red-700 font-medium' : ''}>
                      {task.taskList}
                    </TableCell>
                    <TableCell>{task.taskOwner}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{task.claimedAssignedDate || '-'}</TableCell>
                    <TableCell className={overdue ? 'text-red-700' : ''}>
                      {task.dueDate || '-'}
                    </TableCell>
                    <TableCell>{task.completedDate || '-'}</TableCell>
                    <TableCell>{task.notes}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
