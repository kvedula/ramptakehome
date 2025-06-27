'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

interface CategorizationProgressProps {
  isVisible: boolean;
  progress: number;
  currentStep: string;
  processedCount: number;
  totalCount: number;
  currentTransaction?: string;
}

export function CategorizationProgress({
  isVisible,
  progress,
  currentStep,
  processedCount,
  totalCount,
  currentTransaction
}: CategorizationProgressProps) {
  if (!isVisible) return null;

  const steps = [
    { name: 'Initializing', icon: Brain, color: 'text-blue-600' },
    { name: 'Analyzing Transactions', icon: Target, color: 'text-purple-600' },
    { name: 'AI Processing', icon: Sparkles, color: 'text-yellow-600' },
    { name: 'Applying Categories', icon: TrendingUp, color: 'text-green-600' },
    { name: 'Finalizing', icon: CheckCircle, color: 'text-green-600' },
  ];

  const currentStepIndex = steps.findIndex(step => step.name === currentStep);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Categorization in Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {processedCount} of {totalCount} transactions processed
            </p>
          </div>

          {/* Current Step */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium">{currentStep}</span>
            </div>
            
            {currentTransaction && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Currently processing:</p>
                <p className="text-sm font-medium truncate">{currentTransaction}</p>
              </div>
            )}
          </div>

          {/* Steps Progress */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Process Steps</p>
            <div className="space-y-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isPending = index > currentStepIndex;

                return (
                  <div key={step.name} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-green-100 text-green-600' 
                        : isCurrent 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : isCurrent ? (
                        <RefreshCw className="h-3 w-3 animate-spin" />
                      ) : (
                        <Icon className="h-3 w-3" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.name}
                    </span>
                    {isCompleted && (
                      <Badge variant="secondary" className="ml-auto">
                        ✓
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge variant="default" className="ml-auto">
                        <Zap className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fun Facts */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg border">
            <p className="text-xs text-muted-foreground mb-1">💡 Did you know?</p>
            <p className="text-sm">
              Our AI analyzes merchant names, transaction amounts, and spending patterns 
              to automatically categorize your expenses with 95% accuracy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
