import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { PageHeader } from "@/components/common/page-header";

export default function ChatPage() {
  return (
    <>
      <PageHeader>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Chat</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </PageHeader>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              AI Solutions Assistant
            </h2>
            <p className="mt-1 text-sm">
              Chat interface will appear here. Start a conversation to search
              solutions.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
