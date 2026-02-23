import { computed, reactive, ref } from "vue";

export function useTaskSelection() {
  const selectionMode = ref(false);
  const selectedIds = reactive(new Set<string>());

  const selectedCount = computed(() => selectedIds.size);

  const toggleSelectionMode = () => {
    selectionMode.value = !selectionMode.value;
    selectedIds.clear();
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else {
      selectedIds.add(id);
    }
  };

  const resetSelection = () => {
    selectedIds.clear();
    selectionMode.value = false;
  };

  return { selectionMode, selectedIds, selectedCount, toggleSelectionMode, toggleSelect, resetSelection };
}
