<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ startingCount: number }>();

const count = ref(props.startingCount || 0);
</script>

<template>
  <button type="button" @click="count++">count is {{ count }}</button>
</template>
