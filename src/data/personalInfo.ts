interface Social {
  platform: string;
  url: string;
  icon: string;
}

interface PersonalInfo {
  name: string;
  title: string;
  roles: string[];
  description: string;
  professionalStartYear: Date;
  about: {
    intro: string;
    skills: {
      title: string;
      icon: string;
      description: string;
    }[];
  };
  location: string;
  email: string;
  avatar: string;
  hobbies: {
    category: string;
    items: string[];
  }[];
  socials: Social[];
}

export const personalInfo: PersonalInfo = {
  name: "Standley Gury",
  title: "Senior Software Engineer",
  roles: [
    "Senior Software Engineer",
    "Full Stack Developer",
    ".NET Specialist",
    "React Enthusiast",
    "Angular Advocate",
    "Aurelia Explorer",
    "Azure Cloud Engineer",
    "Self-Hosting Enthusiast",
  ],
  professionalStartYear: new Date("2020-05-01"),
  description:
    "Driven by curiosity about the why behind the what, I ask questions relentlessly to understand systems at a fundamental level - not just how they work, but why they were designed that way. I focus on performance, efficiency, and smart resource use: breaking down complex problems, finding bottlenecks, and building scalable solutions that maximize impact with minimal complexity.",
  about: {
    intro:
      "I'm a senior software engineer from Malaysia with nearly {{years}} years of professional experience in software development. I specialize in Full Stack development using .NET, Aurelia, React, and Angular, backed by deep Azure expertise spanning Service Bus, Container Apps, Bicep IaC, CI/CD pipelines, App Insights, and Front Door.",
    skills: [
      {
        title: "Development",
        icon: "Code",
        description:
          "Full Stack development with a focus on creating clean, maintainable, and efficient code.",
      },
      {
        title: "Architecture",
        icon: "CodeIcon",
        description:
          "Designing robust and scalable systems using clean architecture and best practices.",
      },
    ],
  },
  location: "Kuala Lumpur, Malaysia",
  email: "standleypg@gmail.com",
  avatar: "images/profile.jpeg",
  hobbies: [
    {
      category: "Outdoor",
      items: ["Camping", "Badminton"],
    },
    {
      category: "Gaming",
      items: ["Dota 2"],
    },
    {
      category: "Music",
      items: ["Guitar", "Spotify"],
    },
    {
      category: "Self-Hosting",
      items: ["Jellyfin Media Server"],
    },
  ],
  socials: [
    {
      platform: "GitHub",
      url: "https://github.com/standleypg",
      icon: "Github",
    },
    {
      platform: "LinkedIn",
      url: "https://linkedin.com/in/standleypg",
      icon: "Linkedin",
    },
  ],
};
