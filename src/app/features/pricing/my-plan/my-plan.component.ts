import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interface for plan data structure
interface PlanData {
  id: string;
  title: string;
  progress: {
    current: number;
    max: number;
    unit: string;
    label: string;
  };
  showDismissButton: boolean;
  showUpgradeButton: boolean;
  isCurrentPlan: boolean;
  upgradeText: string;
  price: string;
  features: string[];
  description: string;
}

@Component({
  selector: 'app-my-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-plan.component.html',
  styleUrl: './my-plan.component.css'
})
export class MyPlanComponent {
  // Event emitter to communicate with parent component
  @Output() upgradeClicked = new EventEmitter<void>();

  // Selected plan for details display
  selectedPlan: PlanData | null = null;

  // Plans array - AI Token usage focused
  plans: PlanData[] = [
    {
      id: 'free-trial',
      title: 'Free Trial',
      progress: {
        current: 50,
        max: 100,
        unit: 'tokens',
        label: 'Tokens Remaining'
      },
      showDismissButton: true,
      showUpgradeButton: false,
      isCurrentPlan: true,
      upgradeText: 'Upgrade',
      price: 'Free',
      features: [
        '100 AI tokens per month',
        'Basic chat support',
        'Access to standard models',
        'Rate limited usage'
      ],
      description: 'Perfect for getting started with AI-powered features. Includes basic functionality with usage limits.'
    },
    {
      id: 'pro',
      title: 'Pro',
      progress: {
        current: 200,
        max: 200,
        unit: 'tokens',
        label: 'Tokens Remaining'
      },
      showDismissButton: false,
      showUpgradeButton: true,
      isCurrentPlan: false,
      upgradeText: 'Upgrade to Pro',
      price: '$19/month',
      features: [
        '200 AI tokens per month',
        'Priority chat support',
        'Access to advanced models',
        'Faster response times',
        'Analytics dashboard'
      ],
      description: 'Ideal for professionals who need more AI capabilities and faster processing for their daily workflow.'
    },
    {
      id: 'premium',
      title: 'Premium',
      progress: {
        current: 350,
        max: 350,
        unit: 'tokens',
        label: 'Tokens Remaining'
      },
      showDismissButton: false,
      showUpgradeButton: true,
      isCurrentPlan: false,
      upgradeText: 'Upgrade to Premium',
      price: '$49/month',
      features: [
        '350 AI tokens per month',
        '24/7 priority support',
        'Access to all models including GPT-4',
        'Unlimited response speed',
        'Advanced analytics',
        'Custom model training',
        'API access'
      ],
      description: 'The ultimate plan for power users and businesses requiring maximum AI capabilities and premium support.'
    }
  ];

  constructor() {
    // Set the current plan as the initially selected plan
    this.selectedPlan = this.plans.find(plan => plan.isCurrentPlan) || this.plans[0];
  }

  // Method to handle dismiss/close action (placeholder for future functionality)
  onDismissProgress(planId: string) {
    // Future implementation for dismiss functionality
    console.log('Dismiss button clicked for plan:', planId);
  }

  // Method to calculate progress percentage for a specific plan
  getProgressPercentage(plan: PlanData): number {
    return plan.progress.max > 0 ? 
      (plan.progress.current / plan.progress.max) * 100 : 0;
  }

  // Method to get token level status
  getTokenLevel(plan: PlanData): 'low' | 'medium' | 'high' {
    const percentage = this.getProgressPercentage(plan);
    if (percentage < 20) return 'low';
    if (percentage < 50) return 'medium';
    return 'high';
  }

  // Method to get token status message
  getTokenStatusMessage(plan: PlanData): string {
    const level = this.getTokenLevel(plan);
    switch (level) {
      case 'low':
        return 'Low tokens - Consider upgrading';
      case 'medium':
        return 'Moderate token usage';
      case 'high':
        return 'Good token availability';
      default:
        return '';
    }
  }

  // Method to handle plan card selection
  onPlanSelect(plan: PlanData) {
    this.selectedPlan = plan;
    console.log('Plan selected:', plan.title);
  }

  // Method to handle upgrade button click
  onUpgradeClick(plan: PlanData) {
    console.log('Upgrade clicked for plan:', plan.title);
    // Emit event to parent component to change selectedSidebarIndex to 3
    this.upgradeClicked.emit();
  }

  // TrackBy function for ngFor performance optimization
  trackByPlanId(index: number, plan: PlanData): string {
    return plan.id;
  }

  // Method to simulate different plan types (for testing/future development)
  simulateDifferentPlan(planType: 'Free Trial' | 'Pro' | 'Premium') {
    // Update the specific plan in the array
    const planIndex = this.plans.findIndex(p => p.title === planType);
    if (planIndex !== -1) {
      // Mark all plans as not current
      this.plans.forEach(p => p.isCurrentPlan = false);
      // Mark the selected plan as current
      this.plans[planIndex].isCurrentPlan = true;
    }
  }
}
