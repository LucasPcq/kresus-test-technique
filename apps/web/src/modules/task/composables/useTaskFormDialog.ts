import { type Ref, computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";

import type { DateValue } from "reka-ui";

import { taskBaseSchema } from "@kresus/contract";

import { parseIsoToCalendarDate } from "@/lib/date";

import { ApiError } from "@/api/client";

// Override completed to strip .default(false) — @vee-validate/zod can't handle Zod 4's default() internals
const formSchema = toTypedSchema(taskBaseSchema.extend({ completed: z.boolean().optional() }));

export const useTaskFormDialog = ({
  initialValues,
  error,
  isPending,
}: {
  initialValues: z.infer<typeof taskBaseSchema>;
  error: Ref<Error | null>;
  isPending: Ref<boolean>;
}) => {
  const { t } = useI18n();
  const { handleSubmit, resetForm, setFieldValue, meta, values } = useForm({
    validationSchema: formSchema,
    initialValues,
  });

  const executionDate = initialValues.executionDate;

  const selectedDate = ref<DateValue | undefined>(
    typeof executionDate === "string"
      ? parseIsoToCalendarDate(executionDate.slice(0, 10))
      : undefined,
  );

  const errorMessage = computed(() => {
    if (!error.value) return null;
    if (error.value instanceof ApiError && error.value.status === 400)
      return t("taskDialog.invalidData");
    return t("taskDialog.genericError");
  });

  const isSubmitDisabled = computed(
    () => isPending.value || !meta.value.valid || !meta.value.dirty,
  );

  const onDateSelect = (date: DateValue | undefined) => {
    selectedDate.value = date;
    setFieldValue("executionDate", date ? `${date.toString()}T00:00:00.000Z` : undefined);
  };

  return {
    handleSubmit,
    resetForm,
    values,
    selectedDate,
    errorMessage,
    isSubmitDisabled,
    onDateSelect,
  };
};
