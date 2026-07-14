import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import {
  LucideSearch,
  LucideFilter,
  LucideCheckCircle,
  LucideX,
  LucideExternalLink,
  LucideGlobe,
  LucideAward,
  LucideMapPin,
  LucideCalculator,
  LucidePhone,
  LucideCalendar,
  LucideArrowRight,
  LucideInfo,
  LucideCheck,
  LucideSparkles,
  LucideShieldCheck,
  LucideCoins,
  LucideFileText,
  LucideChevronDown,
  LucideHelpCircle,
  LucidePlusCircle,
  LucideBookOpen,
  LucideLayoutDashboard,
  LucideStore,
  LucideMessagesSquare,
  LucideDroplet,
  LucideTrendingUp
} from '@lucide/angular';

interface HelpField {
  name: string;
  purpose: string;
}

interface HelpFilter {
  name: string;
  options: string;
}

interface HelpFunctionality {
  name: string;
  desc: string;
  fields?: HelpField[];
  filters?: HelpFilter[];
}

interface HelpItem {
  id: number;
  title: string;
  path: string;
  icon: string;
  purpose: string;
  functionalities: HelpFunctionality[];
}

@Component({
  selector: 'fs-help',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    LucideSearch,
    LucideFilter,
    LucideCheckCircle,
    LucideX,
    LucideExternalLink,
    LucideGlobe,
    LucideAward,
    LucideMapPin,
    LucideCalculator,
    LucidePhone,
    LucideCalendar,
    LucideArrowRight,
    LucideInfo,
    LucideCheck,
    LucideSparkles,
    LucideShieldCheck,
    LucideCoins,
    LucideFileText,
    LucideChevronDown,
    LucideHelpCircle,
    LucidePlusCircle,
    LucideBookOpen,
    LucideLayoutDashboard,
    LucideStore,
    LucideMessagesSquare,
    LucideDroplet,
    LucideTrendingUp
  ],
  templateUrl: './help.component.html'
})
export class HelpComponent {
  readonly searchQuery = signal('');
  readonly expandedSections = signal<Set<number>>(new Set([1])); // default expand the first section

