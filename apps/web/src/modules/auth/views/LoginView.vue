<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
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

const { t } = useI18n();

const { handleSubmit, meta } = useForm({ validationSchema: toTypedSchema(loginSchema) });
const { mutate, isPending, error } = useLogin();

const errorMessage = computed(() => {
  if (!error.value) return null;
  if (error.value instanceof ApiError) {
    if (error.value.status === 401) return t("auth.invalidCredentials");
    if (error.value.status === 409) return t("auth.emailAlreadyUsed");
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
        <CardTitle class="text-2xl">{{ $t("auth.login") }}</CardTitle>
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
            {{ isPending ? $t("auth.loginPending") : $t("auth.loginAction") }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="justify-center text-sm text-muted-foreground">
        {{ $t("auth.noAccountYet") }}&nbsp;
        <RouterLink to="/register" class="text-primary hover:underline">{{ $t("auth.registerAction") }}</RouterLink>
      </CardFooter>
    </Card>
  </AuthLayout>
</template>
