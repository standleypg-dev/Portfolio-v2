interface Project {
  project: string;
  url: string;
  description: string;
  shortDescription: string;
  technologies: string;
  liveUrl?: string | null;
}

export const projects: Project[] = [
  {
    project: "Music and Radio Discord Bot",
    url: "https://github.com/standleypg/LocalRadioAndMusicDiscordBot",
    description:
      "A Discord bot that plays music and radio stations in voice channels. This is fun project that I use on my own Discord server. This bot mainly to play local Malaysian radio stations. It uses the FFmpeg and Native Opus library to stream audio to Discord.",
    shortDescription:
      "Discord bot that plays music and radio stations in voice channels.",
    technologies:
      ".NET Core, Discord.NET, FFmpeg, Docker, libopus.so, Linux, Raspberry Pi",
    liveUrl: null,
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
  {
    project: "Jellyfin Automated Media Stack",
    url: "https://github.com/standleypg/Jellyfin-Automated-Media-Stack",
    description:
      "A fully automated self-hosted media server stack running on Docker. Request a movie or TV show once and the system automatically finds, downloads, adds subtitles, and streams it - a personal home media server for streaming.",
    shortDescription:
      "Fully automated self-hosted media server stack on Docker with Jellyfin.",
    technologies: "Docker, Jellyfin, Linux, Self-Hosting, Home Server",
    liveUrl: null,
  },
];
