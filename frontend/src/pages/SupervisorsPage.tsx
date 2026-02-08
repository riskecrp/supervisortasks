import { useState } from 'react';
import { Plus, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { useSupervisors, useAddSupervisor, useRemoveSupervisor } from '../hooks/useSupervisors';

const SupervisorsPage = () => {
  const { data: supervisors, isLoading } = useSupervisors();
  const addSupervisor = useAddSupervisor();
  const removeSupervisor = useRemoveSupervisor();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supervisorName, setSupervisorName] = useState('');

  const handleOpenModal = () => {
    setSupervisorName('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSupervisorName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addSupervisor.mutateAsync(supervisorName.trim());
    handleCloseModal();
  };

  const handleRemove = async (name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name}? This will mark them as inactive.`)) {
      await removeSupervisor.mutateAsync(name);
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="mt-20" />;
  }

  const activeSupervisors = supervisors?.filter(s => s.active) || [];
  const inactiveSupervisors = supervisors?.filter(s => !s.active) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Supervisors</h1>
          <p className="text-gray-400 mt-2">Manage supervisor roster</p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Supervisor
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">Total Supervisors</p>
              <p className="text-4xl font-bold text-gray-100 mt-2">
                {supervisors?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">Active</p>
              <p className="text-4xl font-bold text-green-400 mt-2">
                {activeSupervisors.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-400">On Leave</p>
              <p className="text-4xl font-bold text-orange-400 mt-2">
                {activeSupervisors.filter(s => s.onLOA).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Supervisors</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSupervisors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-gray-400 py-8">
                    No active supervisors
                  </TableCell>
                </TableRow>
              ) : (
                activeSupervisors.map((supervisor) => (
                  <TableRow key={supervisor.name}>
                    <TableCell className="font-medium">{supervisor.name}</TableCell>
                    <TableCell>
                      {supervisor.onLOA ? (
                        <Badge variant="warning">On Leave</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(supervisor.name)}
                      >
                        <UserX className="w-4 h-4 text-red-400" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {inactiveSupervisors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Supervisors</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inactiveSupervisors.map((supervisor) => (
                  <TableRow key={supervisor.name}>
                    <TableCell className="font-medium text-gray-400">
                      {supervisor.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">Inactive</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Supervisor"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Supervisor Name"
            value={supervisorName}
            onChange={(e) => setSupervisorName(e.target.value)}
            placeholder="Enter full name"
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              Add
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SupervisorsPage;
