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
import { mockDiscussions } from '@/lib/mockData';
import { Discussion } from '@/types';
import { ExternalLink } from 'lucide-react';
import { api } from '@/lib/api';

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>(mockDiscussions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDiscussions() {
      try {
        const data = await api.discussions.getAll();
        setDiscussions(data as Discussion[]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch discussions:', err);
        setError('Using mock data - backend not available');
        // Keep using mock data as fallback
      } finally {
        setIsLoading(false);
      }
    }

    fetchDiscussions();
  }, []);

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
                  const totalSupervisors = Object.keys(discussion.supervisorResponses).length;
                  const responsesReceived = Object.values(discussion.supervisorResponses).filter(Boolean).length;
                  
                  return (
                    <TableRow key={discussion.id}>
                      <TableCell>{discussion.datePosted}</TableCell>
                      <TableCell className="font-medium">{discussion.topic}</TableCell>
                      <TableCell>
                        <a
                          href={discussion.directLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant={responsesReceived === totalSupervisors ? 'success' : 'warning'}>
                          {responsesReceived} / {totalSupervisors} Responses
                        </Badge>
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
