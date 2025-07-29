import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interface for plan data
interface PlanData {
  id: string;
  title: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonAction: 'upgrade' | 'downgrade';
}

type UserRole = 'free' | 'pro' | 'premium';
type BillingCycle = 'monthly' | 'yearly';

@Component({
  selector: 'app-choose-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './choose-plan.component.html',
  styleUrl: './choose-plan.component.css'
})
export class ChoosePlanComponent implements OnInit {
  
  // Current user role - this would typically come from a service
  currentUserRole: UserRole = 'free'; // Can be 'free', 'pro', or 'premium'
  
  // Billing cycle toggle
  billingCycle: BillingCycle = 'monthly';
  
  // Plan data array
  plans: PlanData[] = [
    {
      id: 'pro',
      title: 'Pro',
      monthlyPrice: 19,
      yearlyPrice: 190, // 10 months price (16% discount)
      features: [
        '200 AI tokens per month',
        'Priority chat support',
        'Access to advanced models',
        'Faster response times',
        'Analytics dashboard',
        'Custom integrations'
      ],
      popular: true,
      buttonText: 'Upgrade to Pro',
      buttonAction: 'upgrade'
    },
    {
      id: 'premium',
      title: 'Premium',
      monthlyPrice: 49,
      yearlyPrice: 490, // 10 months price (16% discount)
      features: [
        '350 AI tokens per month',
        '24/7 priority support',
        'Access to all models including GPT-4',
        'Unlimited response speed',
        'Advanced analytics',
        'Custom model training',
        'API access',
        'Team collaboration',
        'White-label options'
      ],
      buttonText: 'Upgrade to Premium',
      buttonAction: 'upgrade'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialize component
    this.updateButtonTexts();
  }

  // Toggle billing cycle
  toggleBillingCycle(): void {
    this.billingCycle = this.billingCycle === 'monthly' ? 'yearly' : 'monthly';
  }

  // Get current price based on billing cycle
  getCurrentPrice(plan: PlanData): number {
    return this.billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  }

  // Get monthly equivalent price for yearly billing
  getMonthlyEquivalent(plan: PlanData): number {
    return Math.round(plan.yearlyPrice / 12);
  }

  // Get discount percentage for yearly billing
  getYearlyDiscount(plan: PlanData): number {
    const yearlyMonthlyEquivalent = plan.yearlyPrice / 12;
    const discount = ((plan.monthlyPrice - yearlyMonthlyEquivalent) / plan.monthlyPrice) * 100;
    return Math.round(discount);
  }

  // Check if plan should be displayed based on user role
  shouldDisplayPlan(planId: string): boolean {
    switch (this.currentUserRole) {
      case 'free':
        return true; // Show both plans
      case 'pro':
        return planId === 'premium'; // Only show premium
      case 'premium':
        return false; // Don't show any plans
      default:
        return true;
    }
  }

  // Get plans to display
  get visiblePlans(): PlanData[] {
    return this.plans.filter(plan => this.shouldDisplayPlan(plan.id));
  }

  // Check if user is on highest plan
  get isOnHighestPlan(): boolean {
    return this.currentUserRole === 'premium';
  }

  // Update button texts based on user role
  updateButtonTexts(): void {
    this.plans.forEach(plan => {
      if (this.currentUserRole === 'free') {
        plan.buttonText = `Upgrade to ${plan.title}`;
        plan.buttonAction = 'upgrade';
      } else if (this.currentUserRole === 'pro' && plan.id === 'premium') {
        plan.buttonText = 'Upgrade to Premium';
        plan.buttonAction = 'upgrade';
      } else if (this.currentUserRole === 'premium') {
        plan.buttonText = `Downgrade to ${plan.title}`;
        plan.buttonAction = 'downgrade';
      }
    });
  }

  // Handle plan selection
  onPlanSelect(plan: PlanData): void {
    console.log(`Selected plan: ${plan.title}`);
    console.log(`Action: ${plan.buttonAction}`);
    console.log(`Price: $${this.getCurrentPrice(plan)}/${this.billingCycle}`);
    
    if (plan.buttonAction === 'upgrade') {
      this.upgradeToplan(plan);
    } else {
      this.downgradeToPlan(plan);
    }
  }

  // Upgrade method (stub)
  private upgradeToplan(plan: PlanData): void {
    console.log(`Upgrading to ${plan.title} plan`);
    // TODO: Implement upgrade logic
    // - Show payment modal
    // - Process payment
    // - Update user role
    // - Show success message
  }

  // Downgrade method (stub)
  private downgradeToPlan(plan: PlanData): void {
    console.log(`Downgrading to ${plan.title} plan`);
    // TODO: Implement downgrade logic
    // - Show confirmation dialog
    // - Process downgrade
    // - Update user role
    // - Show success message
  }

  // Get current user role display name
  get currentUserRoleDisplay(): string {
    switch (this.currentUserRole) {
      case 'free':
        return 'Free Trial';
      case 'pro':
        return 'Pro';
      case 'premium':
        return 'Premium';
      default:
        return 'Unknown';
    }
  }

  // Method to simulate changing user role for testing
  changeUserRole(role: UserRole): void {
    this.currentUserRole = role;
    this.updateButtonTexts();
    console.log(`User role changed to: ${role}`);
  }
}
