import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Token } from "@shared/schema";
import { Link } from "wouter";

interface TokenCardProps {
  token: Token;
}

export function TokenCard({ token }: TokenCardProps) {
  const isPositiveChange = parseFloat(token.change24h) > 0;

  return (
    <Link href={`/token/${token.id}`}>
      <Card className="cursor-pointer hover:bg-accent transition-colors">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold">{token.name}</h3>
              <p className="text-sm text-muted-foreground">{token.symbol}</p>
            </div>
            <Badge variant={isPositiveChange ? "default" : "destructive"}>
              {isPositiveChange ? "+" : ""}{token.change24h}%
            </Badge>
          </div>
          <div className="mt-4">
            <p className="text-lg font-bold">${token.price}</p>
            <p className="text-sm text-muted-foreground">
              Vol: ${parseInt(token.volume24h).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
