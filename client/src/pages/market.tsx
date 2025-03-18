import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Search } from "@/components/market/search";
import { TokenCard } from "@/components/market/token-card";
import type { Token } from "@shared/schema";

export default function Market() {
  const [search, setSearch] = useState("");

  const { data: tokens, isLoading } = useQuery<Token[]>({
    queryKey: ["/api/tokens/search", search],
    queryFn: async () => {
      const url = search
        ? `/api/tokens/search?q=${encodeURIComponent(search)}`
        : "/api/tokens";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch tokens");
      return res.json();
    },
  });

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <Search value={search} onChange={setSearch} />
        
        {isLoading ? (
          <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-accent animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-4 grid-cols-1 md:grid-cols-2">
            {tokens?.map((token) => (
              <TokenCard key={token.id} token={token} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
