import { useState } from 'react';
import { Plus, Pencil, Trash2, Filter, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Loading } from '../components/ui/Loading';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useSupervisors } from '../hooks/useSupervisors';
import toast from 'react-hot-toast';
import type { Task } from '../types';

const TasksPage = () => {
  const { data: tasks, isLoading } = useTasks();
  const { data: supervisors } = useSupervisors();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supervisorFilter, setSupervisorFilter] = useState<string>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  
  const [formData, setFormData] = useState({
    task: '',
    claimedBy: '',
    status: 'Assigned' as Task['status'],
  });

  const activeSupervisors = supervisors?.filter(s => s.active) || [];

  const statusOptions: Task['status'][] = [
    'Assigned',
    'Claimed',
    'Pending Reach Out',
    'Pending Meeting',
    'Pending Employee Reach Out',
    'Pending Discussion',
    'Completed'
  ];

  const isOverdue = (createdDate: string, status: Task['status']) => {
    if (status === 'Completed') return false;
    const created = new Date(createdDate);
    const now = new Date();
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff > 5;
  };

  const filteredTasks = tasks?.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSupervisor = supervisorFilter === 'all' || task.claimedBy === supervisorFilter;
    const matchesCompleted = showCompleted ? true : task.status !== 'Completed';
    return matchesStatus && matchesSupervisor && matchesCompleted;
  }) || [];

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        task: task.task,
        claimedBy: task.claimedBy,
        status: task.status,
      });
    } else {
      setEditingTask(null);
      setFormData({
        task: '',
        claimedBy: activeSupervisors[0]?.name || '',
        status: 'Assigned',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({ task: '', claimedBy: '', status: 'Assigned' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      completedDate: formData.status === 'Completed' 
        ? (editingTask?.completedDate || new Date().toISOString()) 
        : undefined,
      createdDate: editingTask?.createdDate || new Date().toISOString(),
    };

    if (editingTask) {
      await updateTask.mutateAsync({ id: editingTask.id, updates: taskData });
    } else {
      await createTask.mutateAsync(taskData);
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask.mutateAsync(id);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    const task = tasks?.find(t => t.id === taskId);
    if (!task) return;

    try {
      await updateTask.mutateAsync({
        id: taskId,
        updates: {
          ...task,
          status: newStatus,
          completedDate: newStatus === 'Completed' ? (task.completedDate || new Date().toISOString()) : undefined,
        },
      });
      toast.success('Task status updated successfully');
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleSupervisorChange = async (taskId: string, newSupervisor: string) => {
    const task = tasks?.find(t => t.id === taskId);
    if (!task) return;

    try {
      await updateTask.mutateAsync({
        id: taskId,
        updates: {
          ...task,
          claimedBy: newSupervisor,
        },
      });
      toast.success('Task supervisor updated successfully');
    } catch (error) {
      toast.error('Failed to update task supervisor');
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Tasks</h1>
          <p className="text-gray-400 mt-2">Manage supervisor tasks and assignments</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="checkbox"
          id="showCompleted"
          checked={showCompleted}
          onChange={(e) => setShowCompleted(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="showCompleted" className="text-sm font-medium text-gray-300 cursor-pointer">
          Show Completed Tasks
        </label>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task List</CardTitle>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  ...statusOptions.map(s => ({ value: s, label: s }))
                ]}
                className="w-48"
              />
              <Select
                value={supervisorFilter}
                onChange={(e) => setSupervisorFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Supervisors' },
                  ...activeSupervisors.map(s => ({ value: s.name, label: s.name })),
                ]}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[300px]">Task</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-400 py-8">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => {
                  const overdue = isOverdue(task.createdDate, task.status);
                  return (
                    <TableRow 
                      key={task.id}
                      className={overdue ? 'bg-red-900/20 border-l-4 border-red-500 hover:bg-red-900/30' : ''}
                    >
                      <TableCell className="font-medium min-w-[300px] max-w-[500px]">
                        <div className="flex items-center gap-2">
                          {overdue && <AlertCircle className="w-4 h-4 text-red-400" />}
                          {task.task}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.claimedBy}
                          onChange={(e) => handleSupervisorChange(task.id, e.target.value)}
                          options={activeSupervisors.map(s => ({ value: s.name, label: s.name }))}
                          className="w-56"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                          options={statusOptions.map(s => ({ value: s, label: s }))}
                          className="w-64"
                        />
                      </TableCell>
                      <TableCell className={overdue ? 'text-red-400' : ''}>
                        {new Date(task.createdDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {task.completedDate
                          ? new Date(task.completedDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(task)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(task.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Description"
            value={formData.task}
            onChange={(e) => setFormData({ ...formData, task: e.target.value })}
            required
          />
          <Select
            label="Assigned To"
            value={formData.claimedBy}
            onChange={(e) => setFormData({ ...formData, claimedBy: e.target.value })}
            options={activeSupervisors.map(s => ({ value: s.name, label: s.name }))}
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
            options={statusOptions.map(s => ({ value: s, label: s }))}
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              {editingTask ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TasksPage;
