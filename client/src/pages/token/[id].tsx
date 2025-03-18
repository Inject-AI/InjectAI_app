import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import type { Token, Analysis } from "@shared/schema";
import { useState } from "react";

export default function TokenDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const { data: token, isLoading } = useQuery<Token>({
    queryKey: [`/api/tokens/${id}`],
  });

  const analyzeMutation = useMutation({
    mutationFn: async (type: string) => {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-wallet-address": localStorage.getItem("walletAddress") || ""
        },
        body: JSON.stringify({
          userId: user?.id,
          tokenId: parseInt(id),
          type,
          points: type === "basic" ? 10 : type === "advanced" ? 20 : 30,
          data: { timestamp: new Date().toISOString() }
        }),
      });
      if (!res.ok) throw new Error("Failed to create analysis");
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analysis Created",
        description: `You've earned ${data.points} Knowl for this analysis!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth"] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/analysis`] });
    },
  });

  const user = queryClient.getQueryData<User>(["/api/auth"]);

  const params = useParams<string>();

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="h-64 bg-accent animate-pulse rounded-lg" />
        </div>
      </Layout>
    );
  }

  if (!token) {
    return (
      <Layout>
        <div className="text-center">Token not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{token.name} ({token.symbol})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">${token.price}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <p className={`text-2xl font-bold ${
                    parseFloat(token.change24h) > 0 ? "text-green-500" : "text-red-500"
                  }`}>
                    {token.change24h}%
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold">AI Market Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => analyzeMutation.mutate("basic")} 
                variant="outline"
                className="w-full"
                disabled={analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Basic Analysis (+10 Knowl)"
                )}
              </Button>
              <Button 
                onClick={() => analyzeMutation.mutate("advanced")} 
                variant="outline"
                className="w-full"
                disabled={analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Advanced Analysis (+20 Knowl)"
                )}
              </Button>
              <Button 
                onClick={() => analyzeMutation.mutate("premium")} 
                variant="outline"
                className="w-full"
                disabled={analyzeMutation.isPending}
              >
                {analyzeMutation.isPending ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analyzing...
                  </div>
                ) : (
                  "Premium Analysis (+30 Knowl)"
                )}
              </Button>
            </div>
            {analyzeMutation.data && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Analysis Results:</h4>
                <p className="whitespace-pre-wrap">{analyzeMutation.data.data}</p>
              </div>
            )}
          </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

async function requestAnalysis(type: string) {
  const user = queryClient.getQueryData<User>(["/api/auth"]);
  const { id } = useParams();

  if (!user?.id || !id) return;

  try {
    const response = await fetch("/api/analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Wallet-Address": window.localStorage.getItem("wallet_address") || "",
      },
      body: JSON.stringify({
        userId: user.id,
        tokenId: parseInt(id),
        type,
        data: "Analyzing market trends and patterns...",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get analysis");
    }

    const data = await response.json();
    setAnalysis(data);
    queryClient.invalidateQueries(["/api/auth"]);
  } catch (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to get analysis. Please try again.",
    });
  }
}