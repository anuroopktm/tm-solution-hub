interface SolutionFormHeaderProps {
  isPending?: boolean;
}

export function SolutionFormHeader(_props?: SolutionFormHeaderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Create Solution</h1>
      <p className="text-sm text-muted-foreground">
        Publish a technical solution, architecture blueprint, or reusable
        codebase.
      </p>
    </div>
  );
}
