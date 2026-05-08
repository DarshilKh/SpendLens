import { z } from "zod";

export const ToolEntrySchema = z.object({
  id: z.string().uuid(),
  toolId: z.enum([
    "cursor",
    "github_copilot",
    "claude",
    "chatgpt",
    "anthropic_api",
    "openai_api",
    "gemini",
    "windsurf",
  ]),
  planId: z.string().min(1),
  seats: z.number().int().min(1).max(10000),
  monthlySpend: z.number().min(0).max(1_000_000),
});

export const AuditFormSchema = z.object({
  tools: z
    .array(ToolEntrySchema)
    .min(1, "Add at least one AI tool")
    .max(20, "Maximum 20 tools per audit"),
  teamSize: z.number().int().min(1).max(100_000),
  useCase: z.enum(["coding", "writing", "data", "research", "mixed"]),
  companyName: z.string().max(100).optional(),
});

export const LeadCaptureSchema = z.object({
  email: z.string().email("Enter a valid email"),
  companyName: z.string().max(100).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(100_000).optional(),
  auditId: z.string().uuid(),
  wantsConsultation: z.boolean(),
});

export const AuditApiRequestSchema = z.object({
  formData: AuditFormSchema,
  referralCode: z.string().max(32).optional(),
});

export type AuditFormInput = z.infer<typeof AuditFormSchema>;
export type LeadCaptureInput = z.infer<typeof LeadCaptureSchema>;
