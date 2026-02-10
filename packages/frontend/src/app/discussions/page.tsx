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
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { mockDiscussions } from '@/lib/mockData';
import { Discussion } from '@/types';
import { ExternalLink, ChevronDown } from 'lucide-react';
import { api } from '@/lib/api';

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  async function fetchDiscussions() {
    try {
      const data = await api.discussions.getAll();
      setDiscussions(data as Discussion[]);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch discussions:', err);
      setError('Using mock data - backend not available');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFeedbackToggle(
    discussionId: string,
    supervisorName: string,
    currentValue: boolean
  ) {
    try {
      await api.discussions.updateFeedback(discussionId, supervisorName, !currentValue);
      await fetchDiscussions();
    } catch (err: any) {
      console.error('Failed to update feedback:', err);
      alert(`Failed to update feedback: ${err.message || 'Unknown error'}`);
    }
  }

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Discussions</CardTitle>
          {error && (
            <p className="text-sm text-muted-foreground mt-2">
              ⚠️ {error}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading discussions...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date Posted</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Direct Link</TableHead>
                  <TableHead>Supervisor Responses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discussions.map((discussion) => {
                  const supervisors = Object.entries(discussion.supervisorFeedback);
                  const totalSupervisors = supervisors.length;
                  const responsesReceived = supervisors.filter(([_, completed]) => completed).length;
                  
                  return (
                    <TableRow key={discussion.id}>
                      <TableCell>{discussion.datePosted}</TableCell>
                      <TableCell className="font-medium">{discussion.topic}</TableCell>
                      <TableCell>
                        <a
                          href={discussion.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                              <Badge variant={responsesReceived === totalSupervisors ? 'success' : 'warning'}>
                                {responsesReceived} / {totalSupervisors} Responses
                              </Badge>
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium text-sm mb-2">Supervisor Responses</h4>
                                <p className="text-xs text-muted-foreground mb-3">
                                  Check off supervisors who have provided feedback
                                </p>
                              </div>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {supervisors.map(([name, completed]) => (
                                  <div key={name} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${discussion.id}-${name}`}
                                      checked={completed}
                                      onCheckedChange={() =>
                                        handleFeedbackToggle(discussion.id, name, completed)
                                      }
                                    />
                                    <label
                                      htmlFor={`${discussion.id}-${name}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                    >
                                      {name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
