<template>
  <div class="flex items-center gap-2 px-4 py-2 border-b shrink-0" style="border-color: var(--color-border); background: var(--color-bg-sidebar)">
    <svg width="16" height="22" viewBox="396 268 270 370" xmlns="http://www.w3.org/2000/svg" style="color: var(--color-brand)" fill="currentColor" aria-label="Slate">
      <path d="m 444.21875,272.89844 c -23.66569,0 -42.7168,19.05306 -42.7168,42.71875 v 46.70703 c 4.07661,-11.21607 10.67714,-20.62586 19.80274,-28.23047 16.4937,-13.74485 40.20324,-20.61719 71.1289,-20.61719 14.08831,0 28.57858,1.08738 43.46875,3.26367 14.89017,2.06174 30.29585,5.2112 46.2168,9.44922 v 54.29297 c -14.08831,-6.29976 -27.83318,-11.05466 -41.23437,-14.26172 -13.401,-3.20706 -26.05849,-4.81054 -37.97071,-4.81054 -15.80638,0 -27.48919,2.17691 -35.04883,6.52929 -7.55963,4.35258 -11.33984,11.11027 -11.33984,20.27344 0,6.87233 2.52085,12.25602 7.56055,16.15039 5.15424,3.77981 14.43084,7.04392 27.83203,9.79297 l 28.17773,5.66992 c 28.52027,5.72682 48.79355,14.43213 60.82032,26.11524 12.02657,11.68311 18.03906,28.29083 18.03906,49.82421 0,28.29138 -8.41851,49.36736 -25.25586,63.22657 -16.72281,13.74465 -42.32245,20.61718 -76.79883,20.61718 -16.2646,0 -32.5857,-1.54615 -48.96484,-4.63867 -15.4158,-2.91062 -30.83225,-7.1407 -46.24805,-12.68945 2.02031,21.75958 20.22655,38.68359 42.53125,38.68359 h 264.07227 c 23.66569,0 42.71875,-19.05306 42.71875,-42.71875 v -242.6289 c 0,-23.66569 -19.05306,-42.71875 -42.71875,-42.71875 z m -42.7168,148.93359 v 84.97461 c 15.41649,8.00446 30.32088,14.11722 44.71485,18.33789 15.34818,4.35257 30.12507,6.5293 44.32812,6.5293 14.43197,0 25.48403,-2.40426 33.1582,-7.21485 7.674,-4.81078 11.51172,-11.68508 11.51172,-20.61914 0,-8.01784 -2.6355,-14.2023 -7.90429,-18.55468 -5.15425,-4.35258 -15.51842,-8.24743 -31.09571,-11.6836 l -25.60156,-5.66992 c -25.65687,-5.4979 -44.4413,-14.25858 -56.35351,-26.28516 -5.566,-5.67417 -9.81783,-12.27912 -12.75782,-19.81445 z" />
    </svg>
    <div class="flex-1" />
    <ThemePicker />
    <button
      class="flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-colors"
      style="background: var(--color-bg-elevated); color: var(--color-text-muted)"
      @click="$emit('search')"
      title="Search (press /)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      Search
      <kbd class="ml-1 px-1 rounded text-xs" style="background: var(--color-border)">/</kbd>
    </button>
    <button
      class="flex items-center gap-1 px-3 py-1.5 rounded text-xs transition-colors"
      style="background: var(--color-brand); color: #1e1e2e"
      @click="$emit('new-note')"
      title="New Note (Ctrl+Alt+N)"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
      New Note
    </button>
  </div>
</template>

<script setup>
import ThemePicker from "./ThemePicker.vue";
defineEmits(["search", "new-note"]);
</script>
