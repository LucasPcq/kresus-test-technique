<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
</script>

<template>
  <Card>
    <CardHeader class="flex-row items-start justify-between gap-2 space-y-0">
      <div class="flex items-center gap-2">
        <Skeleton class="size-5 rounded-full" />
        <Skeleton class="h-5 w-40" />
      </div>
      <Skeleton class="h-5 w-16 rounded-full" />
    </CardHeader>
    <CardContent>
      <Skeleton class="h-4 w-full" />
      <Skeleton class="mt-1 h-4 w-3/4" />
    </CardContent>
    <CardFooter>
      <Skeleton class="h-3.5 w-24" />
    </CardFooter>
  </Card>
</template>
