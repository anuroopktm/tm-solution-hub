import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { AuthHeroPanel } from "./auth-hero-panel";
import {
  useLoginForm,
  type UseLoginFormOptions,
} from "../hooks/use-login-form";

export interface AuthCardProps {
  title?: string;
  description?: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  formOptions?: UseLoginFormOptions;
  onGoogleLogin?: () => void;
  onMicrosoftLogin?: () => void;
}

export function AuthCard({
  title,
  description,
  heroImageSrc,
  heroImageAlt,
  formOptions,
  onGoogleLogin,
  onMicrosoftLogin,
}: AuthCardProps) {
  const loginForm = useLoginForm(formOptions);

  return (
    <Card className="overflow-hidden p-0">
      <CardContent className="grid p-0 md:grid-cols-2">
        <LoginForm
          register={loginForm.register}
          handleSubmit={loginForm.handleSubmit}
          errors={loginForm.errors}
          isPending={loginForm.isPending}
          isError={loginForm.isError}
          errorMessage={loginForm.errorMessage}
          title={title}
          description={description}
          onGoogleLogin={onGoogleLogin}
          onMicrosoftLogin={onMicrosoftLogin}
        />

        <AuthHeroPanel imageSrc={heroImageSrc} imageAlt={heroImageAlt} />
      </CardContent>
    </Card>
  );
}
