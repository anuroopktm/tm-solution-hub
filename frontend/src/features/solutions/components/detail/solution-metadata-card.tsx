import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Layers } from "lucide-react";
import type { Solution } from "@/types/solution.types";

interface SolutionMetadataCardProps {
  solution: Solution;
}

export function SolutionMetadataCard({ solution }: SolutionMetadataCardProps) {
  return (
    <div className="space-y-6">
      {/* Tech Stack */}
      {solution.tech_stack && solution.tech_stack.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Layers className="size-4 text-primary" />
              <span>Technology Stack</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {solution.tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary" className="font-normal">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Solution Lead & Categories Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Metadata & Ownership
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {solution.lead && (
            <div>
              <span className="text-muted-foreground uppercase tracking-wider font-semibold text-xs">
                Lead Architect
              </span>
              <div className="mt-1.5 flex items-center gap-2.5">
                <Avatar className="size-8">
                  <AvatarFallback>
                    {solution.lead.username?.slice(0, 2).toUpperCase() || "TM"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">
                    {solution.lead.username}
                  </p>
                  <p className="text-muted-foreground">{solution.lead.email}</p>
                </div>
              </div>
            </div>
          )}

          {solution.categories && solution.categories.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <span className="text-muted-foreground uppercase tracking-wider font-semibold text-xs">
                Categories
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {solution.categories.map((cat) => (
                  <Link key={cat.id} to={`/categories/${cat.id}`}>
                    <Badge
                      variant="outline"
                      className="hover:bg-muted cursor-pointer"
                    >
                      {cat.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-border/50 space-y-1 text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              <span>
                Added: {new Date(solution.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
