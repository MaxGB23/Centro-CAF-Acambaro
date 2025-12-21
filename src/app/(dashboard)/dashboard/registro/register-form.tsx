"use client";

import { cn } from "@/lib/utils"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import z from "zod"
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { passwordSchema } from "@/lib/validation"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner"
import { LoadingButton } from "@/components/loading-button"
import { erroresES } from "@/lib/auth-errors";


const signUpSchema = z
  .object({
    name: z.string().min(1, { message: "El nombre es obligatorio" }),
    email: z.email({ message: "Por favor ingresa un correo válido" }),
    password: passwordSchema,
    passwordConfirmation: z
      .string()
      .min(1, { message: "Por favor confirma la contraseña" }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Las contraseñas no coinciden",
    path: ["passwordConfirmation"],
  });

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignupForm({ className, ...props }: React.ComponentProps<"form">) {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });

  async function onSubmit(values: SignUpValues) {
    setError(null);

    const { error } = await authClient.signUp.email({
      email: values.email,
      password: values.password,
      name: values.name,
    });
    if (error?.code) {
      toast.error("Por favor intenta de nuevo.");
      setError(erroresES[error.code] || "Por favor intenta de nuevo.");
    } else {
      toast.success("Usuario registrado con éxito!");
      router.push("/dashboard");
    }
  }

  const loading = form.formState.isSubmitting;




  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold">Registrar Usuario</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Llena el siguiente formulario para crear un usuario
          </p>



        </div>
        {/* <FieldSeparator>Llena el siguiente formulario</FieldSeparator> */}

        {/* NOMBRE */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input {...field} id="name" placeholder="Ingresa tu nombre" />
              {fieldState.error ? (
                <FieldError className="pl-1" errors={[fieldState.error]} />
              ) : (
                <FieldDescription className="pl-1">
                  Nombre y apellido
                </FieldDescription>
              )}
            </Field>
          )}
        />

        {/* EMAIL */}
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="email">Correo Electrónico</FieldLabel>
              <Input {...field} id="email" type="email" placeholder="Ingresa tu correo" />

              {fieldState.error ? (
                <FieldError className="pl-1" errors={[fieldState.error]} />
              ) : (
                <FieldDescription className="pl-1">
                  Usaremos esto para identificarte
                </FieldDescription>
              )}
            </Field>
          )}
        />

        {/* PASSWORD */}
        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="password">Contraseña</FieldLabel>
              <Input {...field} id="password" type="password" placeholder="Ingresa tu contraseña" />
              {fieldState.error ? (
                <FieldError className="pl-1" errors={[fieldState.error]} />
              ) : (
                <FieldDescription className="pl-1">
                  8 caracteres y un símbolo
                </FieldDescription>
              )}
            </Field>
          )}
        />

        {/* CONFIRM PASSWORD */}
        <Controller
          name="passwordConfirmation"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="passwordConfirmation">Confirmar Contraseña</FieldLabel>
              <Input
                {...field}
                id="passwordConfirmation"
                type="password"
                placeholder="Confirma tu contraseña"
              />
              {fieldState.error ? (
                <FieldError className="pl-1" errors={[fieldState.error]} />
              ) : (
                <FieldDescription className="pl-1">
                  Debe coincidir con la contraseña
                </FieldDescription>
              )}
            </Field>
          )}
        />
        {/* ERROR GLOBAL */}
        {error && (
          <div role="alert" className="text-sm text-center w-full bg-red-50 p-2 dark:bg-red-950 text-red-600 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}
        {/* BOTONES */}
        <Field>
          <LoadingButton type="submit" className="w-full" loading={loading}>
            Crear cuenta
          </LoadingButton>
        </Field>

        <FieldSeparator>Loviu</FieldSeparator>


      </FieldGroup>
    </form>
  );
}