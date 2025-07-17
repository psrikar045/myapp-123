import { AfterViewInit, Component, OnInit, Pipe, PipeTransform, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ToolbarService } from '../../shared/services/toolbar.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

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
export class DeveloperComponent implements OnInit,AfterViewInit {
 
  // sortedList: number[] = [];
  // heroSection = {
  //   announcement: {
  //     title: 'Introducing GitHub Copilot X',
  //     subtitle: 'Your AI pair programmer is leveling up',
  //     link: '#',
  //   },
  //   title: `Let’s build from here`,
  //   subtitle: `Harnessed for productivity. Designed for collaboration. Celebrated for built-in security. Welcome to the platform developers love.`,
  //   inputPlaceholder: 'Email address',
  //   primaryButton: {
  //     label: 'Sign up for GitHub',
  //     link: '#'
  //   },
  //   secondaryButton: {
  //     label: 'Start a free enterprise trial',
  //     link: '#'
  //   },
  //   logos: [
  //     { src: '/public/company/stripe.svg', alt: 'Stripe' },
  //     { src: '/public/company/pinterest.svg', alt: 'Pinterest' },
  //     { src: '/public/company/kpmg.svg', alt: 'KPMG' },
  //     { src: '/public/company/mercedes.svg', alt: 'Mercedes-Benz' },
  //     { src: '/public/company/pg.svg', alt: 'P&G' },
  //     { src: '/public/company/telus.svg', alt: 'Telus' }
  //   ]
  // };
  // featureCards = {
  //   large: {
  //     title: 'GitHub Copilot',
  //     description: 'is your AI pair programmer that empowers you to complete tasks 55% faster by turning natural language prompts into coding suggestions.',
  //     cta: 'Meet GitHub Copilot',
  //     link: '#',
  //     image: '/developer img/copilot-code.png',
  //     alt: 'Copilot code'
  //   },
  //   small: [
  //     {
  //       title: 'GitHub Actions',
  //       description: 'automates your build, test, and deployment workflow with simple and secure CI/CD.',
  //       cta: 'Discover GitHub Actions',
  //       link: '#',
  //       image: '/developer img/actions-workflow.png',
  //       alt: 'Actions workflow'
  //     },
  //     {
  //       title: 'GitHub Mobile',
  //       description: 'fits your projects in your pocket, so you never miss a beat while on the go.',
  //       cta: 'Get GitHub Mobile',
  //       link: '#',
  //       image: '/developer img/mobile-ui.png',
  //       alt: 'Mobile UI'
  //     }
  //   ]
  // };

  // collaborationSection = {
  //   title: 'Supercharge collaboration.',
  //   subtitle: 'We provide flexible project management tools, best-in-class version control, and the world\'s most powerful open source community—so your team can work more efficiently together.',
  //   tableImage: {
  //     src: '/developer img/Frame.png',
  //     alt: 'Project table'
  //   },
  //   overlayImage: {
  //     src: '/developer img/Image.png',
  //     alt: 'Overlay card'
  //   },
  //   stat: {
  //     label: 'Did you know?',
  //     value: '80%',
  //     unit: 'reduction',
  //     description: 'in onboarding time with GitHub'
  //   }
  // };

  // discussionCards = [
  //   {
  //     title: 'GitHub Discussions create space to ask questions and have open-ended conversations.',
  //     cta: 'Enable GitHub Discussions',
  //     image: '/developer img/discussions-card.png',
  //     alt: 'Discussions card'
  //   },
  //   {
  //     title: 'Pull requests allow real-time communication and collaboration about code changes.',
  //     cta: 'Check out pull requests',
  //     image: '/developer img/pullrequests-card.png',
  //     alt: 'Pull requests card'
  //   },
  //   {
  //     title: 'GitHub Sponsors lets you support your favorite open source maintainers and projects.',
  //     cta: 'Invest with GitHub Sponsors',
  //     image: '/developer img/sponsors-card.png',
  //     alt: 'Sponsors card'
  //   }
  // ];

  // securitySection = {
  //   title: 'Embed security into the developer workflow.',
  //   workflowImage: '/developer img/her0.png',
  //   description: 'GitHub Advanced Security lets you gain visibility into your security posture, respond to threats proactively, and ship secure applications quickly.',
  //   cta: 'Get GitHub Advanced Security',
  //   stat: {
  //     label: 'Did you know?',
  //     value: '56 million projects',
  //     description: 'fixed vulnerabilities with GitHub'
  //   },
  //   cards: [
  //     {
  //       title: 'Secret scanning',
  //       description: 'automatically looks for partner patterns and prevents fraudulent use of accidentally committed secrets.',
  //       cta: 'Read about secret scanning',
  //       image: '/developer img/Image.png',
  //       alt: 'Secret scanning code'
  //     },
  //     {
  //       title: 'Dependabot',
  //       description: 'makes it easy to find and fix vulnerable dependencies in your supply chain.',
  //       cta: 'Explore Dependabot',
  //       image: '/developer img/Frame.png',
  //       alt: 'Dependabot code'
  //     },
  //     {
  //       title: 'Code scanning',
  //       description: 'is GitHub\'s static code analysis tool that helps you remediate issues in your code.',
  //       cta: 'Download the latest SAST ebook',
  //       image: '/developer img/her0.png',
  //       alt: 'Code scanning code'
  //     }
  //   ]
  // };
  // private authSubscription!: Subscription;
  constructor(
    private toolbarService: ToolbarService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.opacity = '1';
            (entry.target as HTMLElement).style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);

      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
        (section as HTMLElement).style.opacity = '0';
        (section as HTMLElement).style.transform = 'translateY(30px)';
        (section as HTMLElement).style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
      });

      const hero = document.querySelector('.hero') as HTMLElement;
      if (hero) {
        hero.style.opacity = '1';
        hero.style.transform = 'translateY(0)';
      }
    }
  }
  ngOnInit(): void {

}


}
