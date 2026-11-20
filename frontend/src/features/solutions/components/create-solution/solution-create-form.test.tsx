import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  CreateSolutionBreadcrumb,
  SolutionFormHeader,
  SolutionCreateFormView,
  SolutionFormValidationAlert,
  SolutionFormFooter,
  extractErrorMessages,
} from "./index";
import type { SolutionCreateFormValues } from "../../../../schemas/solution.schema";
import type { UseSolutionFormReturn } from "../../hooks/use-solution-form";

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
    it("renders heading and description without action buttons in the header", () => {
      render(
        <MemoryRouter>
          <SolutionFormHeader />
        </MemoryRouter>,
      );

      expect(
        screen.getByRole("heading", { name: "Create Solution" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Publish a technical solution, architecture blueprint, or reusable codebase/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /cancel/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /publish solution/i }),
      ).not.toBeInTheDocument();
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
      const { control, register, watch, setValue } =
        useForm<SolutionCreateFormValues>({
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
        setValue: setValue as any,
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
        categories: [
          {
            id: "cat-1",
            name: "Artificial Intelligence",
            description: "AI solutions",
          },
        ],
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

    it("renders Step 2 (Deployments & Links) with Project Links in individual rows", () => {
      render(
        <SolutionCreateFormViewWrapper
          initialStep={2}
          defaultValues={{
            repository_url: "https://github.com/organization/repository",
            preview_url: "https://demo.example.com",
            thumbnail_url: "https://images.example.com/banner.png",
          }}
        />,
      );

      expect(screen.getByText("Deployments & Links")).toBeInTheDocument();
      expect(screen.getByLabelText(/repository url/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/live preview \/ documentation url/i),
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText(/thumbnail \/ banner image url/i),
      ).toBeInTheDocument();
    });

    it("renders Step 3 (Assets & Media) with assets controls", () => {
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

      expect(
        screen.getAllByText("Assets & Media").length,
      ).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Supplementary Assets")).toBeInTheDocument();
      expect(screen.getByText("2 assets")).toBeInTheDocument();
      expect(screen.getByText("Architecture Diagram")).toBeInTheDocument();
      expect(screen.getByText("PNG · 1.0 MB")).toBeInTheDocument();
      expect(screen.getByText("Product Walkthrough")).toBeInTheDocument();

      // Review / preview details are removed
      expect(screen.queryByText("Review Details")).not.toBeInTheDocument();
    });

    it("reveals inline Add Asset form when Add Asset button is clicked and cancels on discard", () => {
      render(<SolutionCreateFormViewWrapper initialStep={3} />);

      expect(
        screen.getByText(
          /No assets added yet. Click "\+ Add Asset" to attach supplementary media or documents./i,
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText(/asset #1/i)).not.toBeInTheDocument();

      const addBtn = screen.getByRole("button", { name: /add asset/i });
      fireEvent.click(addBtn);

      expect(screen.getByText("Asset #1")).toBeInTheDocument();
      expect(screen.getByLabelText(/asset name/i)).toBeInTheDocument();
      expect(screen.getByText(/choose a file/i)).toBeInTheDocument();
      // Ensure only the global footer cancel exists, not an inline form cancel
      const cancelButtons = screen.getAllByRole("button", {
        name: /^cancel$/i,
      });
      expect(cancelButtons).toHaveLength(1);
      expect(cancelButtons[0]).toHaveAttribute("href", "/dashboard");

      const closeBtn = screen.getByRole("button", { name: /close form/i });
      fireEvent.click(closeBtn);

      expect(screen.queryByText("Asset #1")).not.toBeInTheDocument();
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

    it("displays validation alert on Step 2 when repository_url, preview_url, or thumbnail_url are missing or invalid", () => {
      render(
        <SolutionCreateFormViewWrapper
          initialStep={2}
          customFormState={{
            errors: {
              repository_url: {
                type: "manual",
                message: "Repository URL is required",
              },
              preview_url: {
                type: "manual",
                message: "Live Preview URL is required",
              },
              thumbnail_url: {
                type: "manual",
                message: "Thumbnail URL is required",
              },
            },
          }}
        />,
      );

      expect(
        screen.getByText("Please resolve the following errors"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Repository URL is required"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Live Preview URL is required"),
      ).toBeInTheDocument();
      expect(screen.getByText("Thumbnail URL is required")).toBeInTheDocument();
    });

    it("does not submit the form before the last step", () => {
      const handleSubmit = vi.fn();

      const { container } = render(
        <SolutionCreateFormViewWrapper
          initialStep={1}
          customFormState={{
            handleSubmit,
          }}
        />,
      );

      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();

      // Attempt to submit on Step 1
      fireEvent.submit(form!);

      // Must NOT submit or create solution prematurely
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("does not submit the form when clicking Continue to advance from step 2 to step 3", async () => {
      const handleSubmit = vi.fn();

      render(
        <SolutionCreateFormViewWrapper
          initialStep={2}
          customFormState={{
            handleSubmit,
          }}
        />,
      );

      // Verify we are on Deployments & Links (Step 2)
      expect(screen.getByText("Deployments & Links")).toBeInTheDocument();

      // Click Continue
      const continueBtns = screen.getAllByRole("button", { name: /continue/i });
      fireEvent.click(continueBtns[0]);

      // Step should now be Assets & Media
      expect(await screen.findByText("Assets & Media")).toBeInTheDocument();

      // handleSubmit must NOT have been called
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });

  describe("extractErrorMessages & SolutionFormValidationAlert", () => {
    it("extracts and deduplicates error messages while ignoring internal metadata", () => {
      const mockErrors = {
        title: { message: "Title is required", type: "required" },
        tech_stack: {
          message: "Please select at least 1 technology",
          type: "too_small",
        },
        key_capabilities: [
          {
            name: { message: "Capability title is required" },
            description: { message: "Capability title is required" }, // duplicate message
          },
        ],
      };

      const extracted = extractErrorMessages(mockErrors);
      expect(extracted).toEqual([
        "Title is required",
        "Please select at least 1 technology",
        "Capability title is required",
      ]);
      expect(extractErrorMessages(null)).toEqual([]);
    });

    it("renders nothing when there are no errors for the current step", () => {
      const { container } = render(
        <SolutionFormValidationAlert currentStep={0} errors={{}} />,
      );
      expect(container.firstChild).toBeNull();
    });

    it("renders an alert with errors matching the active step", () => {
      render(
        <SolutionFormValidationAlert
          currentStep={0}
          errors={{
            title: { type: "required", message: "Title is missing" },
          }}
        />,
      );

      expect(
        screen.getByText("Please resolve the following errors"),
      ).toBeInTheDocument();
      expect(screen.getByText("Title is missing")).toBeInTheDocument();
    });
  });

  describe("SolutionFormFooter", () => {
    it("renders Previous (disabled on step 0), Cancel, and Continue on non-last steps", () => {
      const onPrev = vi.fn();
      const onNext = vi.fn();
      const onPublish = vi.fn();

      render(
        <MemoryRouter>
          <SolutionFormFooter
            currentStep={0}
            totalSteps={4}
            isPending={false}
            canPublish={false}
            onPrev={onPrev}
            onNext={onNext}
            onPublish={onPublish}
          />
        </MemoryRouter>,
      );

      const prevBtn = screen.getByRole("button", { name: /previous/i });
      expect(prevBtn).toBeDisabled();

      const cancelLink = screen.getByRole("button", { name: /cancel/i });
      expect(cancelLink).toHaveAttribute("href", "/dashboard");

      const continueBtn = screen.getByRole("button", { name: /continue/i });
      expect(continueBtn).not.toBeDisabled();
      fireEvent.click(continueBtn);
      expect(onNext).toHaveBeenCalledTimes(1);
    });

    it("renders Publish Solution button on last step", () => {
      const onPrev = vi.fn();
      const onNext = vi.fn();
      const onPublish = vi.fn();

      render(
        <MemoryRouter>
          <SolutionFormFooter
            currentStep={3}
            totalSteps={4}
            isPending={false}
            canPublish={true}
            onPrev={onPrev}
            onNext={onNext}
            onPublish={onPublish}
          />
        </MemoryRouter>,
      );

      expect(
        screen.queryByRole("button", { name: /continue/i }),
      ).not.toBeInTheDocument();

      const publishBtn = screen.getByRole("button", {
        name: /publish solution/i,
      });
      expect(publishBtn).not.toBeDisabled();
      fireEvent.click(publishBtn);
      expect(onPublish).toHaveBeenCalledTimes(1);
    });
  });
});
