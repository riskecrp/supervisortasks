import { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Loading } from '../components/ui/Loading';
import { useDiscussions, useCreateDiscussion, useUpdateDiscussionFeedback, useDeleteDiscussion } from '../hooks/useDiscussions';
import { useSupervisors } from '../hooks/useSupervisors';

const DiscussionsPage = () => {
  const { data: discussions, isLoading } = useDiscussions();
  const { data: supervisors } = useSupervisors();
  const createDiscussion = useCreateDiscussion();
  const updateFeedback = useUpdateDiscussionFeedback();
  const deleteDiscussion = useDeleteDiscussion();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    topic: '',
    link: '',
    datePosted: new Date().toISOString().split('T')[0],
  });

  const activeSupervisors = supervisors?.filter(s => s.active) || [];

  const handleOpenModal = () => {
    setFormData({
      topic: '',
      link: '',
      datePosted: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const supervisorFeedback: Record<string, boolean> = {};
    activeSupervisors.forEach(sup => {
      supervisorFeedback[sup.name] = false;
    });

    await createDiscussion.mutateAsync({
      ...formData,
      supervisorFeedback,
    });
    handleCloseModal();
  };

  const handleToggleFeedback = async (discussionId: string, supervisorName: string, currentStatus: boolean) => {
    await updateFeedback.mutateAsync({
      id: discussionId,
      supervisorName,
      completed: !currentStatus,
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this discussion?')) {
      await deleteDiscussion.mutateAsync(id);
    }
  };

  if (isLoading) {
    return <Loading size="lg" className="mt-20" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Discussions</h1>
          <p className="text-gray-400 mt-2">Track supervisor feedback on discussions</p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Discussion
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discussion Feedback Tracker</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date</TableHead>
                  <TableHead className="min-w-[300px]">Topic</TableHead>
                  <TableHead>Link</TableHead>
                  {activeSupervisors.map(sup => (
                    <TableHead key={sup.name} className="text-center whitespace-nowrap">
                      {sup.name}
                    </TableHead>
                  ))}
                  <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!discussions || discussions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeSupervisors.length + 4} className="text-center text-gray-400 py-8">
                      No discussions found
                    </TableCell>
                  </TableRow>
                ) : (
                  discussions.map((discussion) => (
                    <TableRow key={discussion.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(discussion.datePosted).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium min-w-[300px]">
                        {discussion.topic}
                      </TableCell>
                      <TableCell>
                        <a
                          href={discussion.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </TableCell>
                      {activeSupervisors.map(sup => {
                        const hasResponded = discussion.supervisorFeedback[sup.name] || false;
                        return (
                          <TableCell key={sup.name} className="text-center">
                            <button
                              onClick={() => handleToggleFeedback(discussion.id, sup.name, hasResponded)}
                              className={`w-6 h-6 rounded border-2 transition-colors ${
                                hasResponded
                                  ? 'bg-green-600 border-green-700'
                                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                              }`}
                            >
                              {hasResponded && (
                                <svg
                                  className="w-full h-full text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={3}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(discussion.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Discussion"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Date Posted"
            type="date"
            value={formData.datePosted}
            onChange={(e) => setFormData({ ...formData, datePosted: e.target.value })}
            required
          />
          <Input
            label="Topic"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            required
          />
          <Input
            label="Link"
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://..."
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DiscussionsPage;
