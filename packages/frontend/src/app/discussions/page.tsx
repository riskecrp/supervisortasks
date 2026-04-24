"use client"

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mockDiscussions } from '@/lib/mockData';
import { Discussion } from '@/types';
import { ExternalLink, ChevronDown, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { api } from '@/lib/api';

const emptyForm = {
  datePosted: new Date().toISOString().split('T')[0],
  topic: '',
  link: '',
};

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Default: newest first (false = descending)
  const [sortAsc, setSortAsc] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchDiscussions(); }, []);

  async function fetchDiscussions() {
    try {
      const data = await api.discussions.getAll();
      setDiscussions(data as Discussion[]);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
      setError('Using mock data – backend not available');
    } finally {
      setIsLoading(false);
    }
  }

  // Optimistic update: flip the checkbox immediately in local state,
  // write to the sheet in the background, revert only if it fails.
  const handleFeedbackToggle = useCallback(async (
    discussionId: string,
    supervisorName: string,
    currentValue: boolean,
  ) => {
    const newValue = !currentValue;

    // 1. Apply optimistic update — UI responds instantly
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id !== discussionId) return d;
        return {
          ...d,
          supervisorFeedback: {
            ...d.supervisorFeedback,
            [supervisorName]: newValue,
          },
        };
      })
    );

    // 2. Persist to Google Sheet
    try {
      await api.discussions.updateFeedback(discussionId, supervisorName, newValue);
    } catch (err: any) {
      // 3. Revert on failure so the sheet and UI stay in sync
      console.error('Failed to update feedback:', err);
      setDiscussions(prev =>
        prev.map(d => {
          if (d.id !== discussionId) return d;
          return {
            ...d,
            supervisorFeedback: {
              ...d.supervisorFeedback,
              [supervisorName]: currentValue,
            },
          };
        })
      );
      alert(`Failed to save feedback for ${supervisorName}. Changes have been reverted.`);
    }
  }, []);

  async function handleAddDiscussion() {
    if (!formData.topic.trim()) { alert('Topic is required.'); return; }
    setIsSubmitting(true);
    try {
      await api.discussions.create({
        datePosted: formData.datePosted,
        topic: formData.topic.trim(),
        link: formData.link.trim(),
        supervisorFeedback: {},
      });
      setIsAddDialogOpen(false);
      setFormData(emptyForm);
      await fetchDiscussions();
    } catch (err) {
      console.error('Failed to create discussion:', err);
      alert('Failed to create discussion. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Sort by datePosted; fall back to id order if dates are equal
  const sortedDiscussions = useMemo(() => {
    return [...discussions].sort((a, b) => {
      const dateA = a.datePosted ? new Date(a.datePosted).getTime() : 0;
      const dateB = b.datePosted ? new Date(b.datePosted).getTime() : 0;
      const diff = dateA - dateB;
      if (diff !== 0) return sortAsc ? diff : -diff;
      const idA = parseInt(a.id.replace(/\D/g, '')) || 0;
      const idB = parseInt(b.id.replace(/\D/g, '')) || 0;
      return sortAsc ? idA - idB : idB - idA;
    });
  }, [discussions, sortAsc]);

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <CardTitle>Discussions</CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortAsc(p => !p)}
                title={sortAsc ? 'Showing oldest first — click to reverse' : 'Showing newest first — click to reverse'}
              >
                {sortAsc ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                {sortAsc ? 'Oldest first' : 'Newest first'}
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Discussion
              </Button>
            </div>
          </div>
          {error && <p className="text-sm text-muted-foreground mt-2">⚠️ {error}</p>}
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading discussions…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Posted</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Supervisor Responses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDiscussions.map(discussion => {
                  const supervisors = Object.entries(discussion.supervisorFeedback);
                  const total = supervisors.length;
                  const received = supervisors.filter(([, done]) => done).length;

                  return (
                    <TableRow key={discussion.id}>
                      <TableCell className="whitespace-nowrap">{discussion.datePosted}</TableCell>
                      <TableCell className="font-medium">{discussion.topic}</TableCell>
                      <TableCell>
                        {discussion.link ? (
                          <a
                            href={discussion.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {total === 0 ? (
                          <span className="text-muted-foreground text-sm">No supervisors assigned</span>
                        ) : (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-between">
                                <Badge variant={received === total ? 'success' : 'warning'}>
                                  {received} / {total} Responses
                                </Badge>
                                <ChevronDown className="h-4 w-4 ml-2" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" onInteractOutside={e => e.preventDefault()}>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium text-sm mb-1">Supervisor Responses</h4>
                                  <p className="text-xs text-muted-foreground">
                                    Check off supervisors who have responded
                                  </p>
                                </div>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {supervisors.map(([name, completed]) => (
                                    <div key={name} className="flex items-center space-x-3">
                                      <Checkbox
                                        id={`${discussion.id}-${name}`}
                                        checked={completed}
                                        onCheckedChange={() =>
                                          handleFeedbackToggle(discussion.id, name, completed)
                                        }
                                      />
                                      <label
                                        htmlFor={`${discussion.id}-${name}`}
                                        className="text-sm font-medium cursor-pointer select-none flex-1"
                                      >
                                        {name}
                                      </label>
                                      {completed && (
                                        <span className="text-xs text-green-600 dark:text-green-400">✓</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── Add Discussion Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Discussion</DialogTitle>
            <DialogDescription>
              Supervisor feedback columns are added automatically from your spreadsheet headers.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Discussion topic or title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="datePosted">Date Posted</Label>
              <Input
                id="datePosted"
                type="date"
                value={formData.datePosted}
                onChange={e => setFormData({ ...formData, datePosted: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link">Link (optional)</Label>
              <Input
                id="link"
                type="url"
                value={formData.link}
                onChange={e => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); setFormData(emptyForm); }}>
              Cancel
            </Button>
            <Button onClick={handleAddDiscussion} disabled={isSubmitting}>
              {isSubmitting ? 'Adding…' : 'Add Discussion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