  readonly helpData: HelpItem[] = [
    {
      id: 1,
      title: 'Learning Resources',
      path: '/app/resources',
      icon: 'book',
      purpose: 'Education hub providing agricultural guides, farming videos, agronomy PDFs, and webinars for sustainable growth.',
      functionalities: [
        {
          name: 'Browse & Track Completion',
          desc: 'Read articles, watch videos, or open PDFs. You can click the "Mark Done" button on any resource card to track your training progress and increase your completion counts.'
        },
        {
          name: 'Resource Filtering',
          desc: 'Filter training courses to find relevant modules quickly.',
          filters: [
            { name: 'Type Filter', options: 'All Types, Video, PDF, Article, Webinar' },
            { name: 'Difficulty Level', options: 'All Levels, Beginner, Intermediate, Advanced' },
            { name: 'Crop Filter', options: 'Wheat, Rice, Cotton, and other seeded crops' },
            { name: 'Language Filter', options: 'English, Hindi, Marathi, Telugu, etc.' }
          ]
        },
        {
          name: 'Publishing New Resources (Modal Form)',
          desc: 'Exporters and specialists can click the "+ Add Resource" button to open a modal form and add new training materials.',
          fields: [
            { name: 'Title', purpose: 'Short, descriptive header of the course (e.g. Wheat Sowing Guide).' },
            { name: 'Description', purpose: 'Brief explanation of what the farmer will learn from this resource.' },
            { name: 'Content Type', purpose: 'Selectable buttons: VIDEO, PDF, ARTICLE, or WEBINAR.' },
            { name: 'Content URL', purpose: 'Absolute web link pointing to the PDF path, YouTube video, or article.' },
            { name: 'Crop Type', purpose: 'Binds this training material to a specific crop (e.g., Rice).' },
            { name: 'Topic', purpose: 'Classification tag like Irrigation, Soil Health, or Pest Management.' },
            { name: 'Language', purpose: 'Dropdown select matching the target language of the content.' },
            { name: 'Thumbnail URL', purpose: 'Optional link to an image file displaying as the card cover.' }
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Government Schemes',
      path: '/app/govt-schemes',
      icon: 'award',
      purpose: 'Advisory directory listing central and state financial assistances, crop subsidies, and farmer welfare benefits.',
      functionalities: [
        {
          name: 'Search & List Navigation',
          desc: 'Find central and state schemes by name or keywords. You can click on any card to slide open the details modal containing official helplines, checklists of required documents, and link-outs to application portals.'
        },
        {
          name: 'Eligibility Calculator Form',
          desc: 'Quick wizard to calculate whether you are eligible for certain subsidies.',
          fields: [
            { name: 'State Selection', purpose: 'Filter schemes corresponding to your primary farm region.' },
            { name: 'Farm Size', purpose: 'Land holding input in Acres to evaluate small/marginal farmer thresholds.' },
            { name: 'Primary Crop', purpose: 'Selects the specific crop to match crop-wise direct subsidies.' },
            { name: 'Farming Type', purpose: 'Options: Conventional or Organic. Matches special organic farming assistance.' },
            { name: 'Farmer Category', purpose: 'Options: General, Small, Marginal, SC/ST, OBC.' }
          ]
        }
      ]
    },
    {
      id: 3,
      title: 'Crop Insurance',
      path: '/app/insurance',
      icon: 'shield',
      purpose: 'Risk mitigation hub for shielding your crop assets against natural droughts, cyclones, and crop diseases.',
      functionalities: [
        {
          name: 'Policy Directory & Search',
          desc: 'Review available policies, insurance coverages, partner insurance providers, and claim processes by clicking policy cards.'
        },
        {
          name: 'Premium Calculator Form',
          desc: 'Calculate estimated payments before buying a policy.',
          fields: [
            { name: 'Selected Policy', purpose: 'Choose the policy you want to estimate rates for.' },
            { name: 'Farm Size', purpose: 'Number input for farm area in Acres (premium scales linearly by ₹500/Acre).' },
            { name: 'Crop Type', purpose: 'Selects the crop type associated with the premium rate.' }
          ]
        },
        {
          name: 'Claims Wizard Form',
          desc: 'Wizard to file insurance claims when crop damage occurs.',
          fields: [
            { name: 'Insurance Policy', purpose: 'Dropdown selector matching your active crop policy.' },
            { name: 'Crop Name', purpose: 'Direct text input naming the damaged crop.' },
            { name: 'Date of Occurrence', purpose: 'Calendar selector to record when the hazard happened.' },
            { name: 'Affected Area', purpose: 'Land area damaged in Acres.' },
            { name: 'Cause of Damage', purpose: 'Select dropdown: Drought, Flood, Pest outbreak, Hailstorm, Fire.' },
            { name: 'Loss Description', purpose: 'Text area describing physical details of the crop damage.' }
          ]
        }
      ]
    },
    {
      id: 4,
      title: 'Mandi Finder & Trends',
      path: '/app/mandi-finder',
      icon: 'map',
      purpose: 'Real-time Mandi finder and price tracking tool to find regional crop markets and compare crop rates.',
      functionalities: [
        {
          name: 'Market Search',
          desc: 'Identify the nearest market (Mandi) based on location coordinates (latitude/longitude) and radial distance in kilometers. Highlights Mandi contact numbers, operating hours, and crops traded.'
        },
        {
          name: 'Crop Price Trends & ROI Calculator',
          desc: 'Track price fluctuations (15-day forecasts and 30-day historical prices). Use the Transport ROI Calculator by entering crop quantity in quintals and transport costs to automatically determine the most profitable regional market.'
        }
      ]
    },
    {
      id: 5,
      title: 'Water Queue (Baari)',
      path: '/app/water-queue',
      icon: 'droplet',
      purpose: 'Digitized scheduling system for community water source sharing, featuring automated weather advisors.',
      functionalities: [
        {
          name: 'Book Water Slots (Form)',
          desc: 'Book slots for irrigating fields to prevent scheduling conflicts with other regional farmers.',
          fields: [
            { name: 'Water Source', purpose: 'Choose the communal water pump or tubewell.' },
            { name: 'Watering Date', purpose: 'Select the scheduled date for watering.' },
            { name: 'Watering Duration', purpose: 'Define the slot length in hours.' },
            { name: 'AI Weather Advisor', purpose: 'Checks weather forecast. Warns if rainfall is imminent to suggest rescheduling.' }
          ]
        }
      ]
    },
    {
      id: 6,
      title: 'Interactive Dashboards',
      path: '/app/dashboard',
      icon: 'dashboard',
      purpose: 'Centralized control room summarizing crop analytics, farm expenses, weather forecasts, alerts, and notifications.',
      functionalities: [
        {
          name: 'Notifications & Alerts Panel',
          desc: 'Recovers real-time alerts regarding crop calendars, upcoming tasks, weather shifts, disease outbreaks, and policy updates.'
        },
        {
          name: 'Farm Expense Analytics',
          desc: 'Track farm logs, input costs (seeds, tools, fertilizers), revenues, and calculate total net profitability across seasons.'
        }
      ]
    },
    {
      id: 7,
      title: 'Financial Tools',
      path: '/app/financial',
      icon: 'coins',
      purpose: 'Log operational crop expenses, compute estimated loan limits, and calculate agricultural profit margins.',
      functionalities: [
        {
          name: 'Expense Tracker Ledger',
          desc: 'Keep track of crop sowing, fertilizer purchases, labor wages, machinery rents, and fuel costs. Displays logged investments per season/year and totals overall expenses.'
        },
        {
          name: 'Log Farm Expense Form (Modal)',
          desc: 'Log new operational costs directly to your ledger log.',
          fields: [
            { name: 'Expense Type', purpose: 'Categorization options: Seeds, Fertilizers, Pesticides, Machinery Rent, Labor, Fuel, Irrigation, Other.' },
            { name: 'Amount (₹)', purpose: 'The monetary cost of the expense in Rupees.' },
            { name: 'Date', purpose: 'Calendar selector to record when the transaction took place.' },
            { name: 'Season', purpose: 'Specify the crop season: Kharif, Rabi, or Zaid.' },
            { name: 'Description', purpose: 'Text area for detailed notes (e.g. bought 5 bags of urea).' }
          ]
        },
        {
          name: 'Loan Eligibility Check Form',
          desc: 'Check estimated agricultural credit limits based on standard policies.',
          fields: [
            { name: 'Annual Farm Income', purpose: 'Farmers total earnings per year in Rupees.' },
            { name: 'Cultivable Land Area', purpose: 'Total crop acreage in Acres.' },
            { name: 'Existing Debt', purpose: 'Total other liabilities or outstanding loans in Rupees.' }
          ]
        },
        {
          name: 'Crop Yield ROI Calculator Form',
          desc: 'Estimate harvest profit margins and Return on Investment (ROI) ratios before selling crops.',
          fields: [
            { name: 'Harvest Yield Quantity', purpose: 'Total crop quantity harvested in Quintals.' },
            { name: 'Expected Market Price', purpose: 'Crop sale price per Quintal in Rupees.' },
            { name: 'Total Investment / Cost', purpose: 'Total cost incurred for cultivation in Rupees.' }
          ]
        }
      ]
    }
  ];

  readonly filteredHelpItems = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.helpData;

    return this.helpData.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchPath = item.path.toLowerCase().includes(q);
      const matchPurpose = item.purpose.toLowerCase().includes(q);
      
      const matchFuncs = item.functionalities.some((f) => {
        const matchName = f.name.toLowerCase().includes(q);
        const matchDesc = f.desc.toLowerCase().includes(q);
        
        const matchFields = f.fields?.some(
          (field) =>
            field.name.toLowerCase().includes(q) || field.purpose.toLowerCase().includes(q)
        );
        
        const matchFilters = f.filters?.some(
          (filter) =>
            filter.name.toLowerCase().includes(q) || filter.options.toLowerCase().includes(q)
        );

        return matchName || matchDesc || matchFields || matchFilters;
      });

      return matchTitle || matchPath || matchPurpose || matchFuncs;
    });
  });

  toggleSection(id: number): void {
    const next = new Set(this.expandedSections());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.expandedSections.set(next);
  }

  isExpanded(id: number): boolean {
    return this.expandedSections().has(id);
  }
}
