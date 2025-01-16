<template>
  <q-page class="row q-pt-xl">
    <div class="full-width q-px-xl">
      <div class="q-mb-xl">
        <q-input
          ref="NameRef"
          :rules="rules.name"
          v-model.trim="CreateTempData.name"
          label="姓名"
        />
        <q-input
          ref="AgeRef"
          :rules="rules.age"
          v-model.number="CreateTempData.age"
          label="年齡"
        />
        <q-btn color="primary" class="q-mt-md" @click="handleAdd">新增</q-btn>
      </div>

      <q-table
        flat
        bordered
        ref="tableRef"
        :rows="blockData"
        :columns="(tableConfig as QTableProps['columns'])"
        row-key="id"
        hide-pagination
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
            <q-th></q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              style="min-width: 120px"
            >
              <div>{{ col.value }}</div>
            </q-td>
            <q-td class="text-right" auto-width v-if="tableButtons.length > 0">
              <q-btn
                @click="handleClickOption(btn, props.row)"
                v-for="(btn, index) in tableButtons"
                :key="index"
                size="sm"
                color="grey-6"
                round
                dense
                :icon="btn.icon"
                class="q-ml-md"
                padding="5px 5px"
              >
                <q-tooltip
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
        <template v-slot:no-data="{ icon }">
          <div
            class="full-width row flex-center items-center text-primary q-gutter-sm"
            style="font-size: 18px"
          >
            <q-icon size="2em" :name="icon" />
            <span> 無相關資料 </span>
          </div>
        </template>
      </q-table>
    </div>
    <UserDialog
      v-if="EditShow"
      v-model:show="EditShow"
      v-model:EditNameRef="EditNameRef"
      v-model:EditAgeRef="EditAgeRef"
      v-model="EditTempData"
      :rules="rules"
      @update="handleEdit"
    />
  </q-page>
</template>

<script setup lang="ts">
import { QTableProps } from 'quasar';
import { ref, onMounted, nextTick } from 'vue';
import { FetchUserList } from 'boot/api/Userlist';
import { useQuasar } from 'quasar';
import UserDialog from 'components/UserDialog.vue';
interface btnType {
  label: string;
  icon: string;
  status: string;
}
interface Userlist {
  id: string; // 主鍵
  name: string; // 姓名
  age: number; // 年齡
}
const $q = useQuasar();
// console.log('$q', $q);

const blockData = ref<Userlist[]>([]);

const tableConfig = ref([
  {
    label: '姓名',
    name: 'name',
    field: 'name',
    align: 'left',
  },
  {
    label: '年齡',
    name: 'age',
    field: 'age',
    align: 'left',
  },
]);

const tableButtons = ref<btnType[]>([
  {
    label: '編輯',
    icon: 'edit',
    status: 'edit',
  },
  {
    label: '刪除',
    icon: 'delete',
    status: 'delete',
  },
]);

const CreateTempData = ref({
  name: '',
  age: '',
});
const EditTempData = ref({
  name: '',
  age: '',
});
const EditShow = ref(false);

async function fetchData() {
  try {
    const { data } = await FetchUserList.getList();
    await nextTick();
    blockData.value = data;
  } catch (error) {
    console.error('獲取資料失敗:', error);
  }
}
const NameRef = ref<HTMLInputElement | null>(null);
const AgeRef = ref<HTMLInputElement | null>(null);
const EditNameRef = ref<HTMLInputElement | null>(null);
const EditAgeRef = ref<HTMLInputElement | null>(null);
const rules = {
  name: [(val: string) => !!val || '請輸入姓名'],
  age: [
    (val: number) => !!val || '請輸入年齡',
    (val: number) => val > 0 || '請輸入正整數',
  ],
};
const checkInput = () => {
  if (EditShow.value) {
    if (!EditNameRef.value.validate()) return false;
    if (!EditAgeRef.value.validate()) return false;
  } else {
    if (!NameRef.value.validate()) return false;
    if (!AgeRef.value.validate()) return false;
  }
  return true;
};

const ResetInput = async (TempRef) => {
  TempRef.value = { name: '', age: '' };
  await nextTick();
  if (!EditShow.value) {
    NameRef.value.resetValidation();
    AgeRef.value.resetValidation();
  }
};
async function handleAdd() {
  if (!checkInput()) return;
  try {
    await FetchUserList.create(CreateTempData.value);
    $q.notify({
      position: 'top',
      type: 'positive',
      message: '新增成功',
    });
    ResetInput(CreateTempData);
    fetchData();
  } catch (error) {
    console.error('新增失敗:', error);
  }
}
async function handleEdit() {
  if (!checkInput()) return;
  try {
    await FetchUserList.update(EditTempData.value);
    $q.notify({
      position: 'top',
      type: 'positive',
      message: '更新成功',
    });
    ResetInput(EditTempData);
    EditShow.value = false;
    fetchData();
  } catch (error) {
    console.error('更新失敗:', error);
  }
}

async function handleClickOption(btn: btnType, row: Userlist) {
  if (btn.status === 'edit') {
    EditShow.value = true;
    EditTempData.value = { ...row };
  } else if (btn.status === 'delete') {
    try {
      $q.dialog({
        title: '確認刪除',
        message: '確定要刪除此筆資料嗎？',
        cancel: true,
        persistent: true,
      }).onOk(async () => {
        await FetchUserList.delete(row.id);
        $q.notify({
          position: 'top',
          type: 'positive',
          message: '刪除成功',
        });
        fetchData();
      });
    } catch (error) {
      $q.notify({
        position: 'top',
        type: 'negative',
        message: '刪除失敗',
      });
      console.error('刪除失敗:', error);
    }
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.q-table th {
  font-size: 20px;
  font-weight: bold;
}

.q-table tbody td {
  font-size: 18px;
}
</style>
