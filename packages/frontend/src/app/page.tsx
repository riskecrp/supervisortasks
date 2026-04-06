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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockTasks } from '@/lib/mockData';
import { Task } from '@/types';
import { api } from '@/lib/api';
import { Plus } from 'lucide-react';

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

const emptyForm = {
  taskList: '',
  taskOwner: '',
  status: 'Assigned' as Task['status'],
  claimedDate: '',
  dueDate: '',
  notes: '',
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      const data = await api.tasks.getAll();
      const normalized = Array.isArray(data) ? data.map(normalizeTask) : [];
      setTasks(normalized.length ? normalized : mockTasks);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError('Using mock data - backend not available');
    } finally {
      setIsLoading(false);
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const completedDate =
        newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : '';

      const updated = await api.tasks.update(taskId, { status: newStatus, completedDate });
      const normalized = normalizeTask(updated);
      setTasks(prev => prev.map(t => (t.id === taskId ? normalized : t)));
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Failed to update task status. Please check your connection and try again.');
    }
  };

  const handleAddTask = async () => {
    if (!formData.taskList.trim()) {
      alert('Task name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.tasks.create({
        taskList: formData.taskList.trim(),
        taskOwner: formData.taskOwner.trim(),
        status: formData.status,
        claimedDate: formData.claimedDate || null,
        dueDate: formData.dueDate || null,
        completedDate: null,
        notes: formData.notes.trim(),
      });
      setIsAddDialogOpen(false);
      setFormData(emptyForm);
      await fetchTasks();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
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
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer text-foreground">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={(e) => setShowCompleted(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                Show completed tasks
              </label>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
          {error && (
            <p className="text-sm text-muted-foreground mt-2">⚠️ {error}</p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
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
                    <TableRow
                      key={task.id}
                      style={highlight ? { backgroundColor: 'var(--warning-bg)' } : undefined}
                    >
                      <TableCell
                        style={highlight ? { color: 'var(--warning-text)', fontWeight: 600 } : undefined}
                      >
                        {task.taskList}
                      </TableCell>
                      <TableCell>{task.taskOwner}</TableCell>
                      <TableCell>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                          className="px-2 py-1 rounded border border-border bg-background text-foreground text-sm"
                        >
                          {availableStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </TableCell>
                      <TableCell
                        style={stale ? { color: 'var(--warning-text)', fontWeight: 500 } : undefined}
                      >
                        {task.claimedDate || '-'}
                      </TableCell>
                      <TableCell
                        style={overdue ? { color: 'var(--warning-text)', fontWeight: 500 } : undefined}
                      >
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

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>
              Add a new task to the spreadsheet. Required fields are marked with *.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskList">Task Name *</Label>
              <Input
                id="taskList"
                value={formData.taskList}
                onChange={(e) => setFormData({ ...formData, taskList: e.target.value })}
                placeholder="Enter task name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="taskOwner">Task Owner</Label>
              <Input
                id="taskOwner"
                value={formData.taskOwner}
                onChange={(e) => setFormData({ ...formData, taskOwner: e.target.value })}
                placeholder="Enter owner name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              >
                {availableStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="claimedDate">Claimed/Assigned Date</Label>
                <Input
                  id="claimedDate"
                  type="date"
                  value={formData.claimedDate}
                  onChange={(e) => setFormData({ ...formData, claimedDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm min-h-[80px] resize-y"
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setFormData(emptyForm); }}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
