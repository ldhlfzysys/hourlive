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
  Radio,
  RadioGroup,
} from 'ant-design-vue';

import { useAuthStore } from '#/store';

defineOptions({ name: 'Register' });

const router = useRouter();
const formRef = ref();
const authStore = useAuthStore();

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
  checkpass: '',
  password: '',
  user_type: 1,
});

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

      <p class="text-muted-foreground lg:text-md text-sm">
        {{ $t('authentication.signUpSubtitle') }}
      </p>
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
