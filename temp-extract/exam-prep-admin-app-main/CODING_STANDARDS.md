# Exam Prep Admin App - Coding Standards & Patterns

> **Last Updated:** 2025-11-20
> **Version:** 1.5.0
> **Purpose:** This document outlines all coding standards, patterns, and best practices followed in this codebase.

---

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Form Patterns](#form-patterns)
3. [API Layer Patterns](#api-layer-patterns)
4. [Cache Management & Delete Patterns](#cache-management--delete-patterns)
5. [State Management](#state-management)
6. [Component Patterns](#component-patterns)
7. [TypeScript Guidelines](#typescript-guidelines)
8. [Validation & Schemas](#validation--schemas)
9. [UI & Styling](#ui--styling)
10. [Error Handling](#error-handling)
11. [Event Handling](#event-handling)
12. [Naming Conventions](#naming-conventions)
13. [File Organization](#file-organization)
14. [Rich Content Patterns](#rich-content-patterns)
15. [Question Schema Patterns](#question-schema-patterns)
16. [File Upload Handling](#file-upload-handling) **← NEW!**

---

## Project Architecture

### Technology Stack

- **Framework:** Next.js 15+ (App Router)
- **React:** React 19+
- **TypeScript:** Strict mode enabled
- **State Management:** TanStack React Query v5
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios (custom wrapper)
- **URL State:** nuqs
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI (shadcn/ui pattern)
- **Icons:** Lucide React

### Folder Structure

```
app/
  (admin)/           # Route groups for admin pages
    [feature]/       # Feature pages
      page.tsx
      [id]/
        page.tsx

features/
  [feature]/
    api/             # API layer
      [resource]/
        get-[resource].ts
        get-[resource]s.ts
        create-[resource].ts
        update-[resource].ts
        delete-[resource].ts
    components/      # Feature components
      [feature]-table.tsx
      [feature]-detail.tsx
      add-[resource]-dialog.tsx
      edit-[resource]-dialog.tsx
      delete-confirmation-dialog.tsx
    lib/             # Feature utilities
      [feature]-url-state.ts
    columns.tsx      # Table column definitions

components/
  ui/              # Base UI components (shadcn)
  globals/         # Shared app components
  tables/          # Reusable table components
  cards/           # Reusable card components
  custom/          # Custom components

lib/
  api-client.ts    # Axios configuration
  react-query.ts   # React Query configuration
  url-state.ts     # nuqs parsers and utilities
  utils.ts         # General utilities
```

---

## Form Patterns

### ✅ STANDARD: React Hook Form + Zod + Field Components

**This is the required pattern for ALL forms in the application.**

### Form Setup

```typescript
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

// 1. Define Zod schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
});

type FormInput = z.infer<typeof formSchema>;

// 2. Initialize form with zodResolver
function MyForm() {
  const form = useForm<FormInput>({
    resolver: zodResolver(formSchema),
    mode: "onChange", // Validation mode: onChange, onBlur, onSubmit, onTouched, all
    defaultValues: {
      name: "",
      email: "",
      age: 18,
    },
  });

  const onSubmit = (data: FormInput) => {
    mutate({ data });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Fields here */}
      </form>
    </FormProvider>
  );
}
```

### ✅ ALWAYS Use Field + Controller Pattern

**DO:**
```typescript
<Controller
  name="fieldName"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Label</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

**DON'T:**
```typescript
// ❌ Don't use custom form components
<InputField placeholder="..." label="..." />

// ❌ Don't use register pattern
<input {...register("fieldName")} />

// ❌ Don't use manual state management
const [name, setName] = useState("");
<input value={name} onChange={(e) => setName(e.target.value)} />
```

### Field Type Examples

#### Input Field
```typescript
<Controller
  name="name"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

#### Textarea Field
```typescript
<Controller
  name="description"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Description</FieldLabel>
      <Textarea {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

#### Select Field
```typescript
<Controller
  name="category"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="category-select">Category</FieldLabel>
      <Select
        name={field.name}
        value={field.value}
        onValueChange={field.onChange}
      >
        <SelectTrigger id="category-select" aria-invalid={fieldState.invalid}>
          <SelectValue placeholder="Select category..." />
        </SelectTrigger>
        <SelectContent position="item-aligned">
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

#### Checkbox Field
```typescript
<Controller
  name="acceptTerms"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <div className="flex items-center gap-2">
        <Checkbox
          id={field.name}
          checked={field.value}
          onCheckedChange={field.onChange}
          aria-invalid={fieldState.invalid}
        />
        <FieldLabel htmlFor={field.name} className="cursor-pointer">
          I accept the terms and conditions
        </FieldLabel>
      </div>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

#### Radio Group Field
```typescript
<Controller
  name="gender"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel>Gender</FieldLabel>
      <RadioGroup
        value={field.value}
        onValueChange={field.onChange}
        aria-invalid={fieldState.invalid}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="male" id="male" />
          <Label htmlFor="male">Male</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="female" id="female" />
          <Label htmlFor="female">Female</Label>
        </div>
      </RadioGroup>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

#### Switch Field
```typescript
<Controller
  name="notifications"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={field.name}>Enable Notifications</FieldLabel>
        <Switch
          id={field.name}
          checked={field.value}
          onCheckedChange={field.onChange}
          aria-invalid={fieldState.invalid}
        />
      </div>
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

### useFormContext Pattern (Child Components)

When passing form state to child components, use `FormProvider` and `useFormContext`:

**Parent Component:**
```typescript
import { FormProvider, useForm } from "react-hook-form";

function ParentForm() {
  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ChildComponent />
        <AnotherChildComponent />
      </form>
    </FormProvider>
  );
}
```

**Child Component:**
```typescript
import { useFormContext, Controller } from "react-hook-form";

function ChildComponent() {
  const { control } = useFormContext<FormInput>();

  return (
    <Controller
      name="fieldName"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>Field Label</FieldLabel>
          <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
```

### useFieldArray Pattern (Dynamic Arrays)

For dynamic fields like options, steps, or sub-questions:

```typescript
import { useFieldArray, Controller } from "react-hook-form";

const schema = z.object({
  options: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1, "Label is required"),
      value: z.string().min(1, "Value is required"),
    })
  ).min(1, "At least one option is required"),
});

function DynamicForm() {
  const form = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      options: [{ id: "1", label: "", value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <Controller
            name={`options.${index}.label`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Label</FieldLabel>
                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name={`options.${index}.value`}
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Value</FieldLabel>
                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Button
            type="button"
            variant="ghost"
            onClick={() => remove(index)}
            disabled={fields.length === 1}
          >
            Remove
          </Button>
        </div>
      ))}

      <Button
        type="button"
        onClick={() => append({ id: crypto.randomUUID(), label: "", value: "" })}
      >
        Add Option
      </Button>
    </form>
  );
}
```

### Form Validation

#### Schema Definition
- **ALWAYS** use Zod schemas for validation
- Define schemas in `features/[feature]/schemas/` directory or near the component if feature-specific
- Use `z.infer<typeof schema>` for type inference
- Use discriminated unions for complex conditional validation

```typescript
// features/questions/schemas/question-validation.ts
import { z } from "zod";

export const baseQuestionSchema = z.object({
  questionType: z.string().min(1, "Question type is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"], {
    errorMap: () => ({ message: "Difficulty must be EASY, MEDIUM, or HARD" }),
  }),
  marks: z.string().min(1, "Marks is required"),
});

export const singleChoiceDataSchema = z.object({
  correctAnswer: z.string().min(1, "Please select the correct answer"),
});

// Discriminated union for different question types
export const questionEditorSchema = z.discriminatedUnion("questionType", [
  z.object({
    ...baseQuestionSchema.shape,
    questionType: z.literal("SINGLE_CHOICE"),
    singleChoiceData: singleChoiceDataSchema,
  }),
  // ... other question types
]);

export type QuestionEditorFormData = z.infer<typeof questionEditorSchema>;
```

#### Cross-Field Validation
```typescript
const schema = z
  .object({
    minWords: z.number().min(0, "Min words must be positive"),
    maxWords: z.number().min(0, "Max words must be positive"),
  })
  .refine((data) => data.maxWords >= data.minWords, {
    message: "Max words must be greater than or equal to min words",
    path: ["maxWords"],
  });
```

#### Validation Modes
```typescript
const form = useForm({
  resolver: zodResolver(schema),
  mode: "onChange",    // Validate on every change
  // mode: "onBlur",   // Validate on blur
  // mode: "onSubmit", // Validate only on submit (default)
  // mode: "onTouched", // Validate on touched and change
  // mode: "all",      // Validate on blur and change
});
```

### Form Submit Handlers

```typescript
const onSubmit = (data: FormInput) => {
  mutate({ data });
};

const onError = (errors: FieldErrors<FormInput>) => {
  console.error("Form validation errors:", errors);
  toast.error("Please fix the errors before submitting");
};

<form onSubmit={form.handleSubmit(onSubmit, onError)}>
  {/* Fields */}
  <Button type="submit" disabled={form.formState.isSubmitting}>
    {form.formState.isSubmitting ? "Submitting..." : "Submit"}
  </Button>
</form>
```

### Form State

Access form state for UI feedback:

```typescript
const {
  formState: {
    errors,        // All field errors
    isDirty,       // Form has been modified
    isValid,       // Form is valid
    isSubmitting,  // Form is being submitted
    isSubmitted,   // Form has been submitted
    touchedFields, // Fields that have been touched
    dirtyFields,   // Fields that have been modified
  },
} = form;

// Disable submit button
<Button type="submit" disabled={!isDirty || !isValid || isSubmitting}>
  Submit
</Button>

// Show loading state
{isSubmitting && <Spinner />}

// Show error summary
{Object.keys(errors).length > 0 && (
  <Alert variant="destructive">
    Please fix {Object.keys(errors).length} error(s) before submitting
  </Alert>
)}
```

### Reset Form

```typescript
// Reset to default values
form.reset();

// Reset with new values
form.reset({
  name: "New Name",
  email: "new@email.com",
});

// Reset specific fields
form.resetField("name");
```

### Manual Field Updates

```typescript
// Set a single field value
form.setValue("name", "John Doe", {
  shouldValidate: true,  // Trigger validation
  shouldDirty: true,     // Mark field as dirty
  shouldTouch: true,     // Mark field as touched
});

// Get field value
const nameValue = form.getValues("name");

// Get all values
const allValues = form.getValues();

// Watch field changes
const watchedName = form.watch("name");

// Watch multiple fields
const [name, email] = form.watch(["name", "email"]);

// Watch all fields
const allFields = form.watch();
```

---

## API Layer Patterns

### File Structure (REQUIRED)

Every API file MUST follow this exact structure:

```typescript
// ========== TYPES ==========
export interface ResourceType {
  id: string;
  name: string;
  // ... other fields
}

// ========== SCHEMA ========== (for mutations only)
export const createResourceInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // ... other fields
});

export type CreateResourceInput = z.infer<typeof createResourceInputSchema>;

// ========== API CALL ==========
export const createResource = ({
  data,
}: {
  data: CreateResourceInput;
}): Promise<ResourceType> => {
  return api.post(`/admin/content/resources`, data);
};

// ========== API CALL (with pagination) ==========
export const getResources = (
  {
    page = 1,
    limit = 10,
    sortBy = "name",
    sortOrder = "ASC",
  }: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  } = { page: 1, limit: 10, sortBy: "name", sortOrder: "ASC" }
): Promise<ResourcesResponse> => {
  return api.get(`/admin/content/resources`, {
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
    },
  });
};

// ========== QUERY OPTIONS ========== (for queries only)
export const getResourcesQueryOptions = ({
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "ASC",
}: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
} = {}) => {
  return queryOptions({
    queryKey: ["resources", { page, limit, sortBy, sortOrder }],
    queryFn: () => getResources({ page, limit, sortBy, sortOrder }),
  });
};

// ========== HOOK (for queries with pagination) ==========
type UseResourcesOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  queryConfig?: QueryConfig<typeof getResourcesQueryOptions>;
};

export const useResources = ({
  page,
  limit,
  sortBy,
  sortOrder,
  queryConfig,
}: UseResourcesOptions = {}) => {
  return useQuery<ResourcesResponse>({
    ...getResourcesQueryOptions({ page, limit, sortBy, sortOrder }),
    ...(queryConfig as any),
  });
};

// ========== HOOK (for mutations) ==========
export const useCreateResource = ({
  mutationConfig,
}: UseCreateResourceOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: (...args) => {
      queryClient.invalidateQueries({
        queryKey: ["resources"], // Simple key!
      });
      onSuccess?.(...args);
    },
    ...restConfig,
    mutationFn: createResource,
  });
};
```

### Cache Invalidation Rules

**✅ DO:**
```typescript
// Use simple query keys
queryClient.invalidateQueries({
  queryKey: ["resources"],
});

// For hierarchical data, invalidate both levels
queryClient.invalidateQueries({ queryKey: ["departments"] });
queryClient.invalidateQueries({ queryKey: ["faculties"] });
queryClient.invalidateQueries({ queryKey: ["universities"] });
```

**❌ DON'T:**
```typescript
// Don't use query options that might have different parameters
queryClient.invalidateQueries({
  queryKey: getResourcesQueryOptions().queryKey, // Parameters might not match!
});
```

### Enhanced Cache Invalidation (For Immediate Refresh)

When you need the table to refresh immediately after CRUD operations, use BOTH `invalidateQueries` AND `refetchQueries`:

```typescript
// ========== HOOK (for mutations with immediate refresh) ==========
export const useCreateResource = ({
  mutationConfig,
}: UseCreateResourceOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate marks queries as stale
      await queryClient.invalidateQueries({
        queryKey: ["resources"],
        refetchType: "active",
      });
      // Refetch forces immediate data fetch
      await queryClient.refetchQueries({
        queryKey: ["resources"],
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createResource,
  });
};
```

**When to use `removeQueries` vs `invalidateQueries`:**

```typescript
// Use removeQueries when navigating away (e.g., after delete with redirect)
queryClient.removeQueries({ queryKey: ["resource", resourceId] });

// Use invalidateQueries + refetchQueries for immediate UI updates
await queryClient.invalidateQueries({ queryKey: ["resources"] });
await queryClient.refetchQueries({ queryKey: ["resources"] });
```

### Optional Filter Parameters

When API endpoints have optional filter parameters (like examType), handle them conditionally:

```typescript
export const getResources = ({
  filterParam, // Optional filter
  page = 1,
  limit = 10,
  sortBy = "name",
  sortOrder = "ASC",
}: {
  filterParam?: string; // Mark as optional
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<ResourcesResponse> => {
  const params: Record<string, any> = {
    page,
    limit,
    sortBy,
    sortOrder,
  };

  // Only add filter if provided
  if (filterParam) params.filterParam = filterParam;

  return api.get(`/admin/resources`, { params });
};
```

### API Response Types

Always handle paginated responses correctly:

```typescript
export interface ResourcesResponse {
  data: Resource[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**CRITICAL: Match Promise return types to actual API responses:**

```typescript
// ✅ CORRECT - Single resource (API returns object directly)
export const getResource = ({
  resourceId,
}: {
  resourceId: string;
}): Promise<Resource> => {  // NOT Promise<{ data: Resource }>
  return api.get(`/admin/resources/${resourceId}`);
};

// Usage in component:
const { data: resource } = useResource({ resourceId });
// resource is Resource directly, NOT resource.data

// ✅ CORRECT - Single resource with wrapper (if API returns { data: Resource })
export const getResource = ({
  resourceId,
}: {
  resourceId: string;
}): Promise<{ data: Resource }> => {
  return api.get(`/admin/resources/${resourceId}`);
};

// Usage in component:
const { data: resourceData } = useResource({ resourceId });
const resource = resourceData?.data;

// ✅ CORRECT - Paginated response
export const getResources = (): Promise<ResourcesResponse> => {
  return api.get(`/admin/resources`);
};

// Usage in component:
const { data: resourcesData } = useResources();
const resources = resourcesData?.data || [];
const total = resourcesData?.total || 0;
```

### Type Casting Pattern

```typescript
const { data, isLoading, refetch } = useResources({ queryConfig: {} }) as {
  data: ResourcesResponse | undefined;
  isLoading: boolean;
  refetch: () => void;
};
```

---

## Cache Management & Delete Patterns

### React Query Cache Invalidation Strategy

**CRITICAL:** When data is nested (e.g., exam-types → subjects → topics → subtopics), ALL parent caches must be invalidated when child data changes.

#### Hierarchy Example
```
exam-types (contains subjects)
  └─ subjects (contains topics)
      └─ topics (contains subtopics)
          └─ subtopics
```

### Cache Invalidation for CRUD Operations

#### CREATE / UPDATE Operations
Use `invalidateQueries` + `refetchQueries` to update the UI immediately:

```typescript
export const useCreateSubTopic = ({ mutationConfig }: UseCreateSubTopicOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate all levels of the hierarchy
      await queryClient.invalidateQueries({
        queryKey: ["subtopics"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["subtopics"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["topics"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["topics"],
      });

      await queryClient.invalidateQueries({
        queryKey: ["subjects"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["subjects"],
      });

      // Invalidate parent cache (exam-types contains subjects)
      await queryClient.invalidateQueries({
        queryKey: ["exam-types"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["exam-types"],
      });

      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: createSubTopic,
  });
};
```

#### DELETE Operations with Navigation

**CRITICAL:** When deleting a resource and navigating away from its detail page:
1. **Cancel** in-flight queries FIRST (prevents 404s)
2. **Remove** queries from cache (don't invalidate/refetch)
3. Navigate using `router.replace()` (cleaner history)

```typescript
export const useDeleteSubject = ({ mutationConfig }: UseDeleteSubjectOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, variables, ...args) => {
      // 1. CANCEL any in-flight queries to prevent 404s
      await queryClient.cancelQueries({ queryKey: ["subjects", variables.subjectId] });
      await queryClient.cancelQueries({ queryKey: ["subjects"] });

      // 2. REMOVE queries from cache (don't refetch deleted resource!)
      queryClient.removeQueries({ queryKey: ["subjects", variables.subjectId] });
      queryClient.removeQueries({ queryKey: ["subjects"] });
      queryClient.removeQueries({ queryKey: ["topics"] });
      queryClient.removeQueries({ queryKey: ["subtopics"] });

      // Remove parent cache
      queryClient.removeQueries({ queryKey: ["exam-types"] });

      onSuccess?.(data, variables, ...args);
    },
    ...restConfig,
    mutationFn: deleteSubject,
  });
};
```

#### Detail Component Delete Pattern

When implementing delete functionality on detail pages, **disable the query** during deletion to prevent refetch:

```typescript
const [isDeletingState, setIsDeletingState] = useState(false);

const { data: subject } = useSubject({
  subjectId,
  queryConfig: {
    enabled: !isDeletingState, // Prevents refetch when deleting
  },
});

const { mutate: deleteSubject, isPending: isDeleting } = useDeleteSubject({
  mutationConfig: {
    onSuccess: () => {
      toast.success("Subject deleted successfully");
      setIsDeletingState(true); // Disable query immediately

      // Remove queries (handled by mutation, but can also do here)
      queryClient.removeQueries({ queryKey: ["subjects", subjectId] });

      // Use replace instead of push (cleaner browser history)
      router.replace(paths.app.subjects.getHref());
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete");
      setIsDeletingState(false); // Re-enable query on error
    },
  },
});
```

### ❌ Common Mistakes to Avoid

**DON'T** use `invalidateQueries` + `refetchQueries` on delete when navigating away:
```typescript
// ❌ BAD - Will try to refetch the deleted resource (404!)
onSuccess: async (data, variables) => {
  await queryClient.invalidateQueries({ queryKey: ["subjects"] });
  await queryClient.refetchQueries({ queryKey: ["subjects"] }); // Tries to refetch deleted item!
  router.push("/subjects");
};
```

**DO** use `cancelQueries` + `removeQueries`:
```typescript
// ✅ GOOD - Cancels pending requests and removes from cache
onSuccess: async (data, variables) => {
  await queryClient.cancelQueries({ queryKey: ["subjects"] });
  queryClient.removeQueries({ queryKey: ["subjects"] });
  router.replace("/subjects");
};
```

### Data Fetching Optimization

**Use parent API when data is nested:**

```typescript
// ❌ BAD - Two separate API calls
const { data: subjects } = useSubjects();
const { data: topics } = useTopics();
const { data: subtopics } = useSubtopics();

// ✅ GOOD - One API call, nested data
const { data: examTypes } = useAllExamTypes(); // Includes subjects → topics → subtopics
```

Example: The subjects table uses `useAllExamTypes()` because exam-types already includes nested subjects with their topics and subtopics. This eliminates unnecessary API calls.

---

## State Management

### React Query Configuration

- **Location:** `lib/react-query.ts`
- **Default stale time:** Configure based on data freshness needs
- **Retry logic:** Configure based on API reliability

### Pagination with URL State

**✅ ALWAYS use the `usePagination` hook from `lib/url-state.ts`:**

```typescript
import { usePagination } from "@/lib/url-state";

const MyTable = () => {
  const ENTRIES_PER_PAGE = 10;

  // Use pagination hook
  const {
    page,
    limit,
    setPage,
    setLimit,
    goToNextPage,
    goToPreviousPage,
  } = usePagination(ENTRIES_PER_PAGE);

  // Pass to API
  const { data } = useResources({
    page,
    limit,
    sortBy: "name",
    sortOrder: "ASC",
  });

  return (
    <TablePagination
      totalEntries={data?.total || 0}
      entriesPerPage={limit}
      currentPage={page}
      onPageChange={setPage}
      onLimitChange={setLimit}
      onNextPage={goToNextPage}
      onPreviousPage={goToPreviousPage}
    />
  );
};
```

**DON'T:**
```typescript
// ❌ Don't manually read from searchParams
const page = parseInt(searchParams.get("page") || "1", 10);

// ❌ Don't manually manipulate URLs
const handlePageChange = (page) => {
  router.push(`?page=${page}`);
};
```

### URL State with nuqs

**✅ Separate Tab Filters from Dialog Filters:**

```typescript
// Tab filtering uses ?filter= parameter (handled by TableTabs component)
const currentFilter = searchParams.get("filter") || "all";

// Advanced filters use nuqs for state management
export const resourceFiltersParser = {
  subjects: parseAsOptionalNumber,
  dateFrom: parseAsOptionalDate,
  // ... other filters (NOT including category/filter)
};
```

**Pattern for URL State Hooks:**

```typescript
export function useResourceFilters() {
  const [filters, setFilters] = useQueryStates(resourceFiltersParser, {
    history: "push",
    shallow: false,
  });

  const clearFilters = () => {
    setFilters({
      subjects: null,
      dateFrom: null,
      // ... reset all
    });
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== null
  ).length;

  return {
    filters,
    setFilters,
    clearFilters,
    activeFilterCount,
  };
}
```

**Feature-Specific URL State Management:**

Create a dedicated URL state file for each feature with complex filters:

```typescript
// features/users/lib/users-url-state.ts
import { parseAsOptionalDate, parseAsOptionalString } from "@/lib/url-state";
import { useQueryStates, parseAsInteger, parseAsStringLiteral } from "nuqs";

export const userFiltersParser = {
  filter: parseAsStringLiteral(["all", "subscribed", "banned", "inactive"] as const).withDefault("all"),
  examType: parseAsOptionalString,
  dateFrom: parseAsOptionalDate,
  dateTo: parseAsOptionalDate,
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  search: parseAsOptionalString,
} as const;

export function useUserFilters() {
  const [filters, setFilters] = useQueryStates(userFiltersParser, {
    history: "push",
    shallow: false,
  });

  const clearFilters = () => {
    setFilters({
      filter: "all",
      examType: null,
      dateFrom: null,
      dateTo: null,
      page: 1,
      limit: 10,
      search: null,
    });
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);
  };

  const activeFilterCount = [
    filters.examType,
    filters.dateFrom,
    filters.dateTo,
    filters.search,
  ].filter((value) => value !== null && value !== undefined).length;

  return {
    filters,
    setFilters,
    updateFilters,
    clearFilters,
    activeFilterCount,
  };
}
```

**Usage in Table Component:**

```typescript
const ResourceTable = () => {
  const { filters, updateFilters, activeFilterCount } = useResourceFilters();

  const { data, isLoading, refetch } = useResources({
    examType: filters.examType || undefined,
    page: filters.page,
    limit: filters.limit,
  });

  return (
    <Card>
      <CardHeader>
        <SearchInput
          placeholder="Search..."
          value={filters.search || ""}
          onChange={(value) => updateFilters({ search: value || null })}
        />
        <FilterDialog>
          <Button>
            Filter
            {activeFilterCount > 0 && (
              <Badge>{activeFilterCount}</Badge>
            )}
          </Button>
        </FilterDialog>
      </CardHeader>
      <CardFooter>
        <TablePagination
          currentPage={filters.page}
          entriesPerPage={filters.limit}
          onPageChange={(page) => updateFilters({ page })}
        />
      </CardFooter>
    </Card>
  );
};
```

---

## Component Patterns

### One Component Per File Rule

**CRITICAL: Each component MUST be in its own file.**

```
// ✅ CORRECT
features/subjects/components/
  add-subject-dialog.tsx      // AddSubjectDialog
  edit-subject-dialog.tsx     // EditSubjectDialog
  subject-stats-card.tsx      // SubjectStatsCard
  subject-table.tsx           // SubjectTable

// ❌ WRONG - Multiple components in one file
features/subjects/components/subject-dialogs.tsx
  // Contains AddSubjectDialog AND EditSubjectDialog
```

**Benefits:**
- Easier to locate components
- Better code splitting
- Clearer imports
- Simpler refactoring

### Frontend Search Filtering

When API doesn't support server-side search, implement filtering on the frontend:

```typescript
const { data, isLoading } = useResources({
  page: filters.page,
  limit: filters.limit,
});

const resources = data?.data || [];

// Filter resources by search term on the frontend
const filteredResources = useMemo(() => {
  let filtered = resources;

  // Search filter
  if (filters.search) {
    filtered = filtered.filter(
      (resource) =>
        resource.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        resource.description?.toLowerCase().includes(filters.search!.toLowerCase())
    );
  }

  return filtered;
}, [resources, filters.search]);

return (
  <DataTable columns={columns} data={filteredResources} />
);
```

### Dialog Pattern

```typescript
interface DialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export function ResourceDialog({ children, onSuccess }: DialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: { ... },
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({ ... });
    }
  }, [open, form]);

  const { mutate, isPending } = useMutation({
    mutationConfig: {
      onSuccess: () => {
        toast.success("Success message");
        setOpen(false);
        form.reset();
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(error?.message || "Error message");
      },
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Form fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Table Column Pattern with Actions

```typescript
interface ActionsCellProps {
  row: any;
  onRefresh?: () => void;
}

function ActionsCell({ row, onRefresh }: ActionsCellProps) {
  const resource = row.original;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { mutate: deleteResource, isPending } = useDeleteResource({
    mutationConfig: {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onRefresh?.();
      },
    },
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <EditDialog resource={resource} onSuccess={onRefresh}>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit
            </DropdownMenuItem>
          </EditDialog>
          <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        {/* Delete confirmation */}
      </AlertDialog>
    </>
  );
}

export const createColumns = (onRefresh?: () => void): ColumnDef<Resource>[] => [
  // ... column definitions
  {
    id: "actions",
    cell: ({ row }) => <ActionsCell row={row} onRefresh={onRefresh} />,
  },
];
```

### Table Component Pattern

```typescript
const ResourceTable = () => {
  const { data, isLoading, refetch } = useResources({ queryConfig: {} }) as {
    data: ResourcesResponse | undefined;
    isLoading: boolean;
    refetch: () => void;
  };

  const columns = useMemo(() => createColumns(() => refetch()), [refetch]);

  const transformedData = useMemo(() => {
    if (!data?.data) return [];
    return data.data.map((item) => ({
      // Transform to table format
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        {/* Search and filters */}
      </CardHeader>
      <CardContent>
        <TableTabs tabs={tabs} baseUrl="/resources" />
        <div className="pt-10">
          {isLoading ? (
            <LoadingState />
          ) : (
            <DataTable
              columns={columns}
              data={transformedData}
              onRowClick={(row) => router.push(`/resources/${row.original.id}`)}
            />
          )}
        </div>
      </CardContent>
      <CardFooter>
        <TablePagination
          totalEntries={data?.total || transformedData.length}
          entriesPerPage={ENTRIES_PER_PAGE}
        />
      </CardFooter>
    </Card>
  );
};
```

### Hierarchical Table Pattern (TanStack Table)

```typescript
const table = useReactTable({
  data: transformedData,
  columns,
  state: { expanded },
  onExpandedChange: setExpanded,
  getSubRows: (row) => {
    if (row.type === "parent") return row.children as any;
    if (row.type === "child") return row.subChildren as any;
    return undefined;
  },
  getCoreRowModel: getCoreRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
});
```

### Detail Page Pattern

```typescript
// page.tsx
interface PageProps {
  params: Promise<{ id: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params; // Next.js 15 - params is a Promise!

  return (
    <AppSidebarContent>
      <Link href="/back">Back</Link>
      <ResourceDetail resourceId={id} />
    </AppSidebarContent>
  );
};
```

**Detail Component with Loading and Empty States:**

```typescript
"use client";

interface ResourceDetailProps {
  resourceId: string;
}

const ResourceDetail = ({ resourceId }: ResourceDetailProps) => {
  const { data: resource, isLoading } = useResource({ resourceId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No resource data available
      </div>
    );
  }

  return (
    <div className="space-y-5 py-5">
      <h6 className="font-semibold text-xl">{resource.name}</h6>
      {/* Rest of the detail view */}
    </div>
  );
};
```

### Optional Props in Dialogs

When a dialog can be used in different contexts (with or without a parent ID):

```typescript
interface AddResourceDialogProps {
  parentId?: string; // Optional - show parent selector if not provided
  onSuccess?: () => void;
}

export function AddResourceDialog({ parentId, onSuccess }: AddResourceDialogProps) {
  const { data: parentsData, isLoading: isLoadingParents } = useParents({
    queryConfig: {
      enabled: !parentId, // Only fetch if parentId not provided
    },
  });

  const form = useForm<Input>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      parentId: parentId || "", // Use provided or empty
    },
  });

  return (
    <Dialog>
      <DialogContent>
        <form>
          {/* Only show parent selector if parentId not provided */}
          {!parentId && (
            <Controller
              name="parentId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Parent</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent..." />
                    </SelectTrigger>
                    <SelectContent>
                      {parentsData?.data.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          )}
          {/* Other fields */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## TypeScript Guidelines

### Strict Mode Rules

- **ALWAYS** enable strict mode in `tsconfig.json`
- **NEVER** use `any` without explicit casting
- **ALWAYS** provide explicit types for function parameters
- **ALWAYS** type component props with interfaces

### Type Inference from Zod

```typescript
export const schema = z.object({
  name: z.string().min(1),
});

export type SchemaInput = z.infer<typeof schema>;
```

### Generic Types for Hooks

```typescript
type UseResourceOptions = {
  queryConfig?: QueryConfig<typeof getResourcesQueryOptions>;
};
```

### Explicit Type Annotations for Maps

```typescript
// ✅ DO
universities.map((university: University) => ({
  // ...
}))

// ❌ DON'T
universities.map((university) => ({ // Implicit any
  // ...
}))
```

---

## Validation & Schemas

### Zod Schema Patterns

**Create Schema:**
```typescript
export const createResourceInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional().refine(
    (val) => !val || val === "" || /^https?:\/\/.+/.test(val),
    "Must be a valid URL"
  ),
});
```

**Update Schema:**
```typescript
export const updateResourceInputSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  category: z.string().min(1, "Category is required").optional(),
});
```

**Filter Schema with Date Validation:**
```typescript
export const filterSchema = z.object({
  dateFrom: z.date().nullable().optional(),
  dateTo: z.date().nullable().optional(),
}).refine(
  (data) => {
    if (data.dateFrom && data.dateTo) {
      return data.dateFrom <= data.dateTo;
    }
    return true;
  },
  {
    message: "Start date must be before end date",
    path: ["dateTo"],
  }
);
```

---

## UI & Styling

### Component Library

- **ALWAYS** use shadcn/ui components
- **NEVER** use browser `alert()`, `confirm()` - use AlertDialog instead
- **ALWAYS** use Radix UI primitives for complex interactions

### Tailwind CSS Guidelines

- Use utility classes instead of custom CSS
- Follow consistent spacing scale
- Use semantic color names from theme

### Primary Color

```typescript
// Primary green color
className="bg-[#BEE74C] hover:bg-[#B0D945] text-black"
```

### Loading States

```typescript
{isLoading ? (
  <div className="flex items-center justify-center h-64">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
) : (
  <Content />
)}
```

### Empty States

```typescript
{!items.length ? (
  <p className="text-muted-foreground">No items found</p>
) : (
  <ItemsList />
)}
```

---

## Error Handling

### Toast Notifications

```typescript
import { toast } from "sonner";

// Success
toast.success("Operation completed successfully");

// Error
toast.error(error?.message || "Operation failed");
```

### Mutation Error Handling

```typescript
const { mutate, isPending } = useMutation({
  mutationConfig: {
    onSuccess: () => {
      toast.success("Success!");
      // ... cleanup
    },
    onError: (error: any) => {
      toast.error(error?.message || "Something went wrong");
    },
  },
});
```

### Component Error States

```typescript
if (error) {
  return (
    <Card className="p-6">
      <p className="text-destructive">Failed to load data</p>
    </Card>
  );
}
```

---

## Event Handling

### Stop Propagation for Nested Interactive Elements

**CRITICAL for table rows with clickable actions:**

```typescript
// Dropdown trigger
<Button onClick={(e) => e.stopPropagation()}>
  <MoreHorizontal />
</Button>

// Dropdown content
<DropdownMenuContent onClick={(e) => e.stopPropagation()}>
  {/* menu items */}
</DropdownMenuContent>

// Individual actions (if content doesn't have stopPropagation)
<DropdownMenuItem onClick={(e) => {
  e.stopPropagation();
  handleAction();
}}>
```

### Form Submit

```typescript
<form onSubmit={form.handleSubmit(onSubmit)}>
```

### Prevent Dialog Close on Menu Item Click

```typescript
<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
  Action
</DropdownMenuItem>
```

---

## Naming Conventions

### Files

- **Components:** `kebab-case.tsx` (e.g., `exam-table.tsx`)
- **API files:** `get-resources.ts`, `create-resource.ts`
- **Types:** `PascalCase` interfaces/types
- **Hooks:** `use-resource-name.ts`

### Variables & Functions

```typescript
// React components
export function ResourceTable() { }

// Hooks
export const useResources = () => { }

// API functions
export const getResources = () => { }
export const createResource = () => { }

// Event handlers
const handleSubmit = () => { }
const handleDelete = () => { }

// Boolean variables
const isLoading = false;
const hasData = true;
const canEdit = false;
```

### Types & Interfaces

```typescript
// Component props
interface ResourceTableProps { }

// API types
export interface Resource { }
export interface ResourcesResponse { }

// Input types from Zod
export type CreateResourceInput = z.infer<typeof createResourceInputSchema>;
```

### Constants

```typescript
const ENTRIES_PER_PAGE = 10;
const MAX_FILE_SIZE = 1024 * 1024;

const examCategories = [
  { value: "SECONDARY_SCHOOL", label: "Secondary School" },
  // ...
];
```

---

## File Organization

### Feature Structure

```
features/
  [feature]/
    api/
      [resource]/
        get-[resource]s.ts      # List endpoint
        get-[resource].ts       # Single endpoint
        create-[resource].ts    # Create mutation
        update-[resource].ts    # Update mutation
        delete-[resource].ts    # Delete mutation
    components/
      [feature]-table.tsx       # Main table
      [feature]-detail.tsx      # Detail view
      [feature]-stats-card.tsx  # Stats cards
      add-[resource]-dialog.tsx # Create dialog
      edit-[resource]-dialog.tsx # Edit dialog
      filter-[feature]-dialog.tsx # Filter dialog
      tab-[feature]-[tab].tsx   # Tab content components
    lib/
      [feature]-url-state.ts    # URL state management
    columns.tsx                 # Table columns
```

### Import Order

```typescript
// 1. React & Next.js
import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// 2. External libraries
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

// 3. UI components (grouped)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

// 4. Internal components
import { TableTabs } from "@/components/tables/table-tabs";

// 5. Feature-specific imports
import { useResources } from "../api/resource/get-resources";
import { createColumns } from "../columns";

// 6. Types
import type { Resource } from "../api/resource/get-resources";
```

---

## Rich Content Patterns

### Content Type System

The app uses a normalized content block system for rich text, media, and interactive elements:

```typescript
import { RichContentType, type RichContentBlock } from "@/lib/rich-content";

// Available content types
enum RichContentType {
  TEXT = "text",           // Plain text without formatting
  MARKDOWN = "markdown",   // Text with formatting (bold, italic, headings, links)
  LATEX = "latex",         // Math equations
  IMAGE = "image",         // Images with alt text
  TABLE = "table",         // Data tables
  CODE = "code",           // Code blocks with syntax highlighting
  AUDIO = "audio",         // Audio files
  VIDEO = "video",         // Video embeds (YouTube, Vimeo, direct)
  LIST = "list",           // Bullet/numbered lists
  QUOTE = "quote",         // Block quotes
  TASK_LIST = "task_list", // To-do lists with checkboxes
  DIAGRAM = "diagram",     // Reserved for future use
}
```

### Rich Content Block Structure

**✅ DO: Use typed content blocks**

```typescript
// Plain text
const textBlock: RichContentBlock = {
  type: RichContentType.TEXT,
  value: "What is the capital of France?"
};

// Formatted text (markdown)
const markdownBlock: RichContentBlock = {
  type: RichContentType.MARKDOWN,
  value: {
    content: "Important note",
    formatting: {
      bold: true,
      italic: false,
      heading: 2, // H2
      link: "https://example.com"
    }
  }
};

// Image
const imageBlock: RichContentBlock = {
  type: RichContentType.IMAGE,
  value: {
    src: "https://example.com/diagram.png",
    alt: "Diagram showing...",
    title: "Optional tooltip"
  }
};

// LaTeX equation
const latexBlock: RichContentBlock = {
  type: RichContentType.LATEX,
  value: {
    equation: "E = mc^2",
    displayMode: false // true for centered display
  }
};

// Code block
const codeBlock: RichContentBlock = {
  type: RichContentType.CODE,
  value: {
    language: "python",
    content: "def hello():\n    print('Hello')"
  }
};
```

### Editor Integration

**Location:** `components/kibo-ui/editor/`

The kibo-ui editor is a Tiptap-based rich text editor that outputs JSONContent. Use transformers to convert:

```typescript
import { tiptapToRichContent, richContentToTiptap } from "@/lib/rich-content";
import type { JSONContent } from "@tiptap/react";

// When saving content from editor
const handleSave = (editorJSON: JSONContent) => {
  const richContent = tiptapToRichContent(editorJSON);

  // Save to database
  await createQuestion({
    questionText: richContent,
    // ... other fields
  });
};

// When loading content for editing
const handleEdit = (savedContent: RichContentBlock[]) => {
  const tiptapJSON = richContentToTiptap(savedContent);

  // Load into editor
  editor.commands.setContent(tiptapJSON);
};
```

### Editor Provider Pattern

```typescript
import {
  EditorProvider,
  EditorBubbleMenu,
  EditorFormatBold,
  EditorFormatItalic,
  useCurrentEditor,
  type JSONContent,
} from "@/components/kibo-ui/editor";

function MyEditor() {
  const [content, setContent] = useState<JSONContent | null>(null);

  return (
    <EditorProvider
      placeholder="Start typing..."
      onUpdate={({ editor }) => {
        setContent(editor.getJSON());
      }}
    >
      <EditorBubbleMenu>
        <EditorFormatBold hideName />
        <EditorFormatItalic hideName />
        {/* More formatting options */}
      </EditorBubbleMenu>
    </EditorProvider>
  );
}
```

### API Format Conversion Pattern

**CRITICAL:** The backend API uses a different format than RichContentBlock. Use converters to transform data:

```typescript
import {
  tiptapToRichContent,
  richContentToAPIFormat,
  apiFormatToRichContent,
  apiFormatToTiptap,
  type APIRichContentBlock,
} from "@/lib/rich-content";

// ========== SAVING TO API ==========
// Flow: EditorProvider → JSONContent → RichContentBlock[] → APIRichContentBlock[]

const handleSave = () => {
  // 1. Get content from editor (JSONContent)
  const editorJSON = questionTextContent; // From EditorProvider onUpdate

  // 2. Convert to RichContentBlock[]
  const richContent = tiptapToRichContent(editorJSON);

  // 3. Convert to API format
  const apiFormat = richContentToAPIFormat(richContent);

  // 4. Send to API
  createQuestion({
    questionText: apiFormat, // APIRichContentBlock[]
  });
};

// ========== LOADING FROM API ==========
// Flow: APIRichContentBlock[] → RichContentBlock[] → JSONContent → EditorProvider

const handleQuestionClick = (questionNumber: number) => {
  const existingQuestion = getExistingQuestion(questionNumber);

  if (existingQuestion) {
    // 1. Get from API (APIRichContentBlock[])
    const apiContent = existingQuestion.questionText;

    // 2. Convert directly to Tiptap JSONContent (convenience function)
    const tiptapJSON = apiFormatToTiptap(apiContent);

    // 3. Set in state (EditorProvider will load via content prop)
    setQuestionTextContent(tiptapJSON);
  }
};

// Alternative: Two-step conversion if you need RichContentBlock[] for other purposes
const apiContent = existingQuestion.questionText;
const richContent = apiFormatToRichContent(apiContent);
const tiptapJSON = richContentToTiptap(richContent);
```

**API Format Structure:**
```typescript
interface APIRichContentBlock {
  type: "text" | "markdown" | "latex" | "image" | "video" | "audio" | "code";
  value: string; // Always a string (JSON stringified for complex types)
  metadata?: Record<string, any>;
}

// Example API format
const apiBlocks: APIRichContentBlock[] = [
  {
    type: "text",
    value: "What is the capital of France?"
  },
  {
    type: "latex",
    value: '{"equation":"E=mc^2","displayMode":true}' // JSON stringified
  },
  {
    type: "image",
    value: '{"src":"https://example.com/img.png","alt":"Diagram"}' // JSON stringified
  }
];
```

### Editor Content Loading Pattern

**CRITICAL:** Use `key` and `content` props to properly load content into editors:

```typescript
function QuestionEditor() {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [questionTextContent, setQuestionTextContent] = useState<JSONContent | null>(null);

  // When loading existing question
  const handleQuestionClick = (num: number) => {
    setSelectedQuestion(num);
    const existingQuestion = getExistingQuestion(num);

    if (existingQuestion) {
      // Convert API format to Tiptap format
      const tiptapContent = apiFormatToTiptap(existingQuestion.questionText);
      setQuestionTextContent(tiptapContent);
    }
  };

  return (
    <EditorProvider
      // ✅ CRITICAL: key prop forces re-mount when switching questions
      key={`question-${selectedQuestion}`}

      // ✅ CRITICAL: content prop initializes editor with loaded content
      content={questionTextContent || undefined}

      placeholder="Type your question..."
      onUpdate={({ editor }) => {
        setQuestionTextContent(editor.getJSON());
      }}
    >
      {/* Editor UI */}
    </EditorProvider>
  );
}
```

**Why `key` is necessary:**
- Without `key`, editor doesn't re-render when switching questions
- Content from previous question may persist
- `key={selectedQuestion}` forces component re-mount with fresh content

**Why `content` is necessary:**
- Initializes editor with loaded content on mount
- Without it, editor starts empty even if state has content

---

## Question Schema Patterns

### Single Choice Question Structure

Questions use rich content arrays for text, options, and explanations:

```typescript
interface SingleChoiceQuestion {
  questionNumber: number;
  questionType: "SINGLE_CHOICE";
  questionText: RichContentBlock[];
  instruction?: string;

  hierarchy: {
    examType: string; // "WAEC", "JAMB", etc.
    subject: string;
    subjectCode: string;
    topic: {
      name: string;
    };
  };

  metadata: {
    examType: string;
    examYear: string;
    examPeriod: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    estimatedTimeSeconds: number;
    marks: number;
    passingMarks: number;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    tags: string[];
    cognitiveLevel: "RECALL" | "UNDERSTAND" | "APPLY" | "ANALYZE" | "EVALUATE" | "CREATE";
    skillsAssessed: string[];
    learningOutcomes: string[];
  };

  options: Array<{
    id: string; // "A", "B", "C", "D"
    content: RichContentBlock[];
    isCorrect: boolean;
  }>;

  correctAnswer: string; // "A", "B", "C", "D"
  explanation?: RichContentBlock[]; // Optional explanation

  marks: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  topicId: string;
}
```

### Example Question Data

```json
{
  "questionNumber": 1,
  "questionType": "SINGLE_CHOICE",
  "questionText": [
    {
      "type": "text",
      "value": "What is the capital of France?"
    }
  ],
  "instruction": "Choose the correct answer",
  "hierarchy": {
    "examType": "WAEC",
    "subject": "Geography",
    "subjectCode": "GEO",
    "topic": {
      "name": "World Geography"
    }
  },
  "metadata": {
    "examType": "WAEC",
    "examYear": "2024",
    "examPeriod": "MAY/JUNE",
    "difficulty": "EASY",
    "estimatedTimeSeconds": 60,
    "marks": 1,
    "passingMarks": 1,
    "status": "DRAFT",
    "tags": ["geography", "capitals"],
    "cognitiveLevel": "RECALL",
    "skillsAssessed": ["memory_recall"],
    "learningOutcomes": ["Identify world capitals"]
  },
  "options": [
    {
      "id": "A",
      "content": [{ "type": "text", "value": "London" }],
      "isCorrect": false
    },
    {
      "id": "B",
      "content": [{ "type": "text", "value": "Paris" }],
      "isCorrect": true
    },
    {
      "id": "C",
      "content": [{ "type": "text", "value": "Berlin" }],
      "isCorrect": false
    },
    {
      "id": "D",
      "content": [{ "type": "text", "value": "Madrid" }],
      "isCorrect": false
    }
  ],
  "correctAnswer": "B",
  "explanation": [
    {
      "type": "text",
      "value": "Paris has been the capital of France since the 10th century."
    }
  ],
  "marks": 1,
  "difficulty": "EASY",
  "status": "DRAFT",
  "topicId": "{{topic_id}}"
}
```

### Rich Content in Questions

Questions can contain any combination of content types:

```json
{
  "questionText": [
    {
      "type": "text",
      "value": "Solve the equation below:"
    },
    {
      "type": "latex",
      "value": {
        "equation": "x^2 + 5x + 6 = 0",
        "displayMode": true
      }
    },
    {
      "type": "image",
      "value": {
        "src": "https://example.com/graph.png",
        "alt": "Graph showing parabola"
      }
    }
  ],
  "options": [
    {
      "id": "A",
      "content": [
        {
          "type": "markdown",
          "value": {
            "content": "x = -2, x = -3",
            "formatting": { "bold": true }
          }
        }
      ],
      "isCorrect": true
    }
  ]
}
```

### Content Rendering Pattern

```typescript
import { RichContentType, type RichContentBlock } from "@/lib/rich-content";

function RichContentRenderer({ blocks }: { blocks: RichContentBlock[] }) {
  return (
    <div className="rich-content">
      {blocks.map((block, index) => {
        switch (block.type) {
          case RichContentType.TEXT:
            return <p key={index}>{block.value as string}</p>;

          case RichContentType.MARKDOWN:
            const markdown = block.value as MarkdownValue;
            return (
              <p
                key={index}
                className={cn({
                  "font-bold": markdown.formatting.bold,
                  "italic": markdown.formatting.italic,
                })}
              >
                {markdown.content}
              </p>
            );

          case RichContentType.IMAGE:
            const image = block.value as ImageValue;
            return (
              <img
                key={index}
                src={image.src}
                alt={image.alt}
                className="max-w-full rounded-lg"
              />
            );

          case RichContentType.LATEX:
            const latex = block.value as LatexValue;
            return (
              <div
                key={index}
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(latex.equation, {
                    displayMode: latex.displayMode,
                  }),
                }}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
```

### Question Form Pattern

```typescript
import { useForm, Controller } from "react-hook-form";
import { EditorProvider } from "@/components/kibo-ui/editor";
import { tiptapToRichContent } from "@/lib/rich-content";

function CreateQuestionForm() {
  const form = useForm({
    defaultValues: {
      questionText: [],
      options: [
        { id: "A", content: [], isCorrect: false },
        { id: "B", content: [], isCorrect: false },
        { id: "C", content: [], isCorrect: false },
        { id: "D", content: [], isCorrect: false },
      ],
    },
  });

  const handleQuestionTextUpdate = ({ editor }) => {
    const richContent = tiptapToRichContent(editor.getJSON());
    form.setValue("questionText", richContent);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <Label>Question Text</Label>
        <EditorProvider onUpdate={handleQuestionTextUpdate}>
          {/* Editor UI */}
        </EditorProvider>
      </div>

      {/* Option editors */}
      {form.watch("options").map((option, index) => (
        <div key={option.id}>
          <Label>Option {option.id}</Label>
          <EditorProvider
            onUpdate={({ editor }) => {
              const content = tiptapToRichContent(editor.getJSON());
              form.setValue(`options.${index}.content`, content);
            }}
          >
            {/* Editor UI */}
          </EditorProvider>
        </div>
      ))}
    </form>
  );
}
```

### Dynamic Options Pattern

**CRITICAL:** For questions with variable number of options, use `Map<string, JSONContent>` for efficient state management:

```typescript
import { useState } from "react";
import type { JSONContent } from "@/components/kibo-ui/editor";

function QuestionEditor() {
  // ========== STATE MANAGEMENT ==========
  const [totalOptions, setTotalOptions] = useState(4); // Default 4 options (A-D)

  // Use Map for label-based access (more efficient than array)
  const [optionsContent, setOptionsContent] = useState<Map<string, JSONContent | null>>(
    new Map([
      ["A", null],
      ["B", null],
      ["C", null],
      ["D", null],
    ])
  );

  // ========== HELPER FUNCTIONS ==========

  // Convert index to option label (0→A, 1→B, 2→C, etc.)
  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index); // 65 is ASCII 'A'
  };

  // Update specific option content
  const updateOptionContent = (label: string, content: JSONContent | null) => {
    setOptionsContent((prev) => new Map(prev).set(label, content));
  };

  // Add new option
  const handleAddOption = () => {
    setTotalOptions((prev) => prev + 1);
    const newLabel = getOptionLabel(totalOptions);
    setOptionsContent((prev) => new Map(prev).set(newLabel, null));
  };

  // ========== LOADING FROM API ==========

  const loadExistingQuestion = (question: Question) => {
    // Set option count from API
    setTotalOptions(question.options.length);

    // Load option contents
    const newOptionsMap = new Map<string, JSONContent | null>();
    question.options.forEach((option) => {
      const optionContent = option.content && option.content.length > 0
        ? apiFormatToTiptap(option.content)
        : null;
      newOptionsMap.set(option.id, optionContent);
    });
    setOptionsContent(newOptionsMap);
  };

  // ========== SAVING TO API ==========

  const handleSave = () => {
    // Build options array dynamically
    const options = Array.from({ length: totalOptions }, (_, index) => {
      const label = getOptionLabel(index);
      const content = optionsContent.get(label);

      return {
        id: label,
        content: content
          ? richContentToAPIFormat(tiptapToRichContent(content))
          : [],
        isCorrect: correctAnswer === label,
      };
    });

    createQuestion({ options });
  };

  // ========== RENDERING ==========

  return (
    <div>
      {/* Dynamically render options */}
      {Array.from({ length: totalOptions }, (_, index) => {
        const label = getOptionLabel(index);
        return (
          <div key={label}>
            <Label>Option {label}</Label>
            <EditorProvider
              // Force re-mount when switching questions
              key={`option-${label}-${selectedQuestion}`}

              // Load saved content
              content={optionsContent.get(label) || undefined}

              placeholder={`Option ${label}...`}
              onUpdate={({ editor }) => {
                updateOptionContent(label, editor.getJSON());
              }}
            >
              {/* Editor UI */}
            </EditorProvider>
          </div>
        );
      })}

      {/* Add option button */}
      <Button onClick={handleAddOption}>
        + Add Option
      </Button>
    </div>
  );
}
```

**Why Map instead of Array:**
- ✅ Direct label-based access: `optionsContent.get("A")`
- ✅ No need to find index for specific option
- ✅ Easier to add/remove options without shifting indices
- ✅ Labels preserved when options are added/removed
- ✅ More efficient updates (no array recreation)

**Reset Pattern:**
```typescript
const resetForm = () => {
  setTotalOptions(4); // Reset to default

  // Initialize options Map for default 4 options
  const initialOptions = new Map<string, JSONContent | null>();
  for (let i = 0; i < 4; i++) {
    initialOptions.set(getOptionLabel(i), null);
  }
  setOptionsContent(initialOptions);
};
```

**Bubble Menu State Pattern (for dynamic options):**
```typescript
// Instead of individual states for each option
// ❌ DON'T:
const [openNodeA, setOpenNodeA] = useState(false);
const [openNodeB, setOpenNodeB] = useState(false);
// ... etc for all options

// ✅ DO: Use Map for dynamic bubble menu states
const [openNodeOptions, setOpenNodeOptions] = useState<Map<string, boolean>>(new Map());
const [openLinkOptions, setOpenLinkOptions] = useState<Map<string, boolean>>(new Map());

// Helper functions
const getOpenNodeOption = (label: string) => openNodeOptions.get(label) || false;
const setOpenNodeOption = (label: string, value: boolean) => {
  setOpenNodeOptions((prev) => new Map(prev).set(label, value));
};
```

---

## Best Practices Summary

### ✅ DO

1. **Use Field + Controller** pattern for all forms
2. **Use `usePagination` hook** from `lib/url-state.ts` for all tables
3. **Use simple query keys** for cache invalidation (e.g., `["exam-types"]`)
4. **Include pagination params** in queryKey (e.g., `["resources", { page, limit, sortBy, sortOrder }]`)
5. **Stop propagation** for nested interactive elements in rows
6. **Use AlertDialog** instead of browser alerts
7. **Add explicit type annotations** to avoid implicit `any`
8. **Invalidate parent caches** for hierarchical data
9. **Use `refetch`** callback for manual refreshes
10. **Use `toast`** for user feedback
11. **Await params** in Next.js 15 dynamic routes
12. **Use `useMemo`** for expensive computations and derived data
13. **Match Promise types** to actual API response structure
14. **Use invalidateQueries + refetchQueries** for immediate UI updates
15. **One component per file** - never multiple components in one file
16. **Create feature-specific URL state** hooks for complex filters
17. **Add loading and empty states** for all data-fetching components
18. **Make filter params optional** when API supports it
19. **Use RichContentBlock arrays** for all text content (questions, options, explanations)
20. **Transform editor content** with `tiptapToRichContent()` before saving
21. **Type all content blocks** with proper `RichContentType` enum values
22. **Use `apiFormatToTiptap()`** when loading API content into editors
23. **Use `richContentToAPIFormat()`** when saving editor content to API
24. **Use `key` prop** on EditorProvider to force re-mount when switching content
25. **Use `content` prop** on EditorProvider to initialize with loaded content
26. **Use `Map<string, JSONContent>`** for dynamic options state management
27. **Use `getOptionLabel(index)`** pattern for converting 0→A, 1→B, etc.

### ❌ DON'T

1. **Don't use custom form components** - use Field + Controller
2. **Don't manually read pagination from searchParams** - use `usePagination` hook
3. **Don't manually manipulate URLs for pagination** - use hook callbacks
4. **Don't use query options** for cache invalidation
5. **Don't forget stopPropagation** on table row actions
6. **Don't use `any`** without explicit casting
7. **Don't create new files** unless absolutely necessary
8. **Don't use browser alerts** - use AlertDialog
9. **Don't mix tab filter** with advanced filters in URL state
10. **Don't forget to reset forms** when dialog closes
11. **Don't forget loading states** for async operations
12. **Don't hardcode data** - connect to APIs
13. **Don't assume API response structure** - verify with actual response
14. **Don't put multiple components** in one file
15. **Don't use only invalidateQueries** when immediate refresh needed - add refetchQueries
16. **Don't store raw Tiptap JSON** in database - transform to RichContentBlock[] first
17. **Don't use plain strings** for formatted content - use MARKDOWN type with formatting object
18. **Don't hardcode content types** - always use `RichContentType` enum
19. **Don't forget `key` prop** when loading content into EditorProvider
20. **Don't use individual states** for each option - use Map for dynamic options
21. **Don't convert API → Tiptap manually** - use `apiFormatToTiptap()` helper

---

## Common Patterns Quick Reference

### Work with Rich Content

1. Import types: `import { RichContentType, type RichContentBlock, apiFormatToTiptap, richContentToAPIFormat } from "@/lib/rich-content"`
2. Use editor: `<EditorProvider key="unique-key" content={loadedContent} onUpdate={({ editor }) => setContent(editor.getJSON())} />`
3. Transform on save: `const apiFormat = richContentToAPIFormat(tiptapToRichContent(editorJSON))`
4. Transform on load: `const tiptapJSON = apiFormatToTiptap(apiContent)`
5. Render content: Map over blocks with switch statement on `block.type`

### Work with Dynamic Options

1. State: `const [totalOptions, setTotalOptions] = useState(4)`
2. State: `const [optionsContent, setOptionsContent] = useState<Map<string, JSONContent | null>>(new Map())`
3. Helper: `const getOptionLabel = (index: number) => String.fromCharCode(65 + index)`
4. Update: `const updateOptionContent = (label, content) => setOptionsContent(prev => new Map(prev).set(label, content))`
5. Render: `Array.from({ length: totalOptions }, (_, i) => { const label = getOptionLabel(i); ... })`
6. Load from API: Set `totalOptions` from `question.options.length`, build Map with `apiFormatToTiptap()`
7. Save to API: `Array.from({ length: totalOptions })` to build options array with `richContentToAPIFormat()`

### Create a Question with Rich Content

1. Set up form with `questionText: []` and `options: [{ id, content: [], isCorrect }]`
2. Add editor for question text with `onUpdate` handler
3. Add editor for each option with indexed `onUpdate` handlers
4. Transform all content with `tiptapToRichContent()` before submitting
5. Include all required fields: questionType, hierarchy, metadata, options, correctAnswer

### Create a New Feature

1. Create folder structure: `features/[feature]/api/[resource]/`
2. Create API files following the standard structure
3. Create components: table, dialogs, detail view
4. Create columns with actions
5. Create URL state management
6. Wire up pages in `app/(admin)/`

### Add CRUD to Existing Feature

1. Update API layer with create/update/delete hooks
2. Create/update dialog components with forms
3. Add actions to table columns with ActionsCell
4. Ensure cache invalidation is correct
5. Add success/error toast notifications

### Debug Cache Issues

1. Check query key matches between fetch and invalidation
2. Use simple keys: `["resource"]` not `getResourceQueryOptions().queryKey`
3. For hierarchical data, invalidate all levels
4. Check if `refetch` callback is passed to columns

### Fix Click Propagation Issues

1. Add `onClick={(e) => e.stopPropagation()}` to dropdown trigger
2. Add `onClick={(e) => e.stopPropagation()}` to dropdown content
3. Use `onSelect={(e) => e.preventDefault()}` for dialog triggers in menu

---

## Pending Tasks & TODOs

### High Priority

#### Question Editor Enhancements
- [ ] **Update Question Mutation** - Implement `useUpdateQuestion` hook for editing existing questions
  - File: `features/questions/api/update-question.ts` (needs creation)
  - Update `handleSave()` to detect if editing or creating (check if question exists)
  - Add logic to call create vs update based on whether question exists
  - Button text: "Save Changes" vs "Create Question"

- [ ] **Bulk Question Upload** - Implement the "Bulk Upload Questions" button functionality
  - Support CSV/Excel upload with question data
  - Parser for rich content format
  - Validation and preview before import

- [ ] **Question Filtering** - Add filters to question editor
  - Filter by topic/subtopic
  - Filter by difficulty level
  - Filter by status (draft/published/archived)
  - Search by question text

- [ ] **Question Analytics** - Show question statistics on grid
  - Attempt count display
  - Success rate percentage
  - Average score indicator
  - Visual indicators on question number buttons

#### Subject Detail Page Refactor
- [ ] **Match Institution Flow** - Redesign subject detail page to use expandable table structure
  - Reference: `app/(admin)/institutions/` flow
  - Implement expandable rows for topics showing subtopics
  - Inline edit/delete actions
  - Add topic/subtopic management from subject context

- [ ] **Topics Management UI**
  - Add Topic - Create new topics under current subject
  - Edit Topic - Inline editing of topic name
  - Delete Topic - With confirmation, check for dependent questions
  - Reorder Topics - Drag and drop ordering

- [ ] **Subtopics Management UI**
  - Add Subtopic - Create new subtopics under selected topic
  - Edit Subtopic - Inline editing
  - Delete Subtopic - With confirmation and dependency check
  - Reorder Subtopics - Drag and drop ordering

### Medium Priority

#### Multi-Choice Question Support
- [ ] **Multiple Correct Answers** - Extend editor for MULTI_CHOICE type
  - Change from radio buttons to checkboxes
  - Update `correctAnswer` to `correctAnswers` array handling
  - Validation for at least one correct answer

#### Other Question Types
- [ ] **Fill in the Blank Editor** - Implement FILL_IN_BLANK question type UI
- [ ] **Essay Question Editor** - Implement ESSAY question type UI
  - Rubric/marking guide section
  - Word count limits

#### Rich Content Enhancements
- [ ] **Image Upload** - Direct image upload to cloud storage
  - Currently uses URLs only
  - Add Cloudinary/S3 integration
  - Image preview and management

- [ ] **Video/Audio Upload** - Direct media upload support
- [ ] **LaTeX Preview** - Real-time LaTeX rendering preview in editors

### Low Priority

#### Question Features
- [ ] **Question Versioning** - Track changes to questions over time
  - Store previous versions
  - Show diff between versions
  - Restore to previous version capability

- [ ] **Question Duplication** - Copy existing question to new slot
  - Duplicate button on question card
  - Auto-assign to next available slot

- [ ] **Question Templates** - Save question structure as reusable template
  - Template library
  - Apply template to new question

### Technical Debt

#### TypeScript Issues
- [ ] Fix `@typescript-eslint/no-explicit-any` warnings
- [ ] Fix missing type definitions in `features/users/components/users-detail.tsx`
- [ ] Fix missing `createdAt`, `updatedAt` properties in Subject types

#### React/ESLint Warnings
- [ ] Fix `react/no-unescaped-entities` in question editor
- [ ] Remove unused variables (`@typescript-eslint/no-unused-vars`)

#### API Schema Alignment
- [ ] Ensure all Question types match backend schema exactly
- [ ] Add proper error handling for API format conversion failures
- [ ] Add logging for conversion errors in production

---

## Recent Updates (v2.2.4 - Question Editor)

### Completed Features
- ✅ **Unified Question Editor** - Removed "new" vs "all" modes, single unified interface
- ✅ **Dynamic Question Slots** - Stepper control (+10/-10) for managing question slots (default 50, expandable)
- ✅ **Hard Delete with Gap Preservation** - Delete questions but preserve slot numbers for exam integrity
- ✅ **Context-Aware Hierarchy** - Exam type and subject read-only on subject detail page, only topic/subtopic editable
- ✅ **Dynamic Options System** - Default 4 options (A-D), can add unlimited options (E, F, G...)
- ✅ **Rich Content Converter** - API format to Tiptap conversion (`apiFormatToTiptap()`)
- ✅ **Content Loading** - Load existing questions with full rich text content into editors
- ✅ **Options Count Preservation** - Correctly load and display questions with 5+ options

**Files Modified:**
- `features/subjects/components/question-editor.tsx`
- `lib/rich-content.ts` (added `apiFormatToRichContent()` and `apiFormatToTiptap()`)
- `app/(admin)/subjects/[id]/questions/page.tsx`
- `features/questions/api/get-questions.ts` (updated Question interface)
- `features/questions/api/create-question.ts` (updated schema)

**Key Implementation Details:**
- Options stored in `Map<label, JSONContent>` for efficient label-based access
- `getOptionLabel(index)` converts 0→A, 1→B, etc.
- EditorProvider uses `key` prop to force remounting when switching questions
- `content` prop initializes editors with loaded content
- Hard delete preserves question numbers - empty slots can be filled later
- Year-based question sets - each year has independent numbering

---

---

## File Upload Handling

### FormData Pattern with Axios

When uploading files, **NEVER** manually set `Content-Type` headers. The browser must set the multipart boundary automatically.

**✅ DO:**
```typescript
import { axiosInstance } from "@/lib/api-client";

export const uploadFile = async ({
  file,
  fileType = "csv",
}: {
  file: File;
  fileType?: string;
}): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileType", fileType);

  // DON'T set Content-Type - let browser add boundary parameter automatically
  return axiosInstance.post<any, UploadResult>(
    "/admin/upload",
    formData
  );
};
```

**❌ DON'T:**
```typescript
// ❌ WRONG - Manual Content-Type prevents boundary from being set
export const uploadFile = async ({ file }: { file: File }) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosInstance.post("/admin/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Missing boundary!
    },
  });
};
```

### Multiple File Upload

```typescript
export const uploadMultipleFiles = async ({
  files,
}: {
  files: File[];
}): Promise<UploadResult> => {
  const formData = new FormData();

  // Append all files with the same field name
  files.forEach((file) => {
    formData.append("documents", file);
  });

  // Let browser set Content-Type with boundary
  return axiosInstance.post<any, UploadResult>(
    "/admin/upload-multiple",
    formData
  );
};
```

### Axios Interceptor for FormData (lib/api-client.ts)

The axios request interceptor automatically detects FormData and skips setting Content-Type:

```typescript
function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    config.headers.Accept = "application/json";

    // Only set Content-Type if not FormData (let browser set it with boundary for FormData)
    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
  }

  // Add auth token
  const token = getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.withCredentials = true;
  return config;
}
```

**Why this is critical:**
- FormData requires a boundary parameter: `Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...`
- The browser generates a unique boundary for each request
- Manually setting the header without the boundary causes the server to fail parsing the file
- The file object appears as `{}` (empty) in the request payload

### File Upload Hook Pattern

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MutationConfig } from "@/lib/react-query";

type UseUploadFileOptions = {
  mutationConfig?: MutationConfig<typeof uploadFile>;
};

export const useUploadFile = ({
  mutationConfig,
}: UseUploadFileOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      await queryClient.invalidateQueries({
        queryKey: ["files"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["files"],
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: uploadFile,
  });
};
```

### File Upload UI Pattern

```typescript
function FileUploadDialog() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useUploadFile({
    mutationConfig: {
      onSuccess: () => {
        toast.success("File uploaded successfully");
        setSelectedFile(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to upload file");
      },
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    uploadMutation.mutate({
      file: selectedFile,
      fileType: selectedFile.name.endsWith(".xlsx") ? "xlsx" : "csv",
    });
  };

  return (
    <Dialog>
      <DialogContent>
        <Input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
        />
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Version History

- **v1.0.0** (2025-11-14): Initial coding standards documentation
- **v1.1.0** (2025-11-14): Added pagination patterns with `usePagination` hook
- **v1.2.0** (2025-11-17): Added enhanced cache invalidation (invalidateQueries + refetchQueries), API response type alignment, optional filter parameters, one component per file rule, frontend search filtering, feature-specific URL state management, detail component patterns with loading/empty states, and optional props in dialogs
- **v1.3.0** (2025-11-18): Added Rich Content Patterns (RichContentType enum, content block system, Tiptap integration, transformers) and Question Schema Patterns (single choice structure, rich content in questions, rendering patterns, form patterns)
- **v1.3.1** (2025-11-18): Added Pending Tasks & TODOs section, Recent Updates section for Question Editor v2.2.4
- **v1.4.0** (2025-11-19): Added Cache Management & Delete Patterns section
- **v1.4.1** (2025-11-19): Added API Format Conversion Pattern, Editor Content Loading Pattern, and Dynamic Options Pattern with comprehensive examples; updated Best Practices and Common Patterns Quick Reference sections
- **v1.5.0** (2025-11-20): Added File Upload Handling section with FormData patterns, axios interceptor for automatic boundary handling, multiple file upload patterns, and comprehensive file upload UI examples

---

**Remember:** Consistency is key. Follow these patterns across all features to maintain a clean, maintainable codebase.
