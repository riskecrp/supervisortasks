import { useState } from 'react';
import { Plus, Pencil, Trash2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Loading } from '../components/ui/Loading';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useAvailableStatuses } from '../hooks/useTasks';
import { useSupervisors } from '../hooks/useSupervisors';
import type { Task } from '../types';

const TasksPage = () => {
  const { data: tasks, isLoading } = useTasks();
  const { data: supervisors } = useSupervisors();
  const { data: availableStatuses } = useAvailableStatuses();
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
    status: 'Not Started',
  });

  const activeSupervisors = supervisors?.filter(s => s.active) || [];
  const statuses = availableStatuses || ['Not Started', 'In Progress', 'Completed'];

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
        status: statuses[0] || 'Not Started',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({ task: '', claimedBy: '', status: statuses[0] || 'Not Started' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if status is changing to "Completed"
    const isNewlyCompleted = formData.status === 'Completed' && 
                            (!editingTask || editingTask.status !== 'Completed');
    
    // Clear completed date if status is no longer "Completed"
    const isNoLongerCompleted = editingTask && 
                                editingTask.status === 'Completed' && 
                                formData.status !== 'Completed';
    
    const taskData = {
      ...formData,
      completedDate: isNewlyCompleted 
        ? new Date().toISOString().split('T')[0] 
        : (isNoLongerCompleted ? undefined : editingTask?.completedDate),
      createdDate: editingTask?.createdDate || new Date().toISOString().split('T')[0],
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

  const isTaskOverdue = (task: Task): boolean => {
    // Task is overdue if: not completed AND current date > (created date + 5 days)
    if (task.status === 'Completed') {
      return false;
    }
    
    const createdDate = new Date(task.createdDate);
    const currentDate = new Date();
    const daysElapsed = Math.floor((currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysElapsed > 5;
  };

  const getStatusBadge = (status: string) => {
    // Default to 'default' variant for unknown statuses
    const variants: Record<string, 'default' | 'warning' | 'success'> = {
      'Not Started': 'default',
      'In Progress': 'warning',
      'Completed': 'success',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (isLoading) {
    return <Loading size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-2">Manage supervisor tasks and assignments</p>
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
        <label htmlFor="showCompleted" className="text-sm font-medium text-gray-700 cursor-pointer">
          Show Completed Tasks
        </label>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task List</CardTitle>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Statuses' },
                  ...statuses.map(s => ({ value: s, label: s })),
                ]}
                className="w-40"
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
                <TableHead>Task</TableHead>
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
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue = isTaskOverdue(task);
                  return (
                    <TableRow 
                      key={task.id}
                      className={isOverdue ? 'bg-red-50 hover:bg-red-100' : ''}
                    >
                      <TableCell className="font-medium">{task.task}</TableCell>
                      <TableCell>{task.claimedBy}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
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
                            <Trash2 className="w-4 h-4 text-red-600" />
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
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            options={statuses.map(s => ({ value: s, label: s }))}
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
