import React from "react";
import GitHubIcon from "./GitHub";
import TwitterIcon from "./TwitterIcon";
import LinkedInIcon from "./LinkedInIcon";

interface SocialIconProps {
  platform: string;
  size?: number;
}

const SocialIcon: React.FC<SocialIconProps> = ({ platform, size = 20 }) => {
  switch (platform) {
    case "GitHub":
      return <GitHubIcon size={size} />;
    case "LinkedIn":
      return <LinkedInIcon size={size} />;
    case "Twitter":
      return <TwitterIcon size={size} />;
    default:
      return null;
  }
};

export default SocialIcon;
