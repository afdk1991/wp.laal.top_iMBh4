<template>
  <div class="permissions-container">
    <el-card class="permissions-card">
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button type="primary" @click="handleAddPermission">
            <el-icon><Plus /></el-icon>
            新增权限
          </el-button>
        </div>
      </template>
      <div class="permissions-table">
        <el-table :data="permissions" style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="name" label="权限名称"></el-table-column>
          <el-table-column prop="code" label="权限代码"></el-table-column>
          <el-table-column prop="description" label="权限描述"></el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button type="primary" link @click="handleEditPermission(scope.row)">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="danger" link @click="handleDeletePermission(scope.row.id)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="permissions-pagination">
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

    <!-- 新增/编辑权限对话框 -->
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form :model="permissionForm" :rules="rules" ref="permissionFormRef">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称"></el-input>
        </el-form-item>
        <el-form-item label="权限代码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限代码"></el-input>
        </el-form-item>
        <el-form-item label="权限描述" prop="description">
          <el-input v-model="permissionForm.description" type="textarea" placeholder="请输入权限描述"></el-input>
        </el-form-item>
        <el-form-item label="父权限">
          <el-select v-model="permissionForm.parentId" placeholder="请选择父权限">
            <el-option label="无" value=""></el-option>
            <el-option
              v-for="permission in permissionOptions"
              :key="permission.id"
              :label="permission.name"
              :value="permission.id"
            ></el-option>
          </el-select>
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
import * as permissionApi from '../api/permission'

const permissions = ref([])
const loading = ref(false)
const submitLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const dialogVisible = ref(false)
const dialogTitle = ref('新增权限')
const isEdit = ref(false)
const permissionForm = reactive({
  id: '',
  name: '',
  code: '',
  description: '',
  parentId: ''
})

const rules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限代码', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入权限描述', trigger: 'blur' }
  ]
}

const permissionFormRef = ref(null)
const permissionOptions = ref([])

onMounted(() => {
  fetchPermissions()
  fetchPermissionOptions()
})

const fetchPermissions = async () => {
  loading.value = true
  try {
    const response = await permissionApi.getPermissions({
      page: currentPage.value,
      pageSize: pageSize.value
    })
    permissions.value = response.data || [
      { id: 1, name: '查看仪表盘', code: 'dashboard:view', description: '查看仪表盘权限', createdAt: '2026-01-01 00:00:00' },
      { id: 2, name: '查看用户', code: 'users:view', description: '查看用户权限', createdAt: '2026-01-01 00:00:00' },
      { id: 3, name: '新增用户', code: 'users:add', description: '新增用户权限', createdAt: '2026-01-01 00:00:00' },
      { id: 4, name: '编辑用户', code: 'users:edit', description: '编辑用户权限', createdAt: '2026-01-01 00:00:00' },
      { id: 5, name: '删除用户', code: 'users:delete', description: '删除用户权限', createdAt: '2026-01-01 00:00:00' }
    ]
    total.value = response.total || permissions.value.length
  } catch (error) {
    ElMessage.error('获取权限列表失败')
    console.error('获取权限列表失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchPermissionOptions = async () => {
  try {
    const response = await permissionApi.getPermissions()
    permissionOptions.value = response.data || []
  } catch (error) {
    ElMessage.error('获取权限选项失败')
    console.error('获取权限选项失败:', error)
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  fetchPermissions()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  fetchPermissions()
}

const handleAddPermission = () => {
  dialogTitle.value = '新增权限'
  isEdit.value = false
  permissionForm.id = ''
  permissionForm.name = ''
  permissionForm.code = ''
  permissionForm.description = ''
  permissionForm.parentId = ''
  dialogVisible.value = true
}

const handleEditPermission = (permission) => {
  dialogTitle.value = '编辑权限'
  isEdit.value = true
  permissionForm.id = permission.id
  permissionForm.name = permission.name
  permissionForm.code = permission.code
  permissionForm.description = permission.description
  permissionForm.parentId = permission.parentId || ''
  dialogVisible.value = true
}

const handleDeletePermission = (id) => {
  ElMessageBox.confirm('确定要删除该权限吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await permissionApi.deletePermission(id)
      ElMessage.success('权限删除成功')
      fetchPermissions()
    } catch (error) {
      ElMessage.error('删除权限失败')
      console.error('删除权限失败:', error)
    }
  }).catch(() => {
    // 取消删除
  })
}

const handleSubmit = async () => {
  permissionFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          // 编辑权限
          await permissionApi.updatePermission(permissionForm.id, permissionForm)
          ElMessage.success('权限编辑成功')
        } else {
          // 新增权限
          await permissionApi.createPermission(permissionForm)
          ElMessage.success('权限新增成功')
        }
        dialogVisible.value = false
        fetchPermissions()
        fetchPermissionOptions()
      } catch (error) {
        ElMessage.error(isEdit.value ? '编辑权限失败' : '新增权限失败')
        console.error(isEdit.value ? '编辑权限失败:' : '新增权限失败:', error)
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
.permissions-container {
  width: 100%;
}

.permissions-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.permissions-table {
  margin-bottom: 20px;
}

.permissions-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>