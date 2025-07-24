import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ToolbarService } from '../../../shared/services/toolbar.service';
import { HeaderComponent } from '../../../layout/header/header.component';
import { FooterComponent } from '../../../shared/footer/footer.component';

@Component({
  selector: 'app-pricing-plans',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent, FooterComponent],
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
    title: 'Flexible pricing for every team',
    subtitle: 'Choose a plan that fits your workflow. Instantly access logos, brand colors, fonts, and social links for any company. Upgrade for advanced integrations, asset libraries, and team features.'
  };

  plans = [
    {
      name: 'Base',
      price: () => '$0',
      period: () => this.isAnnual ? 'Yearly' : 'Monthly',
      description: () => 'Free start for your project on our platform.',
      features: [
        'Access to editing all blocks',
        'Editing blocks together',
        'Access to all premium icons',
        'A dedicated domain',
        'Ability to integrate with CMS',
      ],
      button: 'Get started free',
      highlight: false
    },
    {
      name: 'Standard',
      price: () => this.isAnnual ? '$299' : '$30',
      period: () => this.isAnnual ? 'Yearly' : 'Monthly',
      description: () => 'For a small company that wants to show what it\'s worth.',
      features: [
        'Access to editing all blocks',
        'Editing blocks together',
        'Access to all premium icons',
        'A dedicated domain',
        'Ability to integrate with CMS',
      ],
      button: 'Start Standard',
      highlight: true,
      mostPopular: true
    },
    {
      name: 'Premium',
      price: () => this.isAnnual ? '$599' : '$60',
      period: () => this.isAnnual ? 'Yearly' : 'Monthly',
      description: () => 'For a large company that wants to achieve maximum returns',
      features: [
        'Access to editing all blocks',
        'Editing blocks together',
        'Access to all premium icons',
        'A dedicated domain',
        'Ability to integrate with CMS',
      ],
      button: 'Start Premium',
      highlight: false
    }
  ];

  cta = {
    title: 'Unlock the power of brand data',
    subtitle: 'Start your free trial today and see how Marketify can streamline your workflow, boost your team’s productivity, and keep your brand assets always up to date.',
    button: 'Start free trial'
  };

  faqsCol1 = [
    { q: 'What is Marketify?', a: 'Marketify is a platform that lets you instantly access logos, brand colors, fonts, and social links by simply entering a domain name.', open: false },
    { q: 'How can designers benefit from Marketify?', a: 'Designers can streamline their workflow by instantly accessing brand assets, color palettes, and typography, ensuring brand consistency and saving hours on manual asset collection.', open: false },
    { q: 'How does Marketify help developers?', a: 'Developers can integrate real-time brand data into apps and websites using our robust API and SDKs, automating branding, onboarding, and more.', open: false },
    { q: 'Can I use Marketify for brand monitoring?', a: 'Yes, Marketify helps marketers maintain consistency and credibility by providing the latest brand assets and monitoring changes across all channels.', open: false },
  ];
  faqsCol2 = [
    { q: 'What kind of brand data can I fetch?', a: 'You can fetch logos, brand colors, fonts, social links, and other official brand assets for thousands of companies.', open: false },
    { q: 'Is there an API for developers?', a: 'Yes, Marketify offers a REST API and SDKs for quick integration, allowing you to fetch brand assets programmatically.', open: false },
    { q: 'How do I get started with Marketify?', a: 'Simply enter a domain name to access brand data, or sign up for advanced features like asset libraries and campaign-ready downloads.', open: false },
    { q: 'Is Marketify suitable for teams?', a: 'Absolutely! Marketify is trusted by forward-thinking teams and is designed for designers, developers, and marketers alike.', open: false },
  ];

  constructor(private toolbar: ToolbarService) {}
  ngOnInit() {
    this.toolbar.setLoggedOutToolbar();
  }

  toggleFaq(col: number, idx: number) {
    if (col === 0) {
      this.faqsCol1[idx].open = !this.faqsCol1[idx].open;
    } else {
      this.faqsCol2[idx].open = !this.faqsCol2[idx].open;
    }
  }

  // Add a getter to return the plans with evaluated values for template use
  get displayPlans() {
    return this.plans.map(plan => ({
      ...plan,
      price: plan.price(),
      period: plan.period(),
      description: plan.description()
    }));
  }
}
