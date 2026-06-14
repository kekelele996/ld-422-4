<template>
  <div class="project-manage">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>项目列表</span>
              <el-button type="primary" size="small" @click="loadProjects">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <el-table
            :data="projectStore.items"
            height="500"
            highlight-current-row
            @current-change="handleProjectSelect"
            style="width: 100%"
          >
            <el-table-column prop="projectNo" label="项目编号" width="140" />
            <el-table-column prop="name" label="项目名称" min-width="160" show-overflow-tooltip />
            <el-table-column label="状态" width="90">
              <template #default="{ row }">
                <StatusBadge :value="row.status" />
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card v-loading="loadingMembers">
          <template #header>
            <div class="card-header">
              <span>
                成员管理
                <el-tag v-if="selectedProject" type="info" style="margin-left: 8px">
                  {{ selectedProject.name }}
                </el-tag>
              </span>
              <div>
                <el-button
                  type="primary"
                  size="small"
                  :disabled="!selectedProject || !isLeader"
                  @click="openAddDialog"
                >
                  <el-icon><Plus /></el-icon>
                  添加成员
                </el-button>
                <el-button
                  size="small"
                  :disabled="!selectedProject"
                  style="margin-left: 8px"
                  @click="loadMembers"
                >
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
              </div>
            </div>
          </template>

          <EmptyState v-if="!selectedProject" description="请从左侧选择一个项目" />

          <template v-else>
            <el-alert
              v-if="!isLeader"
              type="warning"
              :closable="false"
              show-icon
              style="margin-bottom: 16px"
            >
              当前用户不是项目负责人，仅可查看成员，无法进行维护操作。
            </el-alert>

            <el-table :data="memberStore.items" style="width: 100%" empty-text="暂无成员">
              <el-table-column label="成员姓名" min-width="120">
                <template #default="{ row }">
                  <span>{{ row.user?.name ?? "-" }}</span>
                </template>
              </el-table-column>
              <el-table-column label="系统角色" width="120">
                <template #default="{ row }">
                  <el-tag size="small">{{ row.user?.role ?? "-" }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="项目角色" width="180">
                <template #default="{ row }">
                  <el-select
                    v-model="row.role"
                    size="small"
                    :disabled="!isLeader"
                    style="width: 140px"
                    @change="(val) => handleRoleChange(row, val)"
                  >
                    <el-option label="PI" value="PI" />
                    <el-option label="SubPI" value="SubPI" />
                    <el-option label="Researcher" value="Researcher" />
                    <el-option label="Student" value="Student" />
                    <el-option label="Assistant" value="Assistant" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column prop="joinedAt" label="加入日期" width="130" />
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="danger"
                    link
                    size="small"
                    :disabled="!isLeader"
                    @click="handleRemove(row)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="addDialogVisible" title="添加项目成员" width="480px">
      <el-form :model="addForm" label-width="90px">
        <el-form-item label="选择用户">
          <el-select v-model="addForm.userId" placeholder="请选择用户" style="width: 100%" filterable>
            <el-option
              v-for="user in availableUsers"
              :key="user.id"
              :label="`${user.name}（${user.role}）`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="项目角色">
          <el-select v-model="addForm.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="PI" value="PI" />
            <el-option label="SubPI" value="SubPI" />
            <el-option label="Researcher" value="Researcher" />
            <el-option label="Student" value="Student" />
            <el-option label="Assistant" value="Assistant" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="adding" @click="confirmAdd">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh } from "@element-plus/icons-vue";
import { useProjectStore } from "../stores/projectStore";
import { useMemberStore } from "../stores/memberStore";
import StatusBadge from "../components/common/StatusBadge.vue";
import EmptyState from "../components/common/EmptyState.vue";
import type { ResearchProject } from "../types/project";
import type { ProjectMemberRole, ProjectMemberWithUser } from "../types/member";
import type { User } from "../types";

const projectStore = useProjectStore();
const memberStore = useMemberStore();

const selectedProject = ref<ResearchProject | null>(null);
const loadingMembers = ref(false);
const adding = ref(false);
const addDialogVisible = ref(false);
const addForm = reactive({ userId: "", role: "Researcher" as ProjectMemberRole });

const currentUserId = "u-pi";

const isLeader = computed(() => {
  if (!selectedProject.value) return false;
  return selectedProject.value.leaderId === currentUserId;
});

const availableUsers = computed<User[]>(() => {
  const existingIds = new Set(memberStore.items.map((m) => m.userId));
  return memberStore.users.filter((u) => !existingIds.has(u.id));
});

async function loadProjects() {
  await projectStore.load();
}

async function loadMembers() {
  if (!selectedProject.value) return;
  loadingMembers.value = true;
  try {
    await memberStore.load(selectedProject.value.id);
  } finally {
    loadingMembers.value = false;
  }
}

async function handleProjectSelect(row: ResearchProject | null) {
  selectedProject.value = row;
  if (row) {
    await memberStore.loadUsers();
    await loadMembers();
  } else {
    memberStore.items = [];
  }
}

function openAddDialog() {
  addForm.userId = "";
  addForm.role = "Researcher";
  addDialogVisible.value = true;
}

async function confirmAdd() {
  if (!addForm.userId) {
    ElMessage.warning("请选择用户");
    return;
  }
  if (!selectedProject.value) return;
  adding.value = true;
  try {
    await memberStore.add(selectedProject.value.id, addForm.userId, addForm.role);
    ElMessage.success("添加成功");
    addDialogVisible.value = false;
    await projectStore.load();
  } catch (e) {
    ElMessage.error((e as Error).message ?? "添加失败");
  } finally {
    adding.value = false;
  }
}

async function handleRoleChange(row: ProjectMemberWithUser, newRole: ProjectMemberRole) {
  try {
    await memberStore.updateRole(row.id, newRole);
    ElMessage.success("角色已更新");
    await projectStore.load();
  } catch (e) {
    ElMessage.error((e as Error).message ?? "更新失败");
    await loadMembers();
  }
}

async function handleRemove(row: ProjectMemberWithUser) {
  try {
    await ElMessageBox.confirm(
      `确定要将「${row.user?.name ?? "该成员"}」从项目中移除吗？`,
      "移除成员",
      { type: "warning" }
    );
    await memberStore.remove(row.id);
    ElMessage.success("已移除");
    await projectStore.load();
  } catch (e) {
    if ((e as { action?: string }).action !== "cancel") {
      ElMessage.error((e as Error).message ?? "移除失败");
    }
  }
}

onMounted(async () => {
  await loadProjects();
  await memberStore.loadUsers();
  if (projectStore.items.length > 0) {
    selectedProject.value = projectStore.items[0];
    await loadMembers();
  }
});
</script>

<style scoped>
.project-manage {
  padding: 16px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
