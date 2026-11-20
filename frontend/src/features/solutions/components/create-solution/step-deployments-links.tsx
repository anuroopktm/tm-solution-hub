import type { FieldErrors, UseFormRegister } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";

export interface StepDeploymentsLinksProps {
  register: UseFormRegister<SolutionCreateFormValues>;
  errors: FieldErrors<SolutionCreateFormValues>;
  isPending: boolean;
}

export function StepDeploymentsLinks({
  register,
  errors,
  isPending,
}: StepDeploymentsLinksProps) {
  return (
    <Card key="step-2">
      <CardHeader>
        <CardTitle>Deployments & Links</CardTitle>
        <CardDescription>
          External links, live preview, and thumbnail banner.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Field>
          <Label htmlFor="repo-url">
            Repository URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="repo-url"
            type="url"
            placeholder="https://github.com/organization/repository"
            disabled={isPending}
            aria-invalid={Boolean(errors.repository_url)}
            {...register("repository_url")}
          />
        </Field>

        <Field>
          <Label htmlFor="preview-url">
            Live Preview / Documentation URL{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="preview-url"
            type="url"
            placeholder="https://demo.example.com"
            disabled={isPending}
            aria-invalid={Boolean(errors.preview_url)}
            {...register("preview_url")}
          />
        </Field>

        <Field>
          <Label htmlFor="thumbnail-url">
            Thumbnail / Banner Image URL{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="thumbnail-url"
            type="url"
            placeholder="https://images.example.com/banner.png"
            disabled={isPending}
            aria-invalid={Boolean(errors.thumbnail_url)}
            {...register("thumbnail_url")}
          />
        </Field>
      </CardContent>
    </Card>
  );
}
