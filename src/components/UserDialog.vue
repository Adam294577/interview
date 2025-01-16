<script setup lang="ts">
import { ref } from 'vue';
const isShow = defineModel('show');
const EditNameRef = defineModel('EditNameRef');
const EditAgeRef = defineModel('EditAgeRef');
const data = defineModel();
const props = defineProps<{
  rules: {
    name: string[];
    age: string[];
  };
}>();
const emit = defineEmits(['update']);
</script>
<template>
  <q-dialog v-model="isShow">
    <q-card>
      <q-card-section style="width: 300px">
        <div class="q-mb-xl">
          <q-input
            ref="EditNameRef"
            :rules="props.rules.name"
            v-model.trim="data.name"
            label="姓名"
          />
          <q-input
            ref="EditAgeRef"
            :rules="props.rules.age"
            v-model.number="data.age"
            label="年齡"
          />
          <q-btn color="primary" class="q-mt-md" @click="emit('update')"
            >更新</q-btn
          >
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
