<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
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

const { t } = useI18n();

const { handleSubmit, meta } = useForm({ validationSchema: toTypedSchema(registerSchema) });
const { mutate, isPending, error } = useRegister();

const errorMessage = computed(() => {
  if (!error.value) return null;
  if (error.value instanceof ApiError) {
    if (error.value.status === 409) return t("auth.emailAlreadyUsed");
    if (error.value.status === 401) return t("auth.invalidCredentials");
  }
  return t("common.error");
});

const onSubmit = handleSubmit((values) => {
  mutate(values);
});
</script>

<template>
  <AuthLayout>
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">{{ $t("auth.register") }}</CardTitle>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <FormField v-slot="{ componentField }" name="email">
            <FormItem>
              <FormLabel>{{ $t("auth.email") }}</FormLabel>
              <FormControl>
                <Input type="email" :placeholder="$t('auth.emailPlaceholder')" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField v-slot="{ componentField }" name="password">
            <FormItem>
              <FormLabel>{{ $t("auth.password") }}</FormLabel>
              <FormControl>
                <Input type="password" :placeholder="$t('auth.passwordPlaceholder')" v-bind="componentField" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

          <Button type="submit" class="w-full" :disabled="!meta.valid || !meta.dirty || isPending">
            {{ isPending ? $t("auth.registerPending") : $t("auth.registerAction") }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="justify-center text-sm text-muted-foreground">
        {{ $t("auth.alreadyHaveAccount") }}&nbsp;
        <RouterLink to="/login" class="text-primary hover:underline">{{ $t("auth.loginAction") }}</RouterLink>
      </CardFooter>
    </Card>
  </AuthLayout>
</template>
