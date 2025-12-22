

import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
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
import { Link, useNavigate } from "@tanstack/react-router";
import { Checkbox } from "@/components/ui/checkbox";

const signinSchema = z.object({
  email: z.string().email("Please enter a valid email address."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(50, "Password must be at most 50 characters.")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
  rememberMe: z.boolean().default(false),
});

export const SigninForm = () => {
  const navigate = useNavigate();
  const [seePassword, setSeePassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onSubmit: signinSchema,
    },
    onSubmit: async ({ value }) => {
      // Do something with the form values.
      console.log(value);
      // TODO: Call your login API here
      // await loginUser(value);

      // Navigate to homepage
      navigate({ to: "/" });
    },
  });

  return (
    <div className="w-full">
      <form
        className="w-full"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup className="w-full">
          {/* Email Field */}
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="form-email">Email Address</FieldLabel>
                  <InputField
                    id="form-email"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="sample@email.com"
                    type="email"
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          {/* Password Field */}
          <form.Field
            name="password"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="form-password">Password</FieldLabel>
                  <InputGroup className="rounded-4xl h-14">
                    <InputGroupInput
                      id="form-password"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type={seePassword ? "text" : "password"}
                      placeholder="••••••••"
                      aria-invalid={isInvalid}
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />

          <div className="flex items-center justify-between">
            <form.Field
              name="rememberMe"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field orientation="horizontal" data-invalid={isInvalid}>
                    <Checkbox
                      id="form-remember-me"
                      name={field.name}
                      aria-invalid={isInvalid}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />
                    <FieldLabel
                      htmlFor="form-remember-me"
                      className="font-medium text-[#344054] text-sm"
                    >
                      Remember for 30 days
                    </FieldLabel>
                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  </Field>
                );
              }}
            />
            <Link
              className="text-sm font-semibold text-accent shrink-0"
              to="#"
            >
              Forgot Password?
            </Link>
          </div>
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
        Dont have an account?{" "}
        <Link to="/register" className="text-accent">
          Sign Up
        </Link>
      </p>
    </div>
  );
};
