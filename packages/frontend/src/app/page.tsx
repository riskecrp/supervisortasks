"use client"

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { mockTasks } from '@/lib/mockData';
import { Task, Supervisor } from '@/types';
import { api } from '@/lib/api';
import { Plus, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

function isOverdue(dueDate: string | null, completedDate: string | null): boolean {
  if (!dueDate || completedDate) return false;
  return new Date(dueDate) < new Date();
}

function getStaleThreshold(): number {
  const raw = process.env.NEXT_PUBLIC_STALE_TASK_THRESHOLD_DAYS;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5;
}
const STALE_DAYS = getStaleThreshold();
const MS_PER_DAY = 1000 * 60 * 60 * 24;

function isStale(claimedDate: string | null, completedDate: string | null): boolean {
  if (!claimedDate || completedDate) return false;
  const claimed = new Date(claimedDate);
  if (isNaN(claimed.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  claimed.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - claimed.getTime()) / MS_PER_DAY) > STALE_DAYS;
}

const ALL_STATUSES: Task['status'][] = ['Assigned', 'Not Started', 'In Progress', 'Completed', 'Blocked'];

const normalizeTask = (task: Partial<Task> & { claimedAssignedDate?: string | null }): Task => ({
  id: task.id || '',
  taskList: task.taskList || '',
  taskOwner: task.taskOwner || '',
  status: (task.status as Task['status']) || 'Not Started',
  claimedDate: task.claimedDate || task.claimedAssignedDate || null,
  dueDate: task.dueDate || null,
  completedDate: task.completedDate || null,
  notes: task.notes || '',
});

const emptyForm = {
  taskList: '',
  taskOwner: '',
  status: 'Assigned' as Task['status'],
  claimedDate: '',
  dueDate: '',
  notes: '',
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [taskData, supData] = await Promise.all([
        api.tasks.getAll(),
        api.supervisors.getAll(),
      ]);
      const normalized = Array.isArray(taskData) ? taskData.map(normalizeTask) : [];
      setTasks(normalized.length ? normalized : mockTasks);
      setSupervisors(Array.isArray(supData) ? (supData as any[]).map(s => ({
        name: s.name,
        rank: s.rank || '',
        isOnLOA: s.onLOA,
        loaStartDate: null,
        loaEndDate: null,
        totalTasksCompleted: s.totalTasksCompleted || 0,
        monthlyTasksCompleted: s.monthlyTasksCompleted || 0,
      })) : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Using mock data – backend not available');
    } finally {
      setIsLoading(false);
    }
  }

  // Active (non-completed) task count per supervisor, for the dropdown hint
  const activeTaskCount = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.status !== 'Completed' && t.taskOwner) {
        counts[t.taskOwner] = (counts[t.taskOwner] || 0) + 1;
      }
    });
    return counts;
  }, [tasks]);

  // Supervisors available for assignment (not on LOA), sorted lightest load first
  const availableSupervisors = useMemo(() =>
    supervisors
      .filter(s => !s.isOnLOA)
      .sort((a, b) => (activeTaskCount[a.name] || 0) - (activeTaskCount[b.name] || 0)),
    [supervisors, activeTaskCount]
  );

  // Set of names that are currently on LOA (for flagging tasks)
  const onLoaNames = useMemo(() =>
    new Set(supervisors.filter(s => s.isOnLOA).map(s => s.name)),
    [supervisors]
  );

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const completedDate = newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : '';
      const updated = await api.tasks.update(taskId, { status: newStatus, completedDate });
      const normalized = normalizeTask(updated);
      setTasks(prev => prev.map(t => (t.id === taskId ? normalized : t)));
    } catch (err) {
      console.error('Failed to update task status:', err);
      alert('Failed to update task status. Please check your connection and try again.');
    }
  };

  const handleOwnerChange = async (taskId: string, newOwner: string) => {
    try {
      const updated = await api.tasks.update(taskId, { taskOwner: newOwner });
      const normalized = normalizeTask(updated);
      setTasks(prev => prev.map(t => (t.id === taskId ? normalized : t)));
    } catch (err) {
      console.error('Failed to update task owner:', err);
      alert('Failed to update task owner. Please check your connection and try again.');
    }
  };

  const handleAddTask = async () => {
    if (!formData.taskList.trim()) { alert('Task name is required.'); return; }
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
      await fetchAll();
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sorted + filtered task list
  const displayedTasks = useMemo(() => {
    let list = showCompleted ? tasks : tasks.filter(t => t.status !== 'Completed');
    // Sort by spreadsheet row order (numeric part of id), falling back to index
    list = [...list].sort((a, b) => {
      const aNum = parseInt(a.id.replace(/\D/g, '')) || 0;
      const bNum = parseInt(b.id.replace(/\D/g, '')) || 0;
      return sortAsc ? aNum - bNum : bNum - aNum;
    });
    return list;
  }, [tasks, showCompleted, sortAsc]);

  const selectClass = "px-2 py-1 rounded border border-border bg-background text-foreground text-sm w-full";

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <CardTitle>Tasks</CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-sm cursor-pointer text-foreground">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={e => setShowCompleted(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                Show completed
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortAsc(p => !p)}
                title={sortAsc ? 'Showing oldest first — click to reverse' : 'Showing newest first — click to reverse'}
              >
                {sortAsc ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                {sortAsc ? 'Ascending' : 'Descending'}
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-muted-foreground mt-2">⚠️ {error}</p>}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading tasks…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Claimed Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedTasks.map(task => {
                  const overdue = isOverdue(task.dueDate, task.completedDate);
                  const stale = isStale(task.claimedDate, task.completedDate);
                  const ownerOnLOA = task.taskOwner && onLoaNames.has(task.taskOwner);
                  const highlight = overdue || stale;

                  return (
                    <TableRow
                      key={task.id}
                      style={highlight ? { backgroundColor: 'var(--warning-bg)' } : undefined}
                    >
                      {/* Task name */}
                      <TableCell style={highlight ? { color: 'var(--warning-text)', fontWeight: 600 } : undefined}>
                        {task.taskList}
                      </TableCell>

                      {/* Owner — inline reassignable dropdown */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <select
                            value={task.taskOwner}
                            onChange={e => handleOwnerChange(task.id, e.target.value)}
                            className={selectClass}
                            style={{ minWidth: '140px' }}
                          >
                            {/* Keep the current owner visible even if on LOA */}
                            {task.taskOwner && onLoaNames.has(task.taskOwner) && (
                              <option value={task.taskOwner}>{task.taskOwner} (on LOA)</option>
                            )}
                            {task.taskOwner && !onLoaNames.has(task.taskOwner) && (
                              <option value={task.taskOwner}>{task.taskOwner}</option>
                            )}
                            {/* Divider + available supervisors sorted by active task count */}
                            {availableSupervisors
                              .filter(s => s.name !== task.taskOwner)
                              .map(s => (
                                <option key={s.name} value={s.name}>
                                  {s.name} ({activeTaskCount[s.name] || 0} active)
                                </option>
                              ))}
                            <option value="">— Unassigned —</option>
                          </select>
                          {ownerOnLOA && (
                            <span title="This supervisor is currently on LOA">
                              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <select
                          value={task.status}
                          onChange={e => handleStatusChange(task.id, e.target.value as Task['status'])}
                          className={selectClass}
                        >
                          {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </TableCell>

                      <TableCell style={stale ? { color: 'var(--warning-text)', fontWeight: 500 } : undefined}>
                        {task.claimedDate || '—'}
                      </TableCell>
                      <TableCell style={overdue ? { color: 'var(--warning-text)', fontWeight: 500 } : undefined}>
                        {task.dueDate || '—'}
                      </TableCell>
                      <TableCell>{task.completedDate || '—'}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={task.notes}>{task.notes}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Add Task Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>
              Owners are sorted by current active task load — lightest first.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="taskList">Task Name *</Label>
              <Input
                id="taskList"
                value={formData.taskList}
                onChange={e => setFormData({ ...formData, taskList: e.target.value })}
                placeholder="Enter task name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="taskOwner">Assign To</Label>
              <select
                id="taskOwner"
                value={formData.taskOwner}
                onChange={e => setFormData({ ...formData, taskOwner: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              >
                <option value="">— Unassigned —</option>
                {availableSupervisors.map(s => (
                  <option key={s.name} value={s.name}>
                    {s.name} ({activeTaskCount[s.name] || 0} active tasks)
                  </option>
                ))}
              </select>
              {availableSupervisors.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No available supervisors — all may be on LOA or the backend is unavailable.
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm"
              >
                {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="claimedDate">Claimed Date</Label>
                <Input id="claimedDate" type="date" value={formData.claimedDate}
                  onChange={e => setFormData({ ...formData, claimedDate: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={formData.dueDate}
                  onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
              {isSubmitting ? 'Adding…' : 'Add Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
