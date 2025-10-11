"use client"

import { useEffect, useState } from "react";
import { getJson, putJson, deleteJson } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button";


interface FriendRequest {
  _id: string;
  sender: {
    _id: string;
    username: string;
    email: string;
  };
  status: 'pending' | 'accepted' | 'declined';
}

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await getJson<{ data: FriendRequest[] }>('/api/friends/requests');
        setRequests(response.data);
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAccept = async (requestId: string) => {
    try {
      await putJson(`/api/friends/requests/${requestId}/accept`);
      setRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) { console.error("Failed to accept request:", error); }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await deleteJson(`/api/friends/requests/${requestId}/decline`);
      setRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) { console.error("Failed to decline request:", error); }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Friend Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading requests...</p>
          ) : requests.length > 0 ? (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg bg-muted">
                  <div>
                    <p className="font-semibold">{request.sender.username}</p>
                    <p className="text-sm text-muted-foreground">{request.sender.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAccept(request._id)}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDecline(request._id)}>Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You have no pending friend requests.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}