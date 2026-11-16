import { Button } from "@/components/ui/button";
import { Field, FieldSeparator } from "@/components/ui/field";

export interface SocialAuthButtonsProps {
  onGoogleLogin?: () => void;
  onMicrosoftLogin?: () => void;
  disabled?: boolean;
}

export function SocialAuthButtons({
  onGoogleLogin,
  onMicrosoftLogin,
  disabled = false,
}: SocialAuthButtonsProps) {
  return (
    <>
      <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
        Or continue with
      </FieldSeparator>

      <Field className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          disabled={disabled}
          onClick={onGoogleLogin}
        >
          Google
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={disabled}
          onClick={onMicrosoftLogin}
        >
          Microsoft
        </Button>
      </Field>
    </>
  );
}
