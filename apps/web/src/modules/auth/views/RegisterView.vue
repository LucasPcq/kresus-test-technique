<script setup lang="ts">
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { RouterLink } from "vue-router";

import { registerSchema } from "@kresus/contract";

import { ApiError } from "@/api/client";

import { useRegister } from "../composables/useAuth";

import AuthLayout from "../components/AuthLayout.vue";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const { handleSubmit, meta } = useForm({ validationSchema: toTypedSchema(registerSchema) });
const { mutate, isPending, error } = useRegister();

const errorMessage = computed(() => {
  if (!error.value) return null;
  if (error.value instanceof ApiError) {
    if (error.value.status === 409) return "Cet email est déjà utilisé";
    if (error.value.status === 401) return "Identifiants incorrects";
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
        <CardTitle class="text-2xl">Créer un compte</CardTitle>
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
            {{ isPending ? "Inscription..." : "S'inscrire" }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="justify-center text-sm text-muted-foreground">
        Déjà un compte ?&nbsp;
        <RouterLink to="/login" class="text-primary hover:underline">Se connecter</RouterLink>
      </CardFooter>
    </Card>
  </AuthLayout>
</template>
