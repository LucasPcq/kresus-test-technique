<script setup lang="ts">
import type { DateValue } from "reka-ui";
import { useI18n } from "vue-i18n";
import { CalendarDays, X } from "lucide-vue-next";

import { TASK_CONTENT_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from "@kresus/contract";

import { formatDateShort, parseLocalDate } from "@/lib/date";
import { PRIORITY_CONFIG } from "../task.constants";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

defineProps<{
  values: { title?: string; content?: string };
  selectedDate: DateValue | undefined;
}>();

const emit = defineEmits<{
  dateSelect: [date: DateValue | undefined];
}>();

const { t, locale } = useI18n();

const dateLabel = (value: string | undefined) => {
  if (!value) return t("taskForm.selectDate");
  return formatDateShort(parseLocalDate(value.slice(0, 10)), locale.value);
};
</script>

<template>
  <FormField v-slot="{ componentField }" name="title">
    <FormItem>
      <div class="flex items-center justify-between">
        <FormLabel>{{ $t("taskForm.title") }} <span class="text-destructive">*</span></FormLabel>
        <span class="text-xs text-muted-foreground">{{ values.title?.length ?? 0 }}/{{ TASK_TITLE_MAX_LENGTH }}</span>
      </div>
      <FormControl>
        <Input :placeholder="$t('taskForm.titlePlaceholder')" :maxlength="TASK_TITLE_MAX_LENGTH" v-bind="componentField" />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>

  <FormField v-slot="{ componentField }" name="content">
    <FormItem>
      <div class="flex items-center justify-between">
        <FormLabel>{{ $t("taskForm.description") }} <span class="text-destructive">*</span></FormLabel>
        <span class="text-xs text-muted-foreground">{{ values.content?.length ?? 0 }}/{{ TASK_CONTENT_MAX_LENGTH }}</span>
      </div>
      <FormControl>
        <Textarea :placeholder="$t('taskForm.descriptionPlaceholder')" :maxlength="TASK_CONTENT_MAX_LENGTH" v-bind="componentField" />
      </FormControl>
      <FormMessage />
    </FormItem>
  </FormField>

  <FormField v-slot="{ componentField }" name="priority">
    <FormItem>
      <FormLabel>{{ $t("taskForm.priority") }} <span class="text-destructive">*</span></FormLabel>
      <Select v-bind="componentField">
        <FormControl>
          <SelectTrigger>
            <SelectValue :placeholder="$t('taskForm.priority')" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem
            v-for="(config, key) in PRIORITY_CONFIG"
            :key="key"
            :value="key"
          >
            {{ $t(config.labelKey) }}
          </SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  </FormField>

  <FormField v-slot="{ value }" name="executionDate">
    <FormItem>
      <FormLabel>{{ $t("taskForm.executionDate") }}</FormLabel>
      <Popover>
        <div class="flex items-center gap-1.5">
          <PopoverTrigger as-child>
            <FormControl>
              <Button variant="outline" class="min-w-0 flex-1 justify-start gap-1.5 font-normal">
                <CalendarDays class="size-4 shrink-0" />
                <span class="truncate">{{ dateLabel(value) }}</span>
              </Button>
            </FormControl>
          </PopoverTrigger>
          <Button
            v-if="value"
            type="button"
            variant="ghost"
            size="icon"
            class="size-9 shrink-0"
            @click="emit('dateSelect', undefined)"
          >
            <X class="size-4" />
          </Button>
        </div>
        <PopoverContent class="w-auto p-0" align="start">
          <!-- @vue-ignore Volar false positive: #private fields in @internationalized/date break structural check on DateValue union -->
          <Calendar
            :model-value="selectedDate"
            @update:model-value="(d) => { if (d) emit('dateSelect', d) }"
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
      <FormLabel class="font-normal">{{ $t("taskForm.completed") }}</FormLabel>
    </FormItem>
  </FormField>
</template>
