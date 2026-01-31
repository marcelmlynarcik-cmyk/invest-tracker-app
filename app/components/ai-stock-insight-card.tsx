"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AiStockInsight } from '@/lib/types';

interface AiStockInsightCardProps {
  ticker: string;
}

// Map signal colors to Tailwind CSS classes
const signalColorMap: Record<AiStockInsight['signal_color'], string> = {
  dark_green: 'bg-green-700 text-white',
  green: 'bg-green-500 text-white',
  gray: 'bg-gray-500 text-white',
  orange: 'bg-orange-500 text-white',
  red: 'bg-red-500 text-white',
};

export const AiStockInsightCard: React.FC<AiStockInsightCardProps> = ({ ticker }) => {
  const [insight, setInsight] = useState<AiStockInsight | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ai/stock-insight', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ticker }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch AI insight.');
        }

        const data: AiStockInsight = await response.json();
        setInsight(data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching AI insight:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInsight();
  }, [ticker]);

  if (loading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>AI Stock Insight</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse"></div>
          <div className="text-sm text-gray-500">Updated today</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md border-red-500">
        <CardHeader>
          <CardTitle className="text-red-600">AI Stock Insight Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
          <p className="text-sm text-gray-500">Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!insight) {
    return null; // Should not happen if loading/error are handled, but as a safeguard
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>AI Stock Insight for {ticker}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Signal:</h3>
          <Badge className={`${signalColorMap[insight.signal_color]} text-base px-3 py-1`}>
            {insight.signal}
          </Badge>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">AI Market View:</h3>
          <p className="text-gray-700">{insight.general_summary}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Your Position Insight:</h3>
          <p className="text-gray-700">{insight.personalized_summary}</p>
        </div>
        <div className="text-sm text-gray-500">
          Updated today. Confidence: <span className="capitalize">{insight.confidence_level}</span>
        </div>
      </CardContent>
    </Card>
  );
};
