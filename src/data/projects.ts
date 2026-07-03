export interface ProjectImage {
  src: string;
  portrait?: boolean;
}

interface Project {
  project: string;
  url?: string | null;
  problem: string;
  built: string;
  outcome: string;
  shortDescription: string;
  technologies: string[];
  liveUrl?: string | null;
  images?: ProjectImage[];
  isPrivate?: boolean;
}

export const projects: Project[] = [
  {
    project: "Commitly",
    url: null,
    isPrivate: true,
    problem:
      "Rent, loans, subscriptions, and daily spending lived across different apps and spreadsheets; nobody in the family had the full picture.",
    built:
      "A self-hosted finance tracker with two independent modes: recurring household commitments with statements and payments, and personal daily expenses with per-category budgets and trends. A Telegram bot handles reminders, receipt uploads, and one-tap logging, and the whole thing installs as a PWA.",
    outcome:
      "The whole household now logs spending in seconds from Telegram, and every commitment is visible in one place, running entirely on our own hardware.",
    shortDescription:
      "Self-hosted family finance tracker with commitments, daily expenses, and a Telegram bot.",
    technologies: [
      ".NET 10",
      "EF Core",
      "PostgreSQL",
      "Clean Architecture",
      "React",
      "TypeScript",
      "TailwindCSS",
      "TanStack Router",
      "Auth0",
      "Telegram Bot",
      "Docker",
    ],
    liveUrl: null,
    images: [
      { src: "/images/commitly/commitly_6.webp" },
      { src: "/images/commitly/commitly_7.webp" },
      { src: "/images/commitly/commitly_8.webp" },
      { src: "/images/commitly/commitly_9.webp" },
      { src: "/images/commitly/commitly_10.webp" },
      { src: "/images/commitly/commitly_1.webp", portrait: true },
      { src: "/images/commitly/commitly_2.webp", portrait: true },
      { src: "/images/commitly/commitly_3.webp", portrait: true },
      { src: "/images/commitly/commitly_4.webp", portrait: true },
      { src: "/images/commitly/commitly_5.webp", portrait: true },
    ],
  },
  {
    project: "Music & Radio Discord Bot",
    url: "https://github.com/standleypg/LocalRadioAndMusicDiscordBot",
    problem:
      "No Discord bot streamed local Malaysian radio stations, and hosted music bots kept getting shut down or paywalled.",
    built:
      "A .NET bot that streams music and local radio into voice channels through FFmpeg and the native Opus library, plus a companion web dashboard for managing the station list, switching the active stream remotely, and inspecting playback analytics.",
    outcome:
      "Runs 24/7 on a Raspberry Pi. The dashboard tracks active users, total plays, and a per-user leaderboard with songs played, unique tracks, and last-played timestamps.",
    shortDescription:
      "Discord bot for music and radio with a web dashboard for station control and playback analytics.",
    technologies: [
      ".NET Core",
      "Discord.NET",
      "FFmpeg",
      "Docker",
      "libopus",
      "Linux",
      "Raspberry Pi",
    ],
    liveUrl: null,
    images: [
      { src: "/images/discord_bot/discord_bot_1.webp" },
      { src: "/images/discord_bot/discord_bot_2.webp" },
      { src: "/images/discord_bot/discord_bot_3.webp" },
      { src: "/images/discord_bot/discord_bot_4.webp" },
      { src: "/images/discord_bot/discord_bot_5.webp" },
    ],
  },
  {
    project: "Jellyfin Automated Media Stack",
    url: "https://github.com/standleypg/Jellyfin-Automated-Media-Stack",
    problem:
      "Watching a movie at home meant manually finding, downloading, and organizing files, every single time.",
    built:
      "A fully automated, self-hosted media pipeline on Docker: request a movie or show once and the stack finds it, downloads it, adds subtitles, and serves it through Jellyfin.",
    outcome:
      "A zero-touch home media server: from request to streaming with no manual steps in between.",
    shortDescription:
      "Fully automated self-hosted media server stack on Docker with Jellyfin.",
    technologies: ["Docker", "Jellyfin", "Linux", "Self-Hosting", "Home Server"],
    liveUrl: null,
    images: [
      { src: "/images/jellyfin/jellyfin_1.webp" },
      { src: "/images/jellyfin/jellyfin_2.webp" },
      { src: "/images/jellyfin/jellyfin_3.webp" },
    ],
  },
  {
    project: "Modular Clean Architecture Template",
    url: "https://github.com/standleypg/Modular-Clean-Architecture-with-Service-Layer-Pattern-and-OData-Endpoints",
    problem:
      "Every new .NET service restarted the same boilerplate decisions: project layout, querying, validation, orchestration.",
    built:
      "A modular Clean Architecture template with OData endpoints, MediatR, FluentValidation, and .NET Aspire orchestration.",
    outcome:
      "A reusable, best-practice starting point for scalable .NET applications.",
    shortDescription:
      "Modular Clean Architecture .NET template with OData and .NET Aspire orchestration, a best-practice starting point for new services.",
    technologies: [
      ".NET Core",
      "Clean Architecture",
      ".NET Aspire",
      "OData",
      "MediatR",
      "FluentValidation",
      "PostgreSQL",
      "Docker",
    ],
    liveUrl: null,
  },
  {
    project: "GenItEasy",
    url: "https://github.com/standleypg/GenItEasy",
    problem:
      "Keeping TypeScript types in sync with C# contracts by hand invites drift and runtime bugs.",
    built:
      "A .NET library and CLI that generates TypeScript type definitions straight from C# assemblies.",
    outcome:
      "Backend and frontend share one source of truth for types, with no manual duplication.",
    shortDescription:
      ".NET library and CLI tool that generates TypeScript type definitions straight from C# assemblies.",
    technologies: [".NET Core", "C#", "TypeScript", "CLI", "Code Generation"],
    liveUrl: null,
  },
];
