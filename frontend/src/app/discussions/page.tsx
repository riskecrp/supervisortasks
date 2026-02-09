"use client"

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
import { ExternalLink } from 'lucide-react';

export default function DiscussionsPage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Discussions</CardTitle>
        </CardHeader>
        <CardContent>
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
              {mockDiscussions.map((discussion) => {
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
        </CardContent>
      </Card>
    </div>
  );
}
