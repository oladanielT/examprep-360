import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { MutationConfig } from "@/lib/react-query";
import { axiosInstance } from "@/lib/api-client";

// ========== SCHEMAS ==========

// Validation Error Schema
const validationErrorSchema = z.object({
  row: z.number(),
  field: z.string().optional(),
  message: z.string(),
  value: z.any().optional(),
});

// Validation Result Schema
const validationResultSchema = z.object({
  isValid: z.boolean(),
  totalRows: z.number(),
  validRows: z.number(),
  invalidRows: z.number(),
  errors: z.array(validationErrorSchema),
  warnings: z.array(z.string()).optional(),
});

// Upload Result Schema
const uploadResultSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  totalQuestions: z.number(),
  successfulUploads: z.number(),
  failedUploads: z.number(),
  errors: z.array(validationErrorSchema).optional(),
});

export type ValidationError = z.infer<typeof validationErrorSchema>;
export type ValidationResult = z.infer<typeof validationResultSchema>;
export type UploadResult = z.infer<typeof uploadResultSchema>;

// ========== API CALLS ==========

/**
 * Validate bulk upload file before actual upload
 */
export const validateBulkUploadFile = async ({
  file,
  fileType = "csv",
}: {
  file: File;
  fileType?: "csv" | "xlsx";
}): Promise<ValidationResult> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileType", fileType);

  // Don't set Content-Type manually - let the browser set it with boundary
  return axiosInstance.post<any, ValidationResult>(
    "/admin/content/bulk-upload/validate",
    formData
  );
};

/**
 * Upload bulk questions from CSV/Excel file
 */
export const uploadBulkQuestions = async ({
  file,
  fileType = "csv",
  validateOnly = false,
}: {
  file: File;
  fileType?: "csv" | "xlsx";
  validateOnly?: boolean;
}): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileType", fileType);
  formData.append("validateOnly", String(validateOnly));

  // Don't set Content-Type manually - let the browser set it with boundary
  return axiosInstance.post<any, UploadResult>(
    "/admin/content/bulk-upload/upload",
    formData
  );
};

/**
 * Download CSV template for bulk upload
 */
export const downloadBulkUploadTemplate = async (
  format: "csv" | "xlsx" = "csv"
): Promise<Blob> => {
  return axiosInstance.get<any, Blob>(
    `/admin/content/bulk-upload/template`,
    {
      params: { format },
      headers: {
        Accept: format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
      responseType: "blob",
    } as any
  );
};

// ========== HOOKS ==========

/**
 * Hook for validating bulk upload file
 */
type UseValidateBulkUploadOptions = {
  mutationConfig?: MutationConfig<typeof validateBulkUploadFile>;
};

export const useValidateBulkUpload = ({
  mutationConfig,
}: UseValidateBulkUploadOptions = {}) => {
  return useMutation({
    ...mutationConfig,
    mutationFn: validateBulkUploadFile,
  });
};

/**
 * Hook for uploading bulk questions
 */
type UseUploadBulkQuestionsOptions = {
  mutationConfig?: MutationConfig<typeof uploadBulkQuestions>;
};

export const useUploadBulkQuestions = ({
  mutationConfig,
}: UseUploadBulkQuestionsOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};

  return useMutation({
    onSuccess: async (data, ...args) => {
      // Invalidate and refetch all question queries after successful upload
      await queryClient.invalidateQueries({
        queryKey: ["questions"],
        refetchType: "active",
      });
      await queryClient.refetchQueries({
        queryKey: ["questions"],
      });
      onSuccess?.(data, ...args);
    },
    ...restConfig,
    mutationFn: uploadBulkQuestions,
  });
};

/**
 * Hook for downloading bulk upload template
 * This is a simple async function wrapper since downloads don't need mutation state
 */
export const useBulkUploadTemplate = () => {
  const downloadTemplate = async (format: "csv" | "xlsx" = "csv") => {
    try {
      const blob = await downloadBulkUploadTemplate(format);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bulk-upload-template.${format}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download template:", error);
      throw error;
    }
  };

  return { downloadTemplate };
};
