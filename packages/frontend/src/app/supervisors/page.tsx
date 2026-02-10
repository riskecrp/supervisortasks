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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockSupervisors } from '@/lib/mockData';
import { Supervisor, LOARecord } from '@/types';
import { api } from '@/lib/api';
import { Plus, Trash2, Calendar } from 'lucide-react';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>(mockSupervisors);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLOADialogOpen, setIsLOADialogOpen] = useState(false);
  const [newSupervisorName, setNewSupervisorName] = useState('');
  const [newSupervisorRank, setNewSupervisorRank] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null);
  const [loaRecords, setLoaRecords] = useState<LOARecord[]>([]);

  useEffect(() => {
    fetchSupervisors();
    fetchLOARecords();
  }, []);

  async function fetchSupervisors() {
    try {
      const data = await api.supervisors.getAll();
      // Map backend format to frontend format
      const mappedData = (data as any[]).map((sup: any) => ({
        name: sup.name,
        rank: sup.rank || '',
        isOnLOA: sup.onLOA,
        loaStartDate: null,
        loaEndDate: null,
        totalTasksCompleted: sup.totalTasksCompleted || 0,
        monthlyTasksCompleted: sup.monthlyTasksCompleted || 0,
      }));
      setSupervisors(mappedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch supervisors:', err);
      setError('Using mock data - backend not available');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchLOARecords() {
    try {
      const data = await api.loa.getAll();
      setLoaRecords(data as LOARecord[]);
    } catch (err) {
      console.error('Failed to fetch LOA records:', err);
    }
  }

  async function handleAddSupervisor() {
    if (!newSupervisorName.trim()) {
      alert('Please enter a supervisor name');
      return;
    }

    try {
      await api.supervisors.add({
        name: newSupervisorName.trim(),
        rank: newSupervisorRank.trim() || undefined,
      });
      setIsAddDialogOpen(false);
      setNewSupervisorName('');
      setNewSupervisorRank('');
      await fetchSupervisors();
    } catch (err: any) {
      console.error('Failed to add supervisor:', err);
      alert(`Failed to add supervisor: ${err.message || 'Unknown error'}`);
    }
  }

  async function handleRemoveSupervisor(name: string) {
    if (!confirm(`Are you sure you want to remove ${name}?`)) {
      return;
    }

    try {
      await api.supervisors.remove(name);
      await fetchSupervisors();
    } catch (err: any) {
      console.error('Failed to remove supervisor:', err);
      alert(`Failed to remove supervisor: ${err.message || 'Unknown error'}`);
    }
  }

  async function handleRemoveLOA(loaId: string) {
    if (!confirm('Are you sure you want to end this LOA?')) {
      return;
    }

    try {
      await api.loa.delete(loaId);
      await fetchSupervisors();
      await fetchLOARecords();
      setIsLOADialogOpen(false);
    } catch (err: any) {
      console.error('Failed to remove LOA:', err);
      alert(`Failed to remove LOA: ${err.message || 'Unknown error'}`);
    }
  }

  function openLOADialog(supervisor: Supervisor) {
    setSelectedSupervisor(supervisor);
    setIsLOADialogOpen(true);
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Supervisors</CardTitle>
            {error && (
              <p className="text-sm text-muted-foreground mt-2">
                ⚠️ {error}
              </p>
            )}
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supervisor
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading supervisors...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Total Completed</TableHead>
                  <TableHead>Monthly Completed</TableHead>
                  <TableHead>LOA Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {supervisors.map((supervisor) => {
                  const activeLOA = loaRecords.find(
                    (loa) => loa.supervisorName === supervisor.name && loa.status === 'Active'
                  );
                  
                  return (
                    <TableRow key={supervisor.name}>
                      <TableCell className="font-medium">{supervisor.name}</TableCell>
                      <TableCell>{supervisor.rank}</TableCell>
                      <TableCell>{supervisor.totalTasksCompleted}</TableCell>
                      <TableCell>{supervisor.monthlyTasksCompleted}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={supervisor.isOnLOA ? 'warning' : 'success'}>
                            {supervisor.isOnLOA ? 'On Leave' : 'Active'}
                          </Badge>
                          {supervisor.isOnLOA && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openLOADialog(supervisor)}
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveSupervisor(supervisor.name)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Supervisor Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supervisor</DialogTitle>
            <DialogDescription>
              Add a new supervisor to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={newSupervisorName}
                onChange={(e) => setNewSupervisorName(e.target.value)}
                placeholder="Enter supervisor name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rank">Rank (Optional)</Label>
              <Input
                id="rank"
                value={newSupervisorRank}
                onChange={(e) => setNewSupervisorRank(e.target.value)}
                placeholder="Enter rank"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSupervisor}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LOA Management Dialog */}
      <Dialog open={isLOADialogOpen} onOpenChange={setIsLOADialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage LOA - {selectedSupervisor?.name}</DialogTitle>
            <DialogDescription>
              View and manage Leave of Absence for this supervisor.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loaRecords
              .filter((loa) => loa.supervisorName === selectedSupervisor?.name && loa.status === 'Active')
              .map((loa) => (
                <div key={loa.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium">Active LOA</p>
                      {loa.startDate && (
                        <p className="text-sm text-muted-foreground">Start: {loa.startDate}</p>
                      )}
                      {loa.endDate && (
                        <p className="text-sm text-muted-foreground">End: {loa.endDate}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveLOA(loa.id)}
                    >
                      End LOA
                    </Button>
                  </div>
                </div>
              ))}
            {!loaRecords.some(
              (loa) => loa.supervisorName === selectedSupervisor?.name && loa.status === 'Active'
            ) && (
              <p className="text-sm text-muted-foreground">No active LOA records found.</p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setIsLOADialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
