"use client"

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockSupervisors } from '@/lib/mockData';
import { Supervisor, LOARecord, Task } from '@/types';
import { api } from '@/lib/api';
import { Plus, Trash2, PlaneLanding, PlaneTakeoff } from 'lucide-react';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>(mockSupervisors);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaRecords, setLoaRecords] = useState<LOARecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add supervisor dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRank, setNewRank] = useState('');

  // LOA dialog (used for both putting ON and confirming END)
  const [loaDialogMode, setLoaDialogMode] = useState<'start' | 'end' | null>(null);
  const [loaTarget, setLoaTarget] = useState<Supervisor | null>(null);
  const [loaStartDate, setLoaStartDate] = useState('');
  const [loaEndDate, setLoaEndDate] = useState('');
  const [isLoaSubmitting, setIsLoaSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    try {
      const [supData, taskData, loaData] = await Promise.all([
        api.supervisors.getAll(),
        api.tasks.getAll(),
        api.loa.getAll(),
      ]);
      setSupervisors((supData as any[]).map(s => ({
        name: s.name,
        rank: s.rank || '',
        isOnLOA: s.onLOA,
        loaStartDate: null,
        loaEndDate: null,
        totalTasksCompleted: s.totalTasksCompleted || 0,
        monthlyTasksCompleted: s.monthlyTasksCompleted || 0,
      })));
      setTasks(Array.isArray(taskData) ? taskData as Task[] : []);
      setLoaRecords(Array.isArray(loaData) ? loaData as LOARecord[] : []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Using mock data – backend not available');
    } finally {
      setIsLoading(false);
    }
  }

  // Active (non-completed) task count per supervisor
  const activeTaskCount = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => {
      if (t.status !== 'Completed' && t.taskOwner) {
        counts[t.taskOwner] = (counts[t.taskOwner] || 0) + 1;
      }
    });
    return counts;
  }, [tasks]);

  // ── Add supervisor ─────────────────────────────────────────────────────────
  async function handleAddSupervisor() {
    if (!newName.trim()) { alert('Please enter a supervisor name'); return; }
    try {
      await api.supervisors.add({ name: newName.trim(), rank: newRank.trim() || undefined });
      setIsAddDialogOpen(false);
      setNewName(''); setNewRank('');
      await fetchAll();
    } catch (err: any) {
      alert(`Failed to add supervisor: ${err.message || 'Unknown error'}`);
    }
  }

  // ── Remove supervisor ──────────────────────────────────────────────────────
  async function handleRemove(name: string) {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await api.supervisors.remove(name);
      await fetchAll();
    } catch (err: any) {
      alert(`Failed to remove supervisor: ${err.message || 'Unknown error'}`);
    }
  }

  // ── LOA: start ────────────────────────────────────────────────────────────
  function openStartLOA(supervisor: Supervisor) {
    setLoaTarget(supervisor);
    setLoaStartDate(new Date().toISOString().split('T')[0]);
    setLoaEndDate('');
    setLoaDialogMode('start');
  }

  async function handleStartLOA() {
    if (!loaTarget || !loaStartDate || !loaEndDate) {
      alert('Both start and end dates are required.');
      return;
    }
    if (new Date(loaEndDate) < new Date(loaStartDate)) {
      alert('End date cannot be before start date.');
      return;
    }
    setIsLoaSubmitting(true);
    try {
      await api.loa.create({
        supervisorName: loaTarget.name,
        startDate: loaStartDate,
        endDate: loaEndDate,
        reason: '',
        status: 'Active',
      });
      setLoaDialogMode(null);
      await fetchAll();
    } catch (err: any) {
      alert(`Failed to put supervisor on LOA: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoaSubmitting(false);
    }
  }

  // ── LOA: end ─────────────────────────────────────────────────────────────
  function openEndLOA(supervisor: Supervisor) {
    setLoaTarget(supervisor);
    setLoaDialogMode('end');
  }

  async function handleEndLOA() {
    if (!loaTarget) return;
    const activeRecord = loaRecords.find(
      r => r.supervisorName === loaTarget.name && r.status === 'Active'
    );
    if (!activeRecord) {
      alert('Could not find the active LOA record. Please refresh and try again.');
      return;
    }
    setIsLoaSubmitting(true);
    try {
      await api.loa.delete(activeRecord.id);
      setLoaDialogMode(null);
      await fetchAll();
    } catch (err: any) {
      alert(`Failed to end LOA: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoaSubmitting(false);
    }
  }

  const inputClass = "w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm";

  return (
    <div className="p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Supervisors</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Active tasks shown to guide assignment — fewer is lighter load.
            </p>
            {error && <p className="text-sm text-muted-foreground mt-1">⚠️ {error}</p>}
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supervisor
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading supervisors…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Active Tasks</TableHead>
                  <TableHead>Total Completed</TableHead>
                  <TableHead>Monthly Completed</TableHead>
                  <TableHead>LOA Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supervisors.map(supervisor => {
                  const active = activeTaskCount[supervisor.name] || 0;
                  const activeLOA = loaRecords.find(
                    r => r.supervisorName === supervisor.name && r.status === 'Active'
                  );

                  return (
                    <TableRow key={supervisor.name}>
                      <TableCell className="font-medium">{supervisor.name}</TableCell>
                      <TableCell>{supervisor.rank || '—'}</TableCell>

                      {/* Active task count — highlighted if heavy load */}
                      <TableCell>
                        <span
                          className={`font-semibold tabular-nums ${
                            active >= 5 ? 'text-amber-500' : 'text-foreground'
                          }`}
                        >
                          {active}
                        </span>
                      </TableCell>

                      <TableCell>{supervisor.totalTasksCompleted}</TableCell>
                      <TableCell>{supervisor.monthlyTasksCompleted}</TableCell>

                      {/* LOA status + dates if on LOA */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={supervisor.isOnLOA ? 'warning' : 'success'}>
                            {supervisor.isOnLOA ? 'On LOA' : 'Available'}
                          </Badge>
                          {supervisor.isOnLOA && activeLOA && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {activeLOA.startDate} → {activeLOA.endDate || 'TBD'}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {supervisor.isOnLOA ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEndLOA(supervisor)}
                              className="text-xs"
                            >
                              <PlaneTakeoff className="h-3 w-3 mr-1" />
                              End LOA
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openStartLOA(supervisor)}
                              className="text-xs"
                            >
                              <PlaneLanding className="h-3 w-3 mr-1" />
                              Put on LOA
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(supervisor.name)}
                            title="Remove supervisor"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Add Supervisor Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supervisor</DialogTitle>
            <DialogDescription>Add a new supervisor to the system.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="supName">Name *</Label>
              <Input id="supName" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supRank">Rank (optional)</Label>
              <Input id="supRank" value={newRank} onChange={e => setNewRank(e.target.value)} placeholder="e.g. Senior Paramedic" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSupervisor}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Start LOA Dialog ── */}
      <Dialog open={loaDialogMode === 'start'} onOpenChange={open => !open && setLoaDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Put {loaTarget?.name} on LOA</DialogTitle>
            <DialogDescription>
              This supervisor will be hidden from task assignment until their LOA ends.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="loaStart">Start Date *</Label>
              <input
                id="loaStart"
                type="date"
                value={loaStartDate}
                onChange={e => setLoaStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="loaEnd">Expected Return Date *</Label>
              <input
                id="loaEnd"
                type="date"
                value={loaEndDate}
                onChange={e => setLoaEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoaDialogMode(null)}>Cancel</Button>
            <Button onClick={handleStartLOA} disabled={isLoaSubmitting}>
              {isLoaSubmitting ? 'Saving…' : 'Confirm LOA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── End LOA Dialog ── */}
      <Dialog open={loaDialogMode === 'end'} onOpenChange={open => !open && setLoaDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End LOA for {loaTarget?.name}?</DialogTitle>
            <DialogDescription>
              This will mark them as available again and they will reappear in task assignment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoaDialogMode(null)}>Cancel</Button>
            <Button onClick={handleEndLOA} disabled={isLoaSubmitting}>
              {isLoaSubmitting ? 'Saving…' : 'End LOA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
