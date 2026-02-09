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
import { mockSupervisors } from '@/lib/mockData';
import { Supervisor } from '@/types';
import { api } from '@/lib/api';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>(mockSupervisors);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSupervisors() {
      try {
        const data = await api.supervisors.getAll();
        setSupervisors(data as Supervisor[]);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch supervisors:', err);
        setError('Using mock data - backend not available');
        // Keep using mock data as fallback
      } finally {
        setIsLoading(false);
      }
    }

    fetchSupervisors();
  }, []);

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Supervisors</CardTitle>
          {error && (
            <p className="text-sm text-muted-foreground mt-2">
              ⚠️ {error}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading supervisors...
            </div>
          ) : (
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
                {supervisors.map((supervisor) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
