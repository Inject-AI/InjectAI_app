import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useKeplerWallet } from "@/lib/kepler";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User, Analysis } from "@shared/schema";
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit2, Save } from "lucide-react";

export default function Dashboard() {
  const { connect, disconnect } = useKeplerWallet();
  const { toast } = useToast();
  const [editUsername, setEditUsername] = useState(null); // Changed to null initially
  const [profilePicture, setProfilePicture] = useState(""); // Added state for profile picture
  const [isEditing, setIsEditing] = useState(false); // Added state for edit mode

  const { data: user, isLoading: isLoadingUser, refetch: refetchUser } = useQuery<User>({
    queryKey: ["/api/auth"],
    retry: false,
  });

  const { data: analyses } = useQuery<Analysis[]>({
    queryKey: [`/api/users/${user?.id}/analysis`],
    enabled: !!user,
  });

  const handleConnect = async () => {
    try {
      const address = await connect();
      window.localStorage.setItem('wallet_address', address);
      await apiRequest("POST", "/api/auth", {
        username: `user_${address.slice(0, 8)}`,
        walletAddress: address,
      });
      await refetchUser();
      toast({
        title: "Connected!",
        description: "Successfully connected to Keplr wallet",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to connect wallet",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
      if (error instanceof Error && error.message.includes("install")) {
        window.open("https://www.keplr.app/", "_blank");
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      window.localStorage.removeItem('wallet_address');
      window.location.reload();
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('picture', file);

    try {
      const response = await fetch(`/api/users/${user?.id}/picture`, {
        method: 'PUT',
        headers: {
          'X-Wallet-Address': window.localStorage.getItem('wallet_address') || '',
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to update profile picture');
      const updatedUser = await response.json();
      refetchUser();
      setProfilePicture(updatedUser.picture); // Update state with new picture URL
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile picture",
      });
    }
  };


  if (isLoadingUser) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="h-32 flex items-center justify-center">
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-4">Connect Wallet</h2>
              <p className="text-muted-foreground mb-4">
                Connect your Keplr wallet to start analyzing crypto markets
              </p>
              <Button onClick={handleConnect} size="lg" className="w-full">
                Connect Keplr Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Profile</CardTitle>
              <Button variant="outline" onClick={handleDisconnect}>
                Disconnect Wallet
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="relative"> {/* Added container for profile picture and edit button */}
                  <Avatar className="h-20 w-20 border-2 border-primary">
                    <AvatarImage src={profilePicture || user.picture} /> {/* Use existing picture if available */}
                    <AvatarFallback className="text-lg bg-primary/20">
                      {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="picture-upload" 
                    className="absolute bottom-0 right-0 p-1 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
                  >
                    <input
                      id="picture-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePictureChange}
                    />
                    <Edit2 className="h-4 w-4" />
                  </label>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Username</p>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editUsername || user.username}
                          onChange={(e) => setEditUsername(e.target.value)}
                          className="px-2 py-1 border rounded bg-background text-foreground"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={async () => {
                            if (!editUsername || editUsername === user.username) return;
                            try {
                              const response = await fetch(`/api/users/${user.id}`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'X-Wallet-Address': window.localStorage.getItem('wallet_address') || '',
                                },
                                body: JSON.stringify({ username: editUsername }),
                              });
                              if (!response.ok) throw new Error('Failed to update username');
                              await refetchUser();
                              setEditUsername(null); // Reset editUsername after saving
                              setIsEditing(false); // Toggle back to viewing mode
                              toast({
                                title: "Success",
                                description: "Username updated successfully",
                              });
                            } catch (error) {
                              toast({
                                variant: "destructive",
                                title: "Error",
                                description: "Failed to update username",
                              });
                            }
                          }}
                        >
                          <Save className="h-4 w-4" /> Save
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="font-medium">{user.username}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditUsername(user.username);
                            setIsEditing(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet</p>
                <p className="font-medium">{user.walletAddress}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Knowl</p>
                <p className="text-2xl font-bold">{user.points} Knowl</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Total Knowl</CardTitle>
            <div className="text-2xl font-bold">{user?.points || 0} Knowl</div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
          </CardHeader>
          <CardContent>
            {analyses?.map((analysis) => (
              <div
                key={analysis.id}
                className="py-4 border-b last:border-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {analysis.type.charAt(0).toUpperCase() + analysis.type.slice(1)} Analysis
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Token ID: {analysis.tokenId}
                    </p>
                  </div>
                  <Badge variant="secondary">+{analysis.points} Knowl</Badge>
                </div>
              </div>
            ))}
            {(!analyses || analyses.length === 0) && (
              <p className="text-muted-foreground text-center py-4">
                No analysis history yet. Start analyzing tokens to earn points!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}