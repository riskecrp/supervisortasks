import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { useLOARecords, useActiveLOARecords, useCreateLOARecord, useUpdateLOARecord, useDeleteLOARecord } from '../hooks/useLOA';
import { useSupervisors } from '../hooks/useSupervisors';
import type { LOARecord } from '../types';

const LOAPage = () => {
  const { data: loaRecords, isLoading } = useLOARecords();
  const { data: activeRecords } = useActiveLOARecords();
  const { data: supervisors } = useSupervisors();
  const createRecord = useCreateLOARecord();
  const updateRecord = useUpdateLOARecord();
  const deleteRecord = useDeleteLOARecord();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<LOARecord | null>(null);
  const [formData, setFormData] = useState({
    supervisorName: '',
    startDate: '',
    endDate: '',
    reason: '',
    status: 'Active' as LOARecord['status'],
  });

  const activeSupervisors = supervisors?.filter(s => s.active) || [];

  const handleOpenModal = (record?: LOARecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        supervisorName: record.supervisorName,
        startDate: record.startDate.split('T')[0],
        endDate: record.endDate.split('T')[0],
        reason: record.reason,
        status: record.status,
      });
    } else {
      setEditingRecord(null);
      setFormData({
        supervisorName: activeSupervisors[0]?.name || '',
        startDate: '',
        endDate: '',
        reason: '',
        status: 'Active',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingRecord) {
      await updateRecord.mutateAsync({ id: editingRecord.id, updates: formData });
    } else {
      await createRecord.mutateAsync(formData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this LOA record?')) {
      await deleteRecord.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="mt-20" />;
  }

  const sortedRecords = [...(loaRecords || [])].sort((a, b) => 
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave of Absence</h1>
          <p className="text-gray-600 mt-2">Track supervisor leave periods</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add LOA Record
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Currently On Leave</p>
              <p className="text-4xl font-bold text-orange-600 mt-2">
                {activeRecords?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Total LOA Records</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">
                {loaRecords?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LOA Records</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supervisor</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No LOA records found
                  </TableCell>
                </TableRow>
              ) : (
                sortedRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.supervisorName}</TableCell>
                    <TableCell>
                      {new Date(record.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(record.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{record.reason}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'Active' ? 'warning' : 'default'}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(record)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingRecord ? 'Edit LOA Record' : 'Create LOA Record'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Supervisor"
            value={formData.supervisorName}
            onChange={(e) => setFormData({ ...formData, supervisorName: e.target.value })}
            options={activeSupervisors.map(s => ({ value: s.name, label: s.name }))}
            required
          />
          <Input
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
          <Input
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
          <Input
            label="Reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as LOARecord['status'] })}
            options={[
              { value: 'Active', label: 'Active' },
              { value: 'Completed', label: 'Completed' },
            ]}
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingRecord ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LOAPage;
