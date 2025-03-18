import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { useEffect } from "react";
import { initTelegramApp } from "@/lib/telegram";

export default function Home() {
  useEffect(() => {
    initTelegramApp();
  }, []);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">
          Crypto Trading Analysis
        </h1>
        <p className="text-muted-foreground mb-8">
          Get detailed market analysis and earn points while learning about crypto trading
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/market">
            <Button size="lg">
              Explore Market
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
