import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Pipe({ name: 'codeEscape', standalone: true })
export class CodeEscapePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value
      .replace(/\{/g, '{{ "{" }}')
      .replace(/\}/g, '{{ "}" }}')
      .replace(/\n/g, '<br/>');
  }
}

@Component({
  selector: 'app-developer',
  standalone: true,
  imports: [CommonModule, HeaderComponent, CodeEscapePipe],
  templateUrl: './developer.component.html',
  styleUrl: './developer.component.css'
})
export class DeveloperComponent implements OnInit {
  heroSection = {
    announcement: {
      title: 'Introducing GitHub Copilot X',
      subtitle: 'Your AI pair programmer is leveling up',
      link: '#',
    },
    title: `Let’s build from here`,
    subtitle: `Harnessed for productivity. Designed for collaboration. Celebrated for built-in security. Welcome to the platform developers love.`,
    inputPlaceholder: 'Email address',
    primaryButton: {
      label: 'Sign up for GitHub',
      link: '#'
    },
    secondaryButton: {
      label: 'Start a free enterprise trial',
      link: '#'
    },
    logos: [
      { src: '/public/company/stripe.svg', alt: 'Stripe' },
      { src: '/public/company/pinterest.svg', alt: 'Pinterest' },
      { src: '/public/company/kpmg.svg', alt: 'KPMG' },
      { src: '/public/company/mercedes.svg', alt: 'Mercedes-Benz' },
      { src: '/public/company/pg.svg', alt: 'P&G' },
      { src: '/public/company/telus.svg', alt: 'Telus' }
    ]
  };
  featureCards = {
    large: {
      title: 'GitHub Copilot',
      description: 'is your AI pair programmer that empowers you to complete tasks 55% faster by turning natural language prompts into coding suggestions.',
      cta: 'Meet GitHub Copilot',
      link: '#',
      image: '/developer img/copilot-code.png',
      alt: 'Copilot code'
    },
    small: [
      {
        title: 'GitHub Actions',
        description: 'automates your build, test, and deployment workflow with simple and secure CI/CD.',
        cta: 'Discover GitHub Actions',
        link: '#',
        image: '/developer img/actions-workflow.png',
        alt: 'Actions workflow'
      },
      {
        title: 'GitHub Mobile',
        description: 'fits your projects in your pocket, so you never miss a beat while on the go.',
        cta: 'Get GitHub Mobile',
        link: '#',
        image: '/developer img/mobile-ui.png',
        alt: 'Mobile UI'
      }
    ]
  };

  collaborationSection = {
    title: 'Supercharge collaboration.',
    subtitle: 'We provide flexible project management tools, best-in-class version control, and the world\'s most powerful open source community—so your team can work more efficiently together.',
    tableImage: {
      src: '/developer img/Frame.png',
      alt: 'Project table'
    },
    overlayImage: {
      src: '/developer img/Image.png',
      alt: 'Overlay card'
    },
    stat: {
      label: 'Did you know?',
      value: '80%',
      unit: 'reduction',
      description: 'in onboarding time with GitHub'
    }
  };

  discussionCards = [
    {
      title: 'GitHub Discussions create space to ask questions and have open-ended conversations.',
      cta: 'Enable GitHub Discussions',
      image: '/developer img/discussions-card.png',
      alt: 'Discussions card'
    },
    {
      title: 'Pull requests allow real-time communication and collaboration about code changes.',
      cta: 'Check out pull requests',
      image: '/developer img/pullrequests-card.png',
      alt: 'Pull requests card'
    },
    {
      title: 'GitHub Sponsors lets you support your favorite open source maintainers and projects.',
      cta: 'Invest with GitHub Sponsors',
      image: '/developer img/sponsors-card.png',
      alt: 'Sponsors card'
    }
  ];

  securitySection = {
    title: 'Embed security into the developer workflow.',
    workflowImage: '/developer img/her0.png',
    description: 'GitHub Advanced Security lets you gain visibility into your security posture, respond to threats proactively, and ship secure applications quickly.',
    cta: 'Get GitHub Advanced Security',
    stat: {
      label: 'Did you know?',
      value: '56 million projects',
      description: 'fixed vulnerabilities with GitHub'
    },
    cards: [
      {
        title: 'Secret scanning',
        description: 'automatically looks for partner patterns and prevents fraudulent use of accidentally committed secrets.',
        cta: 'Read about secret scanning',
        image: '/developer img/Image.png',
        alt: 'Secret scanning code'
      },
      {
        title: 'Dependabot',
        description: 'makes it easy to find and fix vulnerable dependencies in your supply chain.',
        cta: 'Explore Dependabot',
        image: '/developer img/Frame.png',
        alt: 'Dependabot code'
      },
      {
        title: 'Code scanning',
        description: 'is GitHub\'s static code analysis tool that helps you remediate issues in your code.',
        cta: 'Download the latest SAST ebook',
        image: '/developer img/her0.png',
        alt: 'Code scanning code'
      }
    ]
  };
  private authSubscription!: Subscription;
  constructor(private toolbarService: ToolbarService, private authService: AuthService) {}
  ngOnInit(): void {
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.toolbarService.setLoggedInToolbar();
      } else {
        this.toolbarService.setLoggedOutToolbar();
      }
    });
  }
  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
