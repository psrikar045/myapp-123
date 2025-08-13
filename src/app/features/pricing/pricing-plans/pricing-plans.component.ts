import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ToolbarService } from '../../../shared/services/toolbar.service';
import { RouterModule, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-pricing-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pricing-plans.component.html',
  styleUrl: './pricing-plans.component.scss',
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, maxHeight: '0px', transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, maxHeight: '200px', transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, maxHeight: '0px', transform: 'translateY(-10px)' }))
      ])
    ])
  ]
})
export class PricingPlansComponent implements OnInit {
  isAnnual = false;

  hero = {
    title: 'Flexible pricing for every stage of growth',
    subtitle: 'Start free. Scale with confidence. No hidden fees. Cancel anytime.'
  };

  // Monthly pricing plans
  monthlyPlans = [
    {
      name: 'Free',
      price: () => '$0',
      period: () => '/month',
      description: () => 'Perfect for getting started',
      features: [
        '1 claimed domain',
        '1 API key',
        '100 API calls /mo',
        'Domain health & overview',
        'Basic analytics',
        'Community support'
      ],
      button: 'Get Started',
      highlight: false,
      mostPopular: false
    },
    {
      name: 'Pro',
      price: () => '$25',
      period: () => '/month',
      description: () => 'Best for growing businesses',
      features: [
        '5 claimed domains',
        '3 API keys',
        '1,000 API calls/mo',
        'Domain insights & summaries',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'Team collaboration'
      ],
      button: 'Start Scaling',
      highlight: true,
      mostPopular: true
    },
    {
      name: 'Business',
      price: () => 'Contact us',
      period: () => '',
      description: () => 'For enterprise needs',
      features: [
        'Unlimited domains',
        'Unlimited API keys',
        'Unlimited API calls',
        'AI brand summaries',
        'Custom usage & SLA',
        'Dedicated account manager',
        'Custom integrations',
        '24/7 premium support',
        'Advanced security features'
      ],
      button: 'Talk to Sales',
      highlight: false,
      mostPopular: false
    }
  ];

  // Yearly pricing plans
  yearlyPlans = [
    {
      name: 'Free',
      price: () => '$0',
      period: () => '/month',
      description: () => 'Perfect for getting started',
      features: [
        '1 claimed domain',
        '1 API key',
        '100 API calls /mo',
        'Domain health & overview',
        'Basic analytics',
        'Community support'
      ],
      button: 'Get Started',
      highlight: false,
      mostPopular: false
    },
    {
      name: 'Pro',
      price: () => '$20',
      period: () => '/mo',
      billingDetails: () => 'Billed yearly at $240',
      description: () => 'Best for growing businesses',
      features: [
        '5 claimed domains',
        '3 API keys',
        '1,000 API calls/mo',
        'Domain insights & summaries',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'Team collaboration'
      ],
      button: 'Start Scaling',
      highlight: true,
      mostPopular: true
    },
    {
      name: 'Business',
      price: () => 'Contact us',
      period: () => '',
      description: () => 'For enterprise needs',
      features: [
        'Unlimited domains',
        'Unlimited API keys',
        'Unlimited API calls',
        'AI brand summaries',
        'Custom usage & SLA',
        'Dedicated account manager',
        'Custom integrations',
        '24/7 premium support',
        'Advanced security features'
      ],
      button: 'Talk to Sales',
      highlight: false,
      mostPopular: false
    }
  ];

  cta = {
    title: 'Unlock the power of brand data',
    subtitle: 'Start your free trial today and see how RIVO9 can streamline your workflow, boost your team’s productivity, and keep your brand assets always up to date.',
    button: 'Start free trial'
  };

  allFaqs = [
    { q: 'What is an API call?', a: 'An API call is a request made to our service to retrieve brand data for a specific domain. Each successful request counts as one API call towards your monthly limit.', open: false },
    { q: 'Can I change my plan later?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.', open: false },
    { q: 'What happens if I exceed my quota?', a: 'If you exceed your monthly API call limit, additional calls will be throttled. You can upgrade your plan or wait for the next billing cycle to reset your quota.', open: false },
    { q: 'Can I invite team members?', a: 'Team collaboration features are available on Pro and Business plans. You can invite team members and manage their access to your claimed domains and API keys.', open: false },
    { q: 'Do you offer custom integrations?', a: 'Yes, our Business plan includes custom integrations and dedicated support to help you integrate our API with your existing systems.', open: false },
    { q: 'Is there a free trial?', a: 'Yes, you can start with our Free plan which includes 1 claimed domain and 100 API calls per month. No credit card required.', open: false },
    { q: 'What payment methods do you support?', a: 'We accept all major credit cards, PayPal, and can arrange invoicing for Business plan customers.', open: false }
  ];

  constructor(private toolbar: ToolbarService) {}
  ngOnInit() {
    // Don't force toolbar state - let header component handle it based on auth status
  }

  toggleFaq(idx: number) {
    this.allFaqs[idx].open = !this.allFaqs[idx].open;
  }

  // Add a getter to return the plans with evaluated values for template use
  get displayPlans() {
    const currentPlans = this.isAnnual ? this.yearlyPlans : this.monthlyPlans;
    return currentPlans.map(plan => ({
      ...plan,
      price: plan.price(),
      period: plan.period(),
      description: plan.description(),
      billingDetails: (plan as any).billingDetails ? (plan as any).billingDetails() : undefined
    }));
  }
}
