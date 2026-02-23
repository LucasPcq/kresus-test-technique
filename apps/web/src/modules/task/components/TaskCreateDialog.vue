<script setup lang="ts">
import { computed, ref } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

import {
  PRIORITY,
  TASK_CONTENT_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
  taskBaseSchema,
} from "@kresus/contract";

import type { DateValue } from "reka-ui";
import { CalendarDays } from "lucide-vue-next";

import { ApiError } from "@/api/client";
import { formatDateShort, parseLocalDate } from "@/lib/date";

import { useCreateTask } from "../composables/useCreateTask";
import { PRIORITY_CONFIG } from "../task.constants";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const open = defineModel<boolean>("open", { required: true });

const formSchema = taskBaseSchema.extend({
  completed: z.boolean().optional(),
});

const { handleSubmit, resetForm, setFieldValue, meta, values } = useForm({
  validationSchema: toTypedSchema(formSchema),
  initialValues: {
    title: "",
    content: "",
    priority: PRIORITY.MEDIUM,
  },
});

const { mutate, isPending, error } = useCreateTask();

const errorMessage = computed(() => {
  if (!error.value) return null;
  if (error.value instanceof ApiError && error.value.status === 400) {
    return "Données invalides. Vérifiez les champs du formulaire.";
  }
  return "Une erreur est survenue lors de la création.";
});

const isSubmitDisabled = computed(() => isPending.value || !meta.value.valid || !meta.value.dirty);

const selectedDate = ref<DateValue>();

const dateLabel = (value: string | undefined) => {
  if (!value) return "Sélectionner une date";
  return formatDateShort(parseLocalDate(value.slice(0, 10)));
};

const onDateSelect = (date: DateValue) => {
  selectedDate.value = date;
  setFieldValue("executionDate", `${date.toString()}T00:00:00.000Z`);
};

const close = () => {
  resetForm();
  selectedDate.value = undefined;
  open.value = false;
};

const onSubmit = handleSubmit((values) => {
  mutate(values, {
    onSuccess: () => close(),
  });
});
</script>

<template>
  <Dialog v-model:open="open" @update:open="(v) => { if (!v) close() }">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Nouvelle tâche</DialogTitle>
        <DialogDescription>Remplissez les informations pour créer une nouvelle tâche.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="title">
          <FormItem>
            <div class="flex items-center justify-between">
              <FormLabel>Titre <span class="text-destructive">*</span></FormLabel>
              <span class="text-xs text-muted-foreground">{{ values.title?.length ?? 0 }}/{{ TASK_TITLE_MAX_LENGTH }}</span>
            </div>
            <FormControl>
              <Input placeholder="Titre de la tâche" :maxlength="TASK_TITLE_MAX_LENGTH" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="content">
          <FormItem>
            <div class="flex items-center justify-between">
              <FormLabel>Description <span class="text-destructive">*</span></FormLabel>
              <span class="text-xs text-muted-foreground">{{ values.content?.length ?? 0 }}/{{ TASK_CONTENT_MAX_LENGTH }}</span>
            </div>
            <FormControl>
              <Textarea placeholder="Description de la tâche" :maxlength="TASK_CONTENT_MAX_LENGTH" v-bind="componentField" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="priority">
          <FormItem>
            <FormLabel>Priorité <span class="text-destructive">*</span></FormLabel>
            <Select v-bind="componentField">
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Priorité" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem
                  v-for="(config, key) in PRIORITY_CONFIG"
                  :key="key"
                  :value="key"
                >
                  {{ config.label }}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value }" name="executionDate">
          <FormItem>
            <FormLabel>Date d'exécution</FormLabel>
            <Popover>
              <PopoverTrigger as-child>
                <FormControl>
                  <Button variant="outline" class="w-full justify-start gap-1.5 font-normal">
                    <CalendarDays class="size-4" />
                    {{ dateLabel(value) }}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" align="start">
                <!-- @vue-ignore Volar false positive: #private fields in @internationalized/date break structural check on DateValue union -->
                <Calendar
                  :model-value="selectedDate"
                  @update:model-value="onDateSelect"
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="completed">
          <FormItem class="flex items-center gap-2 space-y-0">
            <FormControl>
              <Checkbox :model-value="value" @update:model-value="handleChange" />
            </FormControl>
            <FormLabel class="font-normal">Tâche complétée</FormLabel>
          </FormItem>
        </FormField>

        <p v-if="errorMessage" class="text-sm text-destructive">{{ errorMessage }}</p>

        <DialogFooter>
          <Button type="button" variant="outline" @click="close">
            Annuler
          </Button>
          <Button type="submit" :disabled="isSubmitDisabled">
            {{ isPending ? "Création…" : "Créer" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
