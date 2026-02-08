import { useState } from 'react';
import { Plus, Pencil, Trash2, Filter, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
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
    taskList: '',
    taskOwner: '',
    status: 'Assigned',
    claimedDate: '',
    dueDate: '',
    notes: '',
  });

  const activeSupervisors = supervisors?.filter(s => s.active) || [];
  const statuses = (availableStatuses && availableStatuses.length > 0) 
    ? availableStatuses 
    : ['Assigned', 'Claimed', 'Pending Reach Out', 'Pending Meeting', 'Pending Employee Reach Out', 'Pending Discussion', 'Completed'];

  const filteredTasks = tasks?.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSupervisor = supervisorFilter === 'all' || task.taskOwner === supervisorFilter;
    const matchesCompleted = showCompleted ? true : task.status !== 'Completed';
    return matchesStatus && matchesSupervisor && matchesCompleted;
  }) || [];

  const handleOpenModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        taskList: task.taskList,
        taskOwner: task.taskOwner,
        status: task.status,
        claimedDate: task.claimedDate,
        dueDate: task.dueDate,
        notes: task.notes,
      });
    } else {
      setEditingTask(null);
      setFormData({
        taskList: '',
        taskOwner: activeSupervisors[0]?.name || '',
        status: statuses[0] || 'Assigned',
        claimedDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormData({ 
      taskList: '', 
      taskOwner: '', 
      status: statuses[0] || 'Assigned',
      claimedDate: '',
      dueDate: '',
      notes: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      ...formData,
      claimedDate: formData.claimedDate || new Date().toISOString().split('T')[0],
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

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateTask.mutate({ 
      id: taskId, 
      updates: { status: newStatus } 
    });
  };

  const isTaskOverdue = (task: Task): boolean => {
    // Task is overdue if: not completed AND has been open for more than 5 days
    if (task.status === 'Completed') {
      return false;
    }
    
    const claimedDate = new Date(task.claimedDate);
    const currentDate = new Date();
    const daysElapsed = Math.floor((currentDate.getTime() - claimedDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysElapsed > 5;
  };

  const getDaysOpen = (task: Task): number => {
    if (task.status === 'Completed') {
      return 0;
    }
    const claimedDate = new Date(task.claimedDate);
    const currentDate = new Date();
    return Math.floor((currentDate.getTime() - claimedDate.getTime()) / (1000 * 60 * 60 * 24));
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Task List</h3>
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
        </div>
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Claimed Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Days Open</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task) => {
                  const isOverdue = isTaskOverdue(task);
                  const daysOpen = getDaysOpen(task);
                  return (
                    <TableRow 
                      key={task.id}
                      className={isOverdue ? 'bg-red-50 hover:bg-red-100' : ''}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isOverdue && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          {task.taskList}
                        </div>
                      </TableCell>
                      <TableCell>{task.taskOwner}</TableCell>
                      <TableCell>
                        <Select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          options={statuses.map(s => ({ value: s, label: s }))}
                          className="min-w-[200px]"
                        />
                      </TableCell>
                      <TableCell>
                        {task.claimedDate
                          ? new Date(task.claimedDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {task.status !== 'Completed' ? (
                          <span className={daysOpen > 5 ? 'text-red-600 font-semibold' : ''}>
                            {daysOpen} {daysOpen === 1 ? 'day' : 'days'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={task.notes}>
                        {task.notes || '-'}
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
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTask ? 'Edit Task' : 'Create Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Description"
            value={formData.taskList}
            onChange={(e) => setFormData({ ...formData, taskList: e.target.value })}
            required
          />
          <Select
            label="Assigned To"
            value={formData.taskOwner}
            onChange={(e) => setFormData({ ...formData, taskOwner: e.target.value })}
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
          <Input
            label="Claimed/Assigned Date"
            type="date"
            value={formData.claimedDate}
            onChange={(e) => setFormData({ ...formData, claimedDate: e.target.value })}
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
          <Input
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Optional notes about this task"
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
