interface WorkExperience {
  project: string;
  role: string;
  company: string;
  clientCompany?: string;
  description: string;
  imageUrl: string;
  companyLink: string;
  clientCompanyLink?: string;
  projectLink?: string;
  responsibilities?: string[];
}

export type { WorkExperience };

export const workExperience: WorkExperience[] = [
  {
    project: "Adra",
    role: "Associate Tech Lead",
    company: "99x",
    clientCompany: "Trintech",
    description:
      "Full-stack engineer on a financial reconciliation platform processing billions of transaction records annually. Built and delivered features across ASP.NET Core and Aurelia, modernized core dependencies, enhanced async workflows with Azure Service Bus, extended real-time notifications via SignalR, and managed cloud infrastructure using Bicep, Container Apps, and CI/CD with Feature Flags for zero-downtime deployments.",
    imageUrl:
      "https://www.trintech.com/wp-content/uploads/2022/12/pexels-karolina-grabowska-4491461-1920x1280.jpg",
    companyLink: "https://99x.io/malaysia",
    clientCompanyLink: "https://www.trintech.com/",
    projectLink: "https://www.trintech.com/adra/",
    responsibilities: [
      "Migrated enterprise reconciliation platform from Autofac to native .NET DI and AutoMapper to Mapperly, modernizing from legacy dependencies and eliminating future licensing costs.",
      "Resolved critical performance bottlenecks by reducing database query times from over 60 seconds to under 30 seconds through SQL Server query plan analysis, strategic indexing, and EF Core LINQ optimization using Extended Events.",
      "Updated NuGet package source mapping to mitigate supply chain attacks, enforcing strict package origin validation for internal and external dependencies.",
      "Developed and delivered full-stack features for financial reconciliation platform processing billions of transaction records annually using ASP.NET Core and Aurelia, collaboratively designing solutions with cross-functional team.",
      "Enhanced automated reconciliation workflows using Azure Service Bus for asynchronous processing, integrating diverse data sources including Office 365, PDFs, XMLs, and industry-specific formats.",
      "Extended real-time notification capabilities using SignalR for status updates, user interactions, and async process completion.",
      "Contributed to data lifecycle management using CosmosDB for archived transactions and document storage, optimizing SQL Server for active data and maintaining query performance at scale.",
      "Enhanced Azure infrastructure-as-code using Bicep and maintained ephemeral PR environments with Container Apps (2-week auto-cleanup), managing complete infrastructure stacks.",
      "Delivered features through progressive rollouts using Azure Feature Flags and CI/CD pipelines and modified Front Door/WAF configurations to address API blocking issues for zero-downtime deployments.",
      "Worked on deployment architecture separating core applications (App Service) from background workers (Container Apps) using interface-based abstraction.",
      "Maintained and enhanced Selenium-based E2E test framework with page object model, developing test coverage for new features and optimizing execution performance.",
      "Leveraged Azure App Insights for operational monitoring, reliability tracking, and proactive incident detection.",
    ],
  },
  {
    project: "Optimar Commander",
    role: "Senior Software Engineer",
    company: "99x",
    clientCompany: "Optimar",
    description:
      "Developed scalable IoT solutions for industrial automation, focusing on real-time telemetry and analytics using Azure cloud services. Built high-reliability IoT pipelines processing high volumes of daily events from thousands of devices across Optimar's global fish processing operations.",
    imageUrl: "images/optimar-commander.jpg",
    companyLink: "https://99x.io/malaysia",
    clientCompanyLink: "https://www.optimar.no/",
    projectLink: "https://optimarglobal.com/en/machines/software-and-control/commander",
    responsibilities: [
      "Built and maintained high-reliability IoT pipeline processing high volumes of daily events from thousands of devices.",
      "Architected microservices using Azure Functions, IoT Hub, Event Hub, and Redis for real-time analytics.",
      "Enabled real-time industrial data streaming and processing with significant performance improvements.",
      "Optimized SQL Server and PostgreSQL database performance through advanced tuning strategies.",
      "Implemented automated CI/CD pipelines using Azure DevOps, substantially reducing deployment errors.",
      "Actively participated in Agile Scrum practices including sprint planning, retrospectives, and cross-team collaboration.",
    ],
  },
  {
    project: "Integrated Operations Center",
    role: "Software Engineer",
    company: "Impact Business Solutions",
    description:
      "Led development of integrated smart city solutions including operation centers, smart parking systems, and inventory management platforms for public sector clients in Sarawak.",
    imageUrl: "images/sioc.jpg",
    companyLink: "https://impact-multimedia.com/ibs/",
    responsibilities: [
      "Collaborated with a development team in full-stack application development using .NET, Angular, and Blazor.",
      "Successfully integrated multiple third-party APIs and SDKs for comprehensive smart city solutions.",
      "Configured and optimized server infrastructure (MariaDB, NGINX) for enhanced performance and security.",
      "Contributed to project coordination, task breakdowns, and code review processes.",
    ],
  },
  {
    project: "Internet in a Box",
    role: "Software Engineer",
    company: "Sarawak Information Systems",
    description:
      "The Internet in a Box project uses a Raspberry Pi to provide offline access to digital content and services, bringing educational resources to disconnected schools in rural areas in Sarawak.",
    imageUrl: "images/rpi.webp",
    companyLink: "https://www.sains.com.my/",
    responsibilities: [
      "Developed robust backend services for IoT edge device communication using custom protocols.",
      "Built scalable upstream/downstream data exchange services.",
      "Successfully deployed applications to on-premise IIS servers with 99.5% uptime.",
      "Conducted technology research and innovation initiatives for system improvements.",
    ],
  },
  {
    project: "Building Security Management System",
    role: "Software Engineer",
    company: "Sarawak Information Systems",
    description:
      "The Building Security Management System integrates Hikvision's and Suprema's devices and SDK to centralize control and monitoring of security in a building. It efficiently manages video surveillance, access control, and alarm systems.",
    imageUrl:
      "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    companyLink: "https://www.sains.com.my/",
    responsibilities: [
      "Integrated Hikvision and Suprema SDKs for comprehensive security and access control systems.",
      "Built scalable upstream/downstream data exchange services.",
      "Successfully deployed applications to on-premise IIS servers with 99.5% uptime.",
      "Conducted technology research and innovation initiatives for system improvements.",
    ],
  },
];
