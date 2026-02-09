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
import { LOARecord } from '@/types';
import { api } from '@/lib/api';
import { Trash2, Edit2, Plus } from 'lucide-react';

export default function LOAPage() {
  const [loaRecords, setLoaRecords] = useState<LOARecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LOARecord | null>(null);
  const [formData, setFormData] = useState({
    supervisorName: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Active' as LOARecord['status'],
  });

  useEffect(() => {
    fetchLOARecords();
  }, []);

  const fetchLOARecords = async () => {
    try {
      const data = await api.loa.getAll();
      setLoaRecords(data as LOARecord[]);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch LOA records:', err);
      setError('Failed to load LOA records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        alert('End date cannot be before start date.');
        return;
      }
    }
    
    try {
      if (editingRecord) {
        await api.loa.update(editingRecord.id, formData);
      } else {
        await api.loa.create(formData);
      }
      await fetchLOARecords();
      setShowForm(false);
      setEditingRecord(null);
      setFormData({
        supervisorName: '',
        startDate: '',
        endDate: '',
        reason: '',
        status: 'Active',
      });
    } catch (err) {
      console.error('Failed to save LOA record:', err);
      alert('Failed to save LOA record. Please check your input and try again.');
    }
  };

  const handleEdit = (record: LOARecord) => {
    setEditingRecord(record);
    setFormData({
      supervisorName: record.supervisorName,
      startDate: record.startDate,
      endDate: record.endDate,
      reason: record.reason,
      status: record.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this LOA record?')) {
      return;
    }
    try {
      await api.loa.delete(id);
      await fetchLOARecords();
    } catch (err) {
      console.error('Failed to delete LOA record:', err);
      alert('Failed to delete LOA record. Please check your connection and try again.');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRecord(null);
    setFormData({
      supervisorName: '',
      startDate: '',
      endDate: '',
      reason: '',
      status: 'Active',
    });
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Leave of Absence (LOA) Management</CardTitle>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Add LOA
              </button>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ {error}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/50">
              <h3 className="text-lg font-semibold mb-4">
                {editingRecord ? 'Edit LOA Record' : 'Add New LOA Record'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Supervisor Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.supervisorName}
                    onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    placeholder="Enter supervisor name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as LOARecord['status'] })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Reason
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                    placeholder="Enter reason (optional)"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingRecord ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading LOA records...
            </div>
          ) : loaRecords.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No LOA records found. Click &quot;Add LOA&quot; to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supervisor Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loaRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.supervisorName}</TableCell>
                    <TableCell>{record.startDate}</TableCell>
                    <TableCell>{record.endDate}</TableCell>
                    <TableCell>{record.reason || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'Active' ? 'default' : 'secondary'}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1 hover:bg-muted rounded"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="p-1 hover:bg-muted rounded text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
