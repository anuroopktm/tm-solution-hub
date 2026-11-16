import loginBackground from "@/assets/login-background.jpg";
import { cn } from "cn";

export interface AuthHeroPanelProps {
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
}

export function AuthHeroPanel({
  imageSrc = loginBackground,
  imageAlt = "Login background",
  className,
}: AuthHeroPanelProps) {
  return (
    <div className={cn("relative hidden bg-muted md:block", className)}>
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  );
}
