<script setup lang="ts">
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { RouterLink } from "vue-router";

import { loginSchema } from "@kresus/contract";

import { ApiError } from "@/api/client";

import { useLogin } from "../composables/useAuth";

import AuthLayout from "../components/AuthLayout.vue";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const { handleSubmit, meta } = useForm({ validationSchema: toTypedSchema(loginSchema) });
const { mutate, isPending, error } = useLogin();

const errorMessage = computed(() => {
  if (!error.value) return null;
  if (error.value instanceof ApiError) {
    if (error.value.status === 401) return "Identifiants incorrects";
    if (error.value.status === 409) return "Cet email est déjà utilisé";
    if (error.value.status === 429) return "Trop de tentatives. Veuillez réessayer dans quelques instants.";
  }
  return "Une erreur est survenue";
});

const onSubmit = handleSubmit((values) => {
  mutate(values);
});
</script>

<template>
  <AuthLayout>
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">Connexion</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="vous@exemple.com" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>Mot de passe</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

          <Button type="submit" class="w-full" :disabled="!meta.valid || !meta.dirty || isPending">
            {{ isPending ? "Connexion..." : "Se connecter" }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="justify-center text-sm text-muted-foreground">
        Pas encore de compte ?&nbsp;
        <RouterLink to="/register" class="text-primary hover:underline">S'inscrire</RouterLink>
      </CardFooter>
    </Card>
  </AuthLayout>
</template>
