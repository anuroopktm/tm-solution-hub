import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface InputGroupProps extends React.ComponentProps<"div"> {}

export function InputGroup({ className, children, ...props }: InputGroupProps) {
  return (
    <div
      data-slot="input-group"
      className={cn("relative flex w-full items-center", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface InputGroupAddonProps extends React.ComponentProps<"div"> {
  align?: "left" | "right";
}

export function InputGroupAddon({
  className,
  align = "right",
  children,
  ...props
}: InputGroupAddonProps) {
  return (
    <div
      data-slot="input-group-addon"
      className={cn(
        "absolute top-0 bottom-0 flex items-center justify-center px-2 text-muted-foreground",
        align === "left" ? "left-0" : "right-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface PasswordInputProps extends React.ComponentProps<typeof Input> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

export function PasswordInput({
  className,
  showPassword: controlledShow,
  onTogglePassword,
  disabled,
  ...props
}: PasswordInputProps) {
  const [internalShow, setInternalShow] = React.useState(false);
  const isControlled = controlledShow !== undefined;
  const show = isControlled ? controlledShow : internalShow;

  const handleToggle = () => {
    if (onTogglePassword) {
      onTogglePassword();
    } else {
      setInternalShow((prev) => !prev);
    }
  };

  return (
    <InputGroup>
      <Input
        type={show ? "text" : "password"}
        className={cn("pr-9", className)}
        disabled={disabled}
        {...props}
      />
      <InputGroupAddon align="right">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-transparent"
          onClick={handleToggle}
          disabled={disabled}
          tabIndex={-1}
          title={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="sr-only">
            {show ? "Hide password" : "Show password"}
          </span>
        </Button>
      </InputGroupAddon>
    </InputGroup>
  );
}
