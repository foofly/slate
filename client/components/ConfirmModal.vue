<template>
  <Teleport to="body">
    <div class="fixed inset-0 flex items-center justify-center z-50" style="background: rgba(0,0,0,0.5)" @click.self="$emit('cancel')">
      <div class="rounded-lg p-6 shadow-xl w-80" style="background: var(--color-bg-elevated); border: 1px solid var(--color-border)">
        <p class="text-sm mb-5" style="color: var(--color-text)">{{ message }}</p>
        <div class="flex justify-end gap-2">
          <button
            class="px-3 py-1.5 rounded text-sm transition-colors"
            style="background: var(--color-bg); color: var(--color-text-muted)"
            @click="$emit('cancel')"
          >Cancel</button>
          <button
            class="px-3 py-1.5 rounded text-sm transition-colors"
            style="background: #f38ba8; color: #1e1e2e"
            @click="$emit('confirm')"
          >{{ confirmLabel }}</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  message: { type: String, default: "Are you sure?" },
  confirmLabel: { type: String, default: "Confirm" },
});
defineEmits(["confirm", "cancel"]);
</script>
