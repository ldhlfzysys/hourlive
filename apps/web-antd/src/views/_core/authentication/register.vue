<script lang="ts" setup>
import type { Rule } from 'ant-design-vue/es/form';

import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { $t } from '@vben/locales';

import {
  Button,
  Form,
  FormItem,
  Input,
  message,
  Radio,
  RadioGroup,
  Upload,
} from 'ant-design-vue';
import { Pencil } from 'lucide-vue-next';

import { useAuthStore } from '#/store';
import { useOSSFileStore } from '#/store/ossfile';

defineOptions({ name: 'Register' });

const router = useRouter();
const formRef = ref();
const authStore = useAuthStore();
const ossFileStore = useOSSFileStore();

// 校验表单
const validatePass = async (_rule: Rule, value: string) => {
  return value === formData.password
    ? Promise.resolve()
    : Promise.reject($t('authentication.confirmPasswordTip'));
};
const rules: Record<string, Rule[]> = {
  account: [
    {
      message: $t('authentication.usernameTip'),
      required: true,
      trigger: 'blur',
    },
  ],
  checkpass: [{ required: true, trigger: 'change', validator: validatePass }],
  password: [
    {
      message: $t('authentication.passwordTip'),
      required: true,
      trigger: 'change',
    },
  ],
  user_type: [
    {
      message: $t('user_type'),
      required: true,
      trigger: 'change',
      type: 'number',
    },
  ],
};

// 表单
const formData = reactive({
  account: '',
  avatar: '',
  checkpass: '',
  email: '',
  mobile: '',
  password: '',
  user_type: 1,
});

// 添加头像上传处理函数
const handleAvatarChange = async (info) => {
  const isImage = info.file.type.startsWith('image/');
  const isLt1M = info.file.size / 1024 / 1024 < 1;

  if (!isImage) {
    message.error('文件格式不正确，请上传图片文件');
    return;
  }

  if (!isLt1M) {
    message.error('图片大小不能超过10MB');
    return;
  }

  try {
    const result = await ossFileStore.uploadAvatarOnly(info.file);
    if (result && result.success) {
      formData.avatar = result.data;
    }
  } catch (error) {
    console.error('头像上传失败:', error);
  }
};

// 提交表单
async function handleSubmit() {
  formRef.value
    .validate()
    .then(async () => {
      await authStore.register(formData);
    })
    .catch(() => {});
}

function goToLogin() {
  router.push('/login');
}
</script>

<template>
  <div>
    <div class="mb-7 sm:mx-auto sm:w-full sm:max-w-md">
      <h2
        class="text-foreground mb-3 text-3xl font-bold leading-9 tracking-tight lg:text-4xl"
      >
        {{ $t('authentication.createAnAccount') }} 🚀
      </h2>

      <!-- <p class="text-muted-foreground lg:text-md text-sm">
        {{ $t('authentication.signUpSubtitle') }}
      </p> -->
    </div>

    <Form ref="formRef" :model="formData" :rules="rules">
      <FormItem name="account">
        <Input
          v-model:value="formData.account"
          :placeholder="$t('authentication.usernameTip')"
        />
      </FormItem>
      <FormItem name="password">
        <Input
          v-model:value="formData.password"
          :placeholder="$t('authentication.passwordTip')"
        />
      </FormItem>
      <FormItem name="checkpass">
        <Input
          v-model:value="formData.checkpass"
          :placeholder="$t('authentication.passwordTip')"
        />
      </FormItem>
      <FormItem class="enter-x" name="user_type">
        <RadioGroup v-model:value="formData.user_type">
          <Radio :value="1">{{ $t('agency') }}</Radio>
          <Radio :value="2">{{ $t('customer') }}</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem>
        <div class="mb-4 flex items-center gap-4">
          <Upload
            :before-upload="() => false"
            :show-upload-list="false"
            accept=".jpg, .jpeg, .png"
            @change="handleAvatarChange"
          >
            <div
              class="hover:border-primary group relative inline-block border border-dashed border-gray-300 p-2"
            >
              <img
                v-if="formData.avatar"
                :src="formData.avatar"
                alt="brand logo"
                class="max-h-10 w-auto object-contain"
              />
              <div v-else class="flex h-10 w-20 items-center justify-center">
                <Pencil class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Upload>
          <span class="text-sm text-gray-500">
            {{ $t('可选择上传品牌Logo，稍后可在个人中心修改') }}
          </span>
        </div>
      </FormItem>
      <FormItem>
        <Button
          :class="{
            'cursor-wait': authStore.registerLoading,
          }"
          :loading="authStore.registerLoading"
          class="mt-2 w-full"
          type="primary"
          @click="handleSubmit"
        >
          {{ $t('authentication.signUp') }}
        </Button>
      </FormItem>
    </Form>

    <div class="mt-4 text-center text-sm">
      {{ $t('authentication.alreadyHaveAccount') }}
      <span
        class="text-primary hover:text-primary-hover cursor-pointer text-sm font-normal"
        @click="goToLogin()"
      >
        {{ $t('authentication.goToLogin') }}
      </span>
    </div>
  </div>
</template>
