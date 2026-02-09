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
import { mockSupervisors } from '@/lib/mockData';

export default function SupervisorsPage() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Supervisors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rank</TableHead>
                <TableHead>LOA Status</TableHead>
                <TableHead>LOA Start Date</TableHead>
                <TableHead>LOA End Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSupervisors.map((supervisor) => (
                <TableRow key={supervisor.name}>
                  <TableCell className="font-medium">{supervisor.name}</TableCell>
                  <TableCell>{supervisor.rank}</TableCell>
                  <TableCell>
                    <Badge variant={supervisor.isOnLOA ? 'warning' : 'success'}>
                      {supervisor.isOnLOA ? 'On Leave' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>{supervisor.loaStartDate || '-'}</TableCell>
                  <TableCell>{supervisor.loaEndDate || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
