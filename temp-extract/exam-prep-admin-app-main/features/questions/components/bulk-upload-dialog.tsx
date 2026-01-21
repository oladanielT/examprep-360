"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FileUp, Download, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import {
  useValidateBulkUpload,
  useUploadBulkQuestions,
  useBulkUploadTemplate,
  type ValidationResult,
} from "../api/bulk-upload-questions";

interface BulkUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkUploadDialog({ open, onOpenChange, onSuccess }: BulkUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"csv" | "xlsx">("csv");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const { downloadTemplate } = useBulkUploadTemplate();
  const validateMutation = useValidateBulkUpload({
    mutationConfig: {
      onSuccess: (data) => {
        setValidationResult(data);
        if (data.isValid) {
          toast.success(`Validation successful! ${data.validRows} valid rows found.`);
        } else {
          toast.warning(`Validation completed with ${data.invalidRows} errors.`);
        }
      },
      onError: (error) => {
        toast.error("Failed to validate file: " + error.message);
      },
    },
  });

  const uploadMutation = useUploadBulkQuestions({
    mutationConfig: {
      onSuccess: (data) => {
        if (data.success) {
          toast.success(
            `Successfully uploaded ${data.successfulUploads} questions!`
          );
          onOpenChange(false);
          resetForm();
          onSuccess?.();
        } else {
          toast.error(`Upload failed: ${data.message}`);
        }
      },
      onError: (error) => {
        toast.error("Failed to upload questions: " + error.message);
      },
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Detect file type from extension
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (extension === "csv") {
        setFileType("csv");
      } else if (extension === "xlsx" || extension === "xls") {
        setFileType("xlsx");
      } else {
        toast.error("Please select a CSV or Excel file");
        return;
      }

      setSelectedFile(file);
      setValidationResult(null); // Reset validation when new file is selected
    }
  };

  const handleValidate = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    validateMutation.mutate({ file: selectedFile, fileType });
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    if (!validationResult?.isValid) {
      toast.error("Please validate the file first and fix any errors");
      return;
    }

    uploadMutation.mutate({
      file: selectedFile,
      fileType,
      validateOnly: false,
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate(fileType);
      toast.success(`Template downloaded successfully!`);
    } catch (error) {
      toast.error("Failed to download template");
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setValidationResult(null);
  };

  const isValidating = validateMutation.isPending;
  const isUploading = uploadMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Questions</DialogTitle>
          <DialogDescription>
            Upload multiple questions at once using a CSV or Excel file. Download
            the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Download Template Section */}
          <div className="space-y-2">
            <Label>Step 1: Download Template</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFileType("csv");
                  handleDownloadTemplate();
                }}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFileType("xlsx");
                  handleDownloadTemplate();
                }}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Excel Template
              </Button>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Step 2: Upload Filled Template</Label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={isValidating || isUploading}
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({fileType.toUpperCase()})
              </p>
            )}
          </div>

          {/* Validation Section */}
          <div className="space-y-2">
            <Label>Step 3: Validate File</Label>
            <Button
              type="button"
              variant="outline"
              onClick={handleValidate}
              disabled={!selectedFile || isValidating || isUploading}
              className="w-full"
            >
              {isValidating ? (
                <>Validating...</>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Validate File
                </>
              )}
            </Button>

            {/* Validation Results */}
            {validationResult && (
              <Card
                className={`mt-2 p-4 ${
                  validationResult.isValid
                    ? "border-green-500 bg-green-50"
                    : "border-destructive bg-destructive/10"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    {validationResult.isValid ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">
                        {validationResult.isValid
                          ? "Validation Successful"
                          : "Validation Failed"}
                      </p>
                      <p className="text-sm mt-1">
                        Total Rows: {validationResult.totalRows} | Valid:{" "}
                        {validationResult.validRows} | Invalid:{" "}
                        {validationResult.invalidRows}
                      </p>
                    </div>
                  </div>

                  {/* Show Errors */}
                  {validationResult.errors.length > 0 && (
                    <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
                      <p className="text-sm font-semibold">Errors:</p>
                      {validationResult.errors.slice(0, 10).map((error, idx) => (
                        <div
                          key={idx}
                          className="text-sm bg-destructive/10 rounded p-2"
                        >
                          <span className="font-medium">Row {error.row}:</span>{" "}
                          {error.message}
                          {error.field && (
                            <span className="text-muted-foreground">
                              {" "}
                              (Field: {error.field})
                            </span>
                          )}
                        </div>
                      ))}
                      {validationResult.errors.length > 10 && (
                        <p className="text-sm text-muted-foreground italic">
                          ... and {validationResult.errors.length - 10} more
                          errors
                        </p>
                      )}
                    </div>
                  )}

                  {/* Show Warnings */}
                  {validationResult.warnings &&
                    validationResult.warnings.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                          <p className="text-sm font-semibold">Warnings:</p>
                        </div>
                        {validationResult.warnings.map((warning, idx) => (
                          <p key={idx} className="text-sm text-muted-foreground">
                            • {warning}
                          </p>
                        ))}
                      </div>
                    )}
                </div>
              </Card>
            )}
          </div>

          {/* Upload Section */}
          <div className="space-y-2">
            <Label>Step 4: Upload Questions</Label>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={
                !selectedFile ||
                !validationResult?.isValid ||
                isValidating ||
                isUploading
              }
              className="w-full bg-[#BEE74C] hover:bg-[#B0D945] text-black font-semibold"
            >
              {isUploading ? (
                <>Uploading...</>
              ) : (
                <>
                  <FileUp className="h-4 w-4 mr-2" />
                  Upload Questions
                </>
              )}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              resetForm();
            }}
            disabled={isValidating || isUploading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
