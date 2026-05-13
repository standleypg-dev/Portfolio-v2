interface Project {
  project: string;
  url?: string | null;
  description: string;
  shortDescription: string;
  technologies: string;
  liveUrl?: string | null;
  images?: string[];
  isPrivate?: boolean;
}

export const projects: Project[] = [
  {
    project: "Commitly",
    url: null,
    isPrivate: true,
    description:
      "Self-hosted family finance tracker with two independent modes: recurring household Commitments (rent, loans, subscriptions) with statements and payments, and personal Daily Expenses with per-category budgets, trends, and a quick-add sheet. Includes a Telegram bot for reminders, receipt uploads, and one-tap logging. Installable as a PWA.",
    shortDescription:
      "Self-hosted family finance tracker with commitments, daily expenses, and a Telegram bot.",
    technologies:
      ".NET 10, EF Core, PostgreSQL, Clean Architecture, React, TypeScript, TailwindCSS, TanStack Router, Auth0, Telegram Bot, Docker",
    liveUrl: null,
    images: [
      "/images/commitly/commitly_6.png",
      "/images/commitly/commitly_7.png",
      "/images/commitly/commitly_8.png",
      "/images/commitly/commitly_9.png",
      "/images/commitly/commitly_10.png",
      "/images/commitly/commitly_1.png",
      "/images/commitly/commitly_2.png",
      "/images/commitly/commitly_3.png",
      "/images/commitly/commitly_4.png",
      "/images/commitly/commitly_5.png",
    ],
  },
  {
    project: "Music and Radio Discord Bot",
    url: "https://github.com/standleypg/LocalRadioAndMusicDiscordBot",
    description:
      "A Discord bot that streams music and local Malaysian radio stations into voice channels. Comes with a companion web dashboard that supports managing the radio station list, switching the active stream remotely, and inspecting playback analytics - active users, total plays, average plays per user, and a per-user leaderboard with songs played, unique tracks, and last-played timestamps. Runs on a Raspberry Pi using FFmpeg and the native Opus library to push audio to Discord.",
    shortDescription:
      "Discord bot for music and radio with a web dashboard for station control and playback analytics.",
    technologies:
      ".NET Core, Discord.NET, FFmpeg, Docker, libopus.so, Linux, Raspberry Pi",
    liveUrl: null,
    images: [
      "/images/discord_bot/discord_bot_1.png",
      "/images/discord_bot/discord_bot_2.png",
      "/images/discord_bot/discord_bot_3.png",
      "/images/discord_bot/discord_bot_4.png",
      "/images/discord_bot/discord_bot_5.png",
    ],
  },
  {
    project: "Jellyfin Automated Media Stack",
    url: "https://github.com/standleypg/Jellyfin-Automated-Media-Stack",
    description:
      "A fully automated self-hosted media server stack running on Docker. Request a movie or TV show once and the system automatically finds, downloads, adds subtitles, and streams it - a personal home media server for streaming.",
    shortDescription:
      "Fully automated self-hosted media server stack on Docker with Jellyfin.",
    technologies: "Docker, Jellyfin, Linux, Self-Hosting, Home Server",
    liveUrl: null,
    images: [
      "/images/jellyfin/jellyfin_1.png",
      "/images/jellyfin/jellyfin_2.png",
      "/images/jellyfin/jellyfin_3.png",
    ],
  },
  {
    project: "Modular Clean Architecture Template",
    url: "https://github.com/standleypg/Modular-Clean-Architecture-with-Service-Layer-Pattern-and-OData-Endpoints",
    description:
      "A comprehensive .NET template implementing Modular Clean Architecture with OData integration and .NET Aspire for orchestration. Serves as a starting point and best-practice reference for building scalable, maintainable .NET applications with advanced querying and orchestration capabilities.",
    shortDescription:
      "Modular Clean Architecture .NET template with OData and .NET Aspire orchestration.",
    technologies:
      ".NET Core, Clean Architecture, .NET Aspire, OData, MediatR, FluentValidation, Swagger, Serilog, Docker, PostgreSQL, Entity Framework Core",
    liveUrl: null,
  },
  {
    project: "GenItEasy",
    url: "https://github.com/standleypg/GenItEasy",
    description:
      "A .NET library and CLI tool for generating TypeScript type definitions from C# assemblies. Bridges the gap between .NET backends and TypeScript frontends by automating type generation, reducing manual effort and type mismatch errors.",
    shortDescription:
      ".NET library and CLI tool for generating TypeScript type definitions from C# assemblies.",
    technologies: ".NET Core, C#, TypeScript, CLI, Code Generation",
    liveUrl: null,
  },
];
