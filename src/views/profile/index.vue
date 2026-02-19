<template>
  <div class="profile-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>个人中心</h2>
      <p>管理您的个人信息、工作状态与系统偏好</p>
    </div>

    <div class="profile-container">
      <!-- 左侧：个人信息卡片 -->
      <div class="card info-card">
        <div class="avatar-section">
          <img :src="userInfo.avatar" alt="头像" class="avatar" />
          <div class="name-title">
            <h3>{{ userInfo.name }}</h3>
            <p>{{ userInfo.title }}</p>
          </div>
        </div>
        <div class="divider"></div>
        <div class="info-list">
          <div class="info-item">
            <span class="label">工号</span>
            <span class="value">{{ userInfo.employeeId }}</span>
          </div>
          <div class="info-item">
            <span class="label">负责网格</span>
            <span class="value">{{ userInfo.grid }}</span>
          </div>
          <div class="info-item">
            <span class="label">联系电话</span>
            <span class="value">{{ userInfo.phone }}</span>
          </div>
          <div class="info-item">
            <span class="label">电子邮箱</span>
            <span class="value">{{ userInfo.email }}</span>
          </div>
        </div>
        <button class="edit-btn" @click="openEditInfoModal">编辑个人信息</button>
      </div>

      <!-- 右侧：工作信息 + 系统设置 -->
      <div class="right-section">
        <!-- 工作信息卡片 -->
        <div class="card work-card">
          <h3>工作信息</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">{{ workStats.taskCompletion }}%</div>
              <div class="stat-label">任务完成率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ workStats.aiUsage }}</div>
              <div class="stat-label">AI工具使用次数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ workStats.documents }}</div>
              <div class="stat-label">生成材料数</div>
            </div>
          </div>
        </div>

        <!-- 系统设置卡片 -->
        <div class="card settings-card">
          <h3>系统设置</h3>
          <div class="settings-list">
            <div class="setting-item" @click="openChangePwdModal">
              <span>修改密码</span>
              <span class="arrow">></span>
            </div>
            <div class="setting-item" @click="handleNotificationSettings">
              <span>通知偏好</span>
              <span class="arrow">></span>
            </div>
            <div class="setting-item" @click="handleAccountSecurity">
              <span>账号安全</span>
              <span class="arrow">></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑个人信息弹窗 -->
    <teleport to="body">
      <div v-if="showEditInfoModal" class="modal-mask" @click="closeEditInfoModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3>编辑个人信息</h3>
            <button class="close-btn" @click="closeEditInfoModal">×</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitEditInfo">
              <div class="form-item">
                <label>姓名</label>
                <input 
                  v-model="editForm.name" 
                  type="text" 
                  placeholder="请输入姓名"
                  required
                />
              </div>
              <div class="form-item">
                <label>职务</label>
                <input 
                  v-model="editForm.title" 
                  type="text" 
                  placeholder="请输入职务"
                  required
                />
              </div>
              <div class="form-item">
                <label>负责网格</label>
                <input 
                  v-model="editForm.grid" 
                  type="text" 
                  placeholder="请输入负责网格"
                  required
                />
              </div>
              <div class="form-item">
                <label>联系电话</label>
                <input 
                  v-model="editForm.phone" 
                  type="tel" 
                  placeholder="请输入联系电话"
                  pattern="^1[3-9]\d{9}$"
                  required
                />
              </div>
              <div class="form-item">
                <label>电子邮箱</label>
                <input 
                  v-model="editForm.email" 
                  type="email" 
                  placeholder="请输入电子邮箱"
                  required
                />
              </div>
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="closeEditInfoModal">取消</button>
                <button type="submit" class="confirm-btn">保存修改</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </teleport>

    <!-- 修改密码弹窗 -->
    <teleport to="body">
      <div v-if="showChangePwdModal" class="modal-mask" @click="closeChangePwdModal">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3>修改密码</h3>
            <button class="close-btn" @click="closeChangePwdModal">×</button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitChangePwd">
              <div class="form-item">
                <label>原密码</label>
                <input 
                  v-model="pwdForm.oldPwd" 
                  type="password" 
                  placeholder="请输入原密码"
                  required
                />
              </div>
              <div class="form-item">
                <label>新密码</label>
                <input 
                  v-model="pwdForm.newPwd" 
                  type="password" 
                  placeholder="请输入新密码（8-20位，含字母和数字）"
                  pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$"
                  required
                />
              </div>
              <div class="form-item">
                <label>确认新密码</label>
                <input 
                  v-model="pwdForm.confirmPwd" 
                  type="password" 
                  placeholder="请再次输入新密码"
                  required
                />
              </div>
              <div class="form-actions">
                <button type="button" class="cancel-btn" @click="closeChangePwdModal">取消</button>
                <button type="submit" class="confirm-btn">确认修改</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
