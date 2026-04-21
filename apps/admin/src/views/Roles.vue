<template>
  <div class="roles-container">
    <el-card class="roles-card">
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAddRole">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </template>
      <div class="roles-table">
        <el-table :data="roles" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="name" label="角色名称"></el-table-column>
          <el-table-column prop="description" label="角色描述"></el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" link @click="handleEditRole(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDeleteRole(scope.row.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="roles-pagination">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="roleForm" :rules="rules" ref="roleFormRef">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" placeholder="请输入角色描述"></el-input>
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
            v-model="roleForm.permissions"
            :data="permissionTree"
            show-checkbox
            node-key="id"
            default-expand-all
          ></el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import * as roleApi from '../api/role'
import * as permissionApi from '../api/permission'

const roles = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const isEdit = ref(false)
const roleForm = reactive({
  id: '',
  name: '',
  description: '',
  permissions: []
})

const rules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

const roleFormRef = ref(null)
const permissionTree = ref([])

onMounted(() => {
  fetchRoles()
  fetchPermissionTree()
})

const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await roleApi.getRoles({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    roles.value = response.data || [
      { id: 1, name: '管理员', description: '系统管理员', createdAt: '2026-01-01 00:00:00' },
      { id: 2, name: '普通用户', description: '普通用户', createdAt: '2026-01-02 00:00:00' },
      { id: 3, name: '运营人员', description: '运营人员', createdAt: '2026-01-03 00:00:00' }
    ]
    total.value = response.total || roles.value.length
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchPermissionTree = async () => {
  try {
    const response = await permissionApi.getPermissionTree()
    permissionTree.value = response.data || [
      {
        id: 'dashboard',
        label: '仪表盘',
        children: [
          { id: 'dashboard:view', label: '查看' }
        ]
      },
      {
        id: 'users',
        label: '用户管理',
        children: [
          { id: 'users:view', label: '查看' },
          { id: 'users:add', label: '新增' },
          { id: 'users:edit', label: '编辑' },
          { id: 'users:delete', label: '删除' }
        ]
      },
      {
        id: 'roles',
        label: '角色管理',
        children: [
          { id: 'roles:view', label: '查看' },
          { id: 'roles:add', label: '新增' },
          { id: 'roles:edit', label: '编辑' },
          { id: 'roles:delete', label: '删除' }
        ]
      },
      {
        id: 'permissions',
        label: '权限管理',
        children: [
          { id: 'permissions:view', label: '查看' },
          { id: 'permissions:add', label: '新增' },
          { id: 'permissions:edit', label: '编辑' },
          { id: 'permissions:delete', label: '删除' }
        ]
      },
      {
        id: 'statistics',
        label: '数据统计',
        children: [
          { id: 'statistics:view', label: '查看' }
        ]
      }
    ]
  } catch (error) {
    ElMessage.error('获取权限树失败')
    console.error('获取权限树失败:', error)
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchRoles()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  fetchRoles()
}

const handleAddRole = () => {
  dialogTitle.value = '新增角色'
  isEdit.value = false
  roleForm.id = ''
  roleForm.name = ''
  roleForm.description = ''
  roleForm.permissions = []
  dialogVisible.value = true
}

const handleEditRole = async (role) => {
  dialogTitle.value = '编辑角色'
  isEdit.value = true
  roleForm.id = role.id
  roleForm.name = role.name
  roleForm.description = role.description
  
  // 获取角色的权限
  try {
    const response = await roleApi.getRolePermissions(role.id)
    roleForm.permissions = response.data || []
  } catch (error) {
    ElMessage.error('获取角色权限失败')
    console.error('获取角色权限失败:', error)
  }
  
  dialogVisible.value = true
}

const handleDeleteRole = (id) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await roleApi.deleteRole(id)
      ElMessage.success('角色删除成功')
      fetchRoles()
    } catch (error) {
      ElMessage.error('删除角色失败')
      console.error('删除角色失败:', error)
    }
  }).catch(() => {
    // 取消删除
  })
}

const handleSubmit = async () => {
  roleFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          // 编辑角色
          await roleApi.updateRole(roleForm.id, roleForm)
          // 分配权限
          await roleApi.assignPermissions(roleForm.id, roleForm.permissions)
          ElMessage.success('角色编辑成功')
        } else {
          // 新增角色
          const response = await roleApi.createRole(roleForm)
          // 分配权限
          await roleApi.assignPermissions(response.id, roleForm.permissions)
          ElMessage.success('角色新增成功')
        }
        dialogVisible.value = false
        fetchRoles()
      } catch (error) {
        ElMessage.error(isEdit.value ? '编辑角色失败' : '新增角色失败')
        console.error(isEdit.value ? '编辑角色失败:' : '新增角色失败:', error)
      } finally {
        submitLoading.value = false
      }
    } else {
      return false
    }
  })
}
</script>

<style scoped>
.roles-container {
  width: 100%;
}

.roles-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.roles-table {
  margin-bottom: 20px;
}

.roles-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>