"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeClosed, Facebook } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { InputField } from "@/components/custom/custom-form-field";
import PrimaryButton from "@/components/buttons/primary-button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

import * as z from "zod";
import Link from "next/link";
import { paths } from "@/paths";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters.")
      .max(50, "Name must be at most 50 characters."),
    email: z.string().email("Please enter a valid email address."),
    phone: z
      .string()
      .min(10, "Phone number must be at least 10 characters.")
      .max(15, "Phone number must be at most 15 characters."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(50, "Password must be at most 50 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const RegisterForm = () => {
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(false);

  function onSubmit(data: z.infer<typeof registerSchema>) {
    // Do something with the form values.
    console.log(data);
  }

  return (
    <div className="w-full">
      <form className="w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="w-full">
          {/* Name Field */}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-name">Full Name</FieldLabel>
                <InputField
                  {...field}
                  id="form-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="e.g. Sayo Makinwa"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Email Field */}
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-email">Email Address</FieldLabel>
                <InputField
                  {...field}
                  id="form-email"
                  aria-invalid={fieldState.invalid}
                  placeholder="sample@email.com"
                  type="email"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Phone Field */}
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-phone">Phone Number</FieldLabel>
                <InputField
                  {...field}
                  id="form-phone"
                  aria-invalid={fieldState.invalid}
                  placeholder="+23470 **** ****"
                  type="tel"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Password Field */}
          <Controller
            name="password"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-password">Password</FieldLabel>
                <InputGroup className="rounded-4xl h-14">
                  <InputGroupInput
                    {...field}
                    id="form-password"
                    type={seePassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label="Toggle password visibility"
                      title="Toggle password visibility"
                      size="icon-xs"
                      onClick={() => setSeePassword(!seePassword)}
                    >
                      {seePassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeClosed className="h-4 w-4" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Confirm Password Field */}
          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-confirm-password">
                  Confirm Password
                </FieldLabel>
                <InputGroup className="rounded-4xl h-14">
                  <InputGroupInput
                    {...field}
                    id="form-confirm-password"
                    type={seeConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      aria-label="Toggle password visibility"
                      title="Toggle password visibility"
                      size="icon-xs"
                      onClick={() => setSeeConfirmPassword(!seeConfirmPassword)}
                    >
                      {seeConfirmPassword ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeClosed className="h-4 w-4" />
                      )}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <PrimaryButton
          type="submit"
          className="w-full bg-accent hover:bg-accent/80 mt-10 text-white text-lg"
          title="Continue"
        />
      </form>
      <PrimaryButton
        className="w-full hover:bg-gray-200 mt-5 text-lg bg-transparent border text-gray-800 border-gray-300"
        title="Continue"
      >
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_794_20378)">
              <path
                d="M19.8052 10.2312C19.8052 9.55141 19.7501 8.86797 19.6325 8.19922H10.2002V12.05H15.6016C15.3775 13.292 14.6573 14.3907 13.6027 15.0888V17.5874H16.8252C18.7176 15.8457 19.8052 13.2736 19.8052 10.2312Z"
                fill="#4285F4"
              />
              <path
                d="M10.1999 19.9998C12.897 19.9998 15.1714 19.1143 16.8286 17.5857L13.6061 15.0871C12.7096 15.697 11.5521 16.0424 10.2036 16.0424C7.59474 16.0424 5.38272 14.2824 4.58904 11.916H1.26367V14.4918C2.96127 17.8686 6.41892 19.9998 10.1999 19.9998Z"
                fill="#34A853"
              />
              <path
                d="M4.58564 11.9163C4.16676 10.6743 4.16676 9.32947 4.58564 8.0875V5.51172H1.26395C-0.154389 8.33737 -0.154389 11.6664 1.26395 14.4921L4.58564 11.9163Z"
                fill="#FBBC04"
              />
              <path
                d="M10.1999 3.95805C11.6256 3.936 13.0035 4.47247 14.036 5.45722L16.8911 2.60218C15.0833 0.904587 12.6838 -0.0287217 10.1999 0.000673888C6.41892 0.000673888 2.96126 2.13185 1.26367 5.51234L4.58537 8.08813C5.37537 5.71811 7.59106 3.95805 10.1999 3.95805Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_794_20378">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
          <span>Sign In With Google</span>
        </div>
      </PrimaryButton>
      <p className="text-center mt-7 font-medium">
        Have an account?{" "}
        <Link href={paths.auth.signin.getHref()} className="text-accent">
          Sign In
        </Link>
      </p>
      <PrimaryButton
        className="w-full hover:bg-gray-200 mt-30 text-lg bg-transparent border text-accent border-gray-300"
        title="Buy Institutional License"
      />
    </div>
  );
};
