import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  CreateSolutionBreadcrumb,
  SolutionFormHeader,
  SolutionCreateFormView,
} from "./index";
import type { SolutionCreateFormValues } from "@/schemas/solution.schema";
import type { UseSolutionFormReturn } from "@/features/solutions/hooks/use-solution-form";

describe("Create Solution Views and Steps", () => {
  afterEach(cleanup);

  describe("CreateSolutionBreadcrumb", () => {
    it("renders breadcrumb navigation items", () => {
      render(
        <MemoryRouter>
          <CreateSolutionBreadcrumb />
        </MemoryRouter>,
      );

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Create Solution")).toBeInTheDocument();
    });
  });

  describe("SolutionFormHeader", () => {
    it("renders heading and action buttons", () => {
      render(
        <MemoryRouter>
          <SolutionFormHeader isPending={false} />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole("heading", { name: "Create Solution" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /cancel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /publish solution/i }),
      ).toBeInTheDocument();
    });

    it("disables actions when isPending is true", () => {
      render(
        <MemoryRouter>
          <SolutionFormHeader isPending={true} />
        </MemoryRouter>,
      );

      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      expect(cancelBtn).toHaveAttribute("data-disabled");
      expect(
        screen.getByRole("button", { name: /publish solution/i }),
      ).toBeDisabled();
    });
  });

  describe("SolutionCreateFormView (Unified Multi-Step Orchestrator)", () => {
    function SolutionCreateFormViewWrapper({
      initialStep = 0,
      customFormState = {},
      defaultValues = {},
    }: {
      initialStep?: number;
      customFormState?: Partial<UseSolutionFormReturn>;
      defaultValues?: Partial<SolutionCreateFormValues>;
    }) {
      const { control, register, watch } = useForm<SolutionCreateFormValues>({
        defaultValues: {
          title: "",
          description: "",
          category_ids: [],
          lead_id: "",
          repository_url: "",
          preview_url: "",
          thumbnail_url: "",
          tech_stack: ["TypeScript"],
          key_capabilities: [],
          service_urls: [],
          documents: [],
          videos: [],
          ...defaultValues,
        },
      });

      const mockFormState: UseSolutionFormReturn = {
        register,
        control,
        handleSubmit: vi.fn((e) => {
          e?.preventDefault?.();
          return Promise.resolve();
        }),
        errors: {},
        watch,
        trigger: vi.fn().mockResolvedValue(true) as any,
        getValues: vi.fn().mockReturnValue({
          title: "Test Solution",
          description: "Enterprise Search Platform Architecture",
          category_ids: ["cat-1"],
          lead_id: "user-1",
          tech_stack: ["TypeScript"],
          repository_url: "https://github.com/example/repo",
          preview_url: "https://demo.example.com",
          thumbnail_url: "https://example.com/banner.png",
          key_capabilities: [{ name: "Search", description: "Fast indexing" }],
          service_urls: [
            {
              service_name: "REST API",
              service_type: "REST API",
              environment: "Production",
              target_url: "https://api.example.com",
            },
          ],
          documents: [],
          videos: [],
          ...defaultValues,
        }) as any,
        isPending: false,
        categories: [{ id: "cat-1", name: "Artificial Intelligence" }],
        categoriesLoading: false,
        users: [
          {
            id: "user-1",
            username: "tech_lead",
            role: "lead",
            is_deleted: false,
          } as any,
        ],
        usersLoading: false,
        techStack: ["TypeScript"],
        currentTech: "",
        setCurrentTech: vi.fn(),
        handleAddTech: vi.fn(),
        handleRemoveTech: vi.fn(),
        handleKeyDownTech: vi.fn(),
        selectedCategoryIds: ["cat-1"],
        toggleCategory: vi.fn(),
        capabilities: [{ id: "cap-1" }],
        handleAddCapability: vi.fn(),
        handleRemoveCapability: vi.fn(),
        serviceUrls: [{ id: "svc-1" }],
        handleAddService: vi.fn(),
        handleRemoveService: vi.fn(),
        documents: [],
        handleAddDocument: vi.fn(),
        handleRemoveDocument: vi.fn(),
        videos: [],
        handleAddVideo: vi.fn(),
        handleRemoveVideo: vi.fn(),
        ...customFormState,
      };

      return (
        <MemoryRouter>
          <SolutionCreateFormView
            {...mockFormState}
            initialStep={initialStep}
          />
        </MemoryRouter>
      );
    }

    it("renders stepper progress and Step 0 (General Information) cleanly", () => {
      render(<SolutionCreateFormViewWrapper initialStep={0} />);

      expect(
        screen.getByRole("heading", { name: "Create Solution" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText("1/4")).toBeInTheDocument();
      expect(screen.getByText("General Information")).toBeInTheDocument();
      expect(screen.getByLabelText(/solution title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description & scope/i)).toBeInTheDocument();
      expect(screen.getByText("Domain Categories")).toBeInTheDocument();
      expect(screen.getByText("Technical Lead")).toBeInTheDocument();
    });

    it("renders Step 1 (Tech & Capabilities) with MultiSelectCombobox for tech and dynamic capabilities", () => {
      const handleAddTech = vi.fn();
      const handleRemoveTech = vi.fn();

      render(
        <SolutionCreateFormViewWrapper
          initialStep={1}
          defaultValues={{
            tech_stack: ["TypeScript", "Docker"],
            key_capabilities: [
              { name: "AI Automation", description: "Smart routing" },
            ],
          }}
          customFormState={{
            techStack: ["TypeScript", "Docker"],
            handleAddTech,
            handleRemoveTech,
          }}
        />,
      );

      expect(screen.getByText("Tech & Capabilities")).toBeInTheDocument();
      expect(
        screen.getByLabelText(/technologies and frameworks/i),
      ).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("Docker")).toBeInTheDocument();

      // Remove tech tag via chip remove button
      const removeButtons = screen.getAllByRole("button", {
        name: /remove item/i,
      });
      expect(removeButtons.length).toBeGreaterThan(0);
      fireEvent.click(removeButtons[1]);
      expect(handleRemoveTech).toHaveBeenCalledWith("Docker");

      // Key capabilities with Add Feature button and dynamic rows
      expect(screen.getByText("Key Capabilities")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /add feature/i }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Capability 1 Title")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Capability 1 Description"),
      ).toBeInTheDocument();
    });

    it("renders Step 2 (Deployments & Links) with Project Links and Service Endpoints", () => {
      render(
        <SolutionCreateFormViewWrapper
          initialStep={2}
          defaultValues={{
            service_urls: [
              {
                service_name: "REST API",
                service_type: "REST API",
                environment: "Production",
                target_url: "https://api.example.com",
              },
            ],
          }}
        />,
      );

      expect(screen.getByText("Deployments & Links")).toBeInTheDocument();
      expect(screen.getByText("Project Links")).toBeInTheDocument();
      expect(screen.getByLabelText(/repository url/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/live preview \/ documentation url/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/thumbnail \/ banner image url/i),
      ).toBeInTheDocument();

      // Service Endpoints Combobox and configuration section
      expect(screen.getByText("Service Endpoints")).toBeInTheDocument();
      expect(screen.getAllByText("REST API").length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText("Selected service configuration"),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Service 1 Environment"),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("Service 1 Target URL")).toBeInTheDocument();
    });

    it("renders Step 3 (Assets & Review) with assets controls and review summary", () => {
      render(
        <SolutionCreateFormViewWrapper
          initialStep={3}
          defaultValues={{
            documents: [
              {
                name: "Architecture Diagram",
                format: "PNG",
                file_url: "https://example.com/arch.png",
                file_size_bytes: 1048576,
              },
            ],
            videos: [
              {
                title: "Product Walkthrough",
                video_url: "https://youtube.com/watch?v=123",
              },
            ],
          }}
        />,
      );

      expect(screen.getByText("Assets & Review")).toBeInTheDocument();
      expect(screen.getByText("Supplementary Assets")).toBeInTheDocument();
      expect(screen.getByText("2 assets")).toBeInTheDocument();
      expect(screen.getByText("Architecture Diagram")).toBeInTheDocument();
      expect(screen.getByText("PNG · 1.0 MB")).toBeInTheDocument();
      expect(screen.getByText("Product Walkthrough")).toBeInTheDocument();

      // Review details
      expect(screen.getByText("Review Details")).toBeInTheDocument();
      expect(screen.getByText("1. General Information")).toBeInTheDocument();
      expect(screen.getByText("2. Tech & Capabilities")).toBeInTheDocument();
      expect(screen.getByText("3. Deployments & Links")).toBeInTheDocument();
      expect(screen.getByText("4. Assets & Media")).toBeInTheDocument();

      // Clicking an edit button in review navigates to that step
      const editButtons = screen.getAllByRole("button", { name: "Edit" });
      expect(editButtons.length).toBeGreaterThan(0);
      fireEvent.click(editButtons[0]);
      // Should now show Step 0
      expect(screen.getByText("General Information")).toBeInTheDocument();
    });

    it("reveals inline Add Asset form when Add Asset button is clicked and cancels on cancel", () => {
      render(<SolutionCreateFormViewWrapper initialStep={3} />);

      expect(screen.queryByText("Add New Asset")).not.toBeInTheDocument();

      const addBtn = screen.getByRole("button", { name: /add asset/i });
      fireEvent.click(addBtn);

      expect(screen.getByText("Add New Asset")).toBeInTheDocument();
      expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument();
      expect(screen.getByText(/choose a file/i)).toBeInTheDocument();

      const closeBtn = screen.getByRole("button", { name: /close form/i });
      fireEvent.click(closeBtn);

      expect(screen.queryByText("Add New Asset")).not.toBeInTheDocument();
    });

    it("displays validation alert when errors are present for the active step", () => {
      render(
        <SolutionCreateFormViewWrapper
          initialStep={0}
          customFormState={{
            errors: {
              title: {
                type: "manual",
                message: "Title is missing (minimum 2 words required)",
              },
              description: {
                type: "manual",
                message:
                  "Description is too short (minimum 10 characters required)",
              },
            },
          }}
        />,
      );

      expect(
        screen.getByText("Please resolve the following errors"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Title is missing (minimum 2 words required)"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Description is too short (minimum 10 characters required)",
        ),
      ).toBeInTheDocument();
    });

    it("displays validation alert on Step 1 when tech_stack or key_capabilities are missing or invalid", () => {
      render(
        <SolutionCreateFormViewWrapper
          initialStep={1}
          customFormState={{
            errors: {
              tech_stack: {
                type: "manual",
                message:
                  "Please select or add at least 1 technology or framework",
              },
              key_capabilities: [
                {
                  name: {
                    type: "manual",
                    message: "Capability title is required",
                  },
                  description: {
                    type: "manual",
                    message: "Capability description is required",
                  },
                },
              ] as any,
            },
          }}
        />,
      );

      expect(
        screen.getByText("Please resolve the following errors"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "Please select or add at least 1 technology or framework",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Capability title is required"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Capability description is required"),
      ).toBeInTheDocument();
      expect(screen.queryByText("too_small")).not.toBeInTheDocument();
    });
  });
});
