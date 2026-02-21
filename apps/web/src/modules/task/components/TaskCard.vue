<script setup lang="ts">
import { computed } from "vue";
import { CalendarDays, CheckCircle2, Circle } from "lucide-vue-next";

import type { TaskResponse } from "@kresus/contract";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateShort } from "@/lib/date";

import { CONTENT_MAX_LENGTH, PRIORITY_CONFIG } from "../task.constants";

const props = defineProps<{ task: TaskResponse }>();

const priorityConfig = computed(() => PRIORITY_CONFIG[props.task.priority]);

const isCompleted = computed(() => !!props.task.completedAt);

const formattedDate = computed(() => {
  if (!props.task.executionDate) return null;
  return formatDateShort(new Date(props.task.executionDate));
});

const truncatedContent = computed(() => {
  if (props.task.content.length <= CONTENT_MAX_LENGTH) return props.task.content;
  return `${props.task.content.slice(0, CONTENT_MAX_LENGTH)}…`;
});
</script>

<template>
  <Card
    :class="[
      'flex flex-col transition-colors',
      isCompleted && 'opacity-60',
    ]"
  >
    <CardHeader class="flex-row items-start justify-between gap-2 space-y-0">
      <div class="flex items-center gap-2 min-w-0">
        <component
          :is="isCompleted ? CheckCircle2 : Circle"
          :class="[
            'size-5 shrink-0',
            isCompleted ? 'text-green-500' : 'text-muted-foreground',
          ]"
        />
        <CardTitle class="text-base truncate">{{ task.title }}</CardTitle>
      </div>
      <Badge :variant="priorityConfig.variant">{{ priorityConfig.label }}</Badge>
    </CardHeader>
    <CardContent>
      <p class="text-sm text-muted-foreground">{{ truncatedContent }}</p>
    </CardContent>
    <CardFooter v-if="formattedDate" class="mt-auto text-xs text-muted-foreground gap-1">
      <CalendarDays class="size-3.5" />
      {{ formattedDate }}
    </CardFooter>
  </Card>
</template>