// 可以导入你的API请求函数
// import { updateUserInfo, changePassword } from '@/api/user';

// 定义类型
interface UserInfo {
  name: string;
  title: string;
  employeeId: string;
  grid: string;
  phone: string;
  email: string;
  avatar: string;
}

interface WorkStats {
  taskCompletion: number;
  aiUsage: number;
  documents: number;
}

interface EditForm {
  name: string;
  title: string;
  grid: string;
  phone: string;
  email: string;
}

interface PwdForm {
  oldPwd: string;
  newPwd: string;
  confirmPwd: string;
}

// 模拟数据
const userInfo = ref<UserInfo>({
  name: '张三',
  title: 'XX社区网格员',
  employeeId: 'GW2024001',
  grid: 'A区第3网格',
  phone: '138****1234',
  email: 'zhangsan@example.com',
  avatar: 'https://robohash.org/zhangsan?size=150x150'
});

const workStats = ref<WorkStats>({
  taskCompletion: 92,
  aiUsage: 156,
  documents: 89
});

// 弹窗控制
const showEditInfoModal = ref(false);
const showChangePwdModal = ref(false);

// 编辑信息表单
const editForm = ref<EditForm>({
  name: '',
  title: '',
  grid: '',
  phone: '',
  email: ''
});

// 修改密码表单
const pwdForm = ref<PwdForm>({
  oldPwd: '',
  newPwd: '',
  confirmPwd: ''
});

// 打开编辑信息弹窗
const openEditInfoModal = () => {
  // 初始化表单数据
  editForm.value = {
    name: userInfo.value.name,
    title: userInfo.value.title,
    grid: userInfo.value.grid,
    phone: userInfo.value.phone.replace(/\*/g, ''), // 去掉掩码
    email: userInfo.value.email
  };
  showEditInfoModal.value = true;
  // 禁止页面滚动
  document.body.style.overflow = 'hidden';
};

// 关闭编辑信息弹窗
const closeEditInfoModal = () => {
  showEditInfoModal.value = false;
  document.body.style.overflow = 'auto';
};

// 提交编辑信息
const submitEditInfo = async () => {
  try {
    // 1. 验证手机号格式
    const phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(editForm.value.phone)) {
      alert('请输入正确的手机号码！');
      return;
    }

    // 2. 调用API更新信息（实际项目中替换为真实接口）
    // const res = await updateUserInfo(editForm.value);
    // if (res.code === 200) {
      
      // 3. 更新本地数据
      userInfo.value = {
        ...userInfo.value,
        ...editForm.value,
        phone: editForm.value.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3') // 手机号掩码
      };
      
      alert('个人信息修改成功！');
      closeEditInfoModal();
    // }
    
  } catch (error) {
    console.error('修改个人信息失败：', error);
    alert('修改失败，请稍后重试！');
  }
};

// 打开修改密码弹窗
const openChangePwdModal = () => {
  // 重置表单
  pwdForm.value = {
    oldPwd: '',
    newPwd: '',
    confirmPwd: ''
  };
  showChangePwdModal.value = true;
  document.body.style.overflow = 'hidden';
};

// 关闭修改密码弹窗
const closeChangePwdModal = () => {
  showChangePwdModal.value = false;
  document.body.style.overflow = 'auto';
};

