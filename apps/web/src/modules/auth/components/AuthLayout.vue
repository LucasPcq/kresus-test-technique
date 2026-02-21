<template>
  <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
    <div class="hidden lg:flex flex-col justify-center items-center bg-primary text-primary-foreground p-12 gap-4">
      <h1 class="text-4xl font-bold">Kresus Tasks</h1>
    </div>
    <div class="flex flex-col justify-center items-center p-8">
      <div class="w-full max-w-sm">
        <slot />
      </div>
    </div>
  </div>
</template>