// 提交修改密码
const submitChangePwd = async () => {
  try {
    // 1. 验证密码
    if (pwdForm.value.newPwd !== pwdForm.value.confirmPwd) {
      alert('两次输入的新密码不一致！');
      return;
    }
    
    if (pwdForm.value.newPwd.length < 8) {
      alert('新密码长度不能少于8位！');
      return;
    }

    // 2. 调用API修改密码（实际项目中替换为真实接口）
    // const res = await changePassword({
    //   oldPassword: pwdForm.value.oldPwd,
    //   newPassword: pwdForm.value.newPwd
    // });
    // if (res.code === 200) {
      
      alert('密码修改成功，请重新登录！');
      closeChangePwdModal();
      // 这里可以跳转到登录页
      // router.push('/login');
    // }
    
  } catch (error) {
    console.error('修改密码失败：', error);
    alert('修改失败，原密码错误或系统异常！');
  }
};

// 其他设置项方法
const handleNotificationSettings = () => {
  alert('打开通知偏好设置');
};

const handleAccountSecurity = () => {
  alert('打开账号安全设置');
};

// 页面加载时初始化
onMounted(() => {
  // 模拟从后端获取用户信息
  // userInfo.value = await getUserInfo();
});

// 监听弹窗关闭，恢复页面滚动
watch([showEditInfoModal, showChangePwdModal], (values) => {
  if (!values[0] && !values[1]) {
    document.body.style.overflow = 'auto';
  }
});
</script>

<style scoped lang="less">
.profile-page {
  padding: 24px;
  max-width: 100%;
  height: 100%;
  background: var(--gray-50);

  .page-header {
    margin-bottom: 24px;
    h2 {
      font-size: 24px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 8px 0;
    }
    p {
      color: #6b7280;
      margin: 0;
    }
  }

  .profile-container {
    display: flex;
    gap: 24px;

    @media (max-width: 1024px) {
      flex-direction: column;
    }

    .card {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 24px;

      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 16px 0;
      }
    }

    // 左侧个人信息卡片
    .info-card {
      flex: 0 0 320px;
      display: flex;
      flex-direction: column;

      .avatar-section {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          object-fit: cover;
        }

        .name-title {
          h3 {
            font-size: 20px;
            margin: 0 0 4px 0;
          }
          p {
            color: #6b7280;
            margin: 0;
          }
        }
      }

      .divider {
        height: 1px;
        background: #e5e7eb;
        margin: 20px 0;
      }

      .info-list {
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;

          &:last-child {
            border-bottom: none;
          }

          .label {
            color: #6b7280;
          }

          .value {
            font-weight: 500;
            color: #1f2937;
          }
        }
      }

      .edit-btn {
        margin-top: auto;
        padding: 12px;
        background: #3b82f6;
        color: #fff;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: #2563eb;
        }
      }
    }

    // 右侧区域
    .right-section {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 24px;

      // 工作信息卡片
      .work-card {
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;

          .stat-item {
            text-align: center;
            padding: 20px;
            background: #f9fafb;
            border-radius: 8px;

            .stat-value {
              font-size: 28px;
              font-weight: 700;
              color: #3b82f6;
              margin-bottom: 8px;
            }

            .stat-label {
              color: #6b7280;
              font-size: 14px;
            }
          }
        }
      }

      // 系统设置卡片
      .settings-card {
        .settings-list {
          .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid #f3f4f6;
            cursor: pointer;
            transition: background 0.2s;

            &:hover {
              background: #f9fafb;
              border-radius: 8px;
              padding-left: 8px;
              padding-right: 8px;
            }

            &:last-child {
              border-bottom: none;
            }

            .arrow {
              color: #9ca3af;
              font-size: 18px;
            }
          }
        }
      }
    }
  }

  // 弹窗样式
  .modal-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  }

  .modal-container {
    width: 100%;
    max-width: 500px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);

    .modal-header {
      padding: 16px 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #6b7280;

        &:hover {
          color: #1f2937;
        }
      }
    }

    .modal-body {
      padding: 24px;

      .form-item {
        margin-bottom: 20px;

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #1f2937;
        }

        input {
          width: 100%;
          padding: 12px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;

          &:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
          }

          &:invalid {
            border-color: #ef4444;
          }
        }
      }

      .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;

        .cancel-btn {
          padding: 10px 20px;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;

          &:hover {
            background: #e5e7eb;
          }
        }

        .confirm-btn {
          padding: 10px 20px;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;

          &:hover {
            background: #2563eb;
          }
        }
      }
    }
  }
}
</style>