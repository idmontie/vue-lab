import { mount, flushPromises } from '@vue/test-utils';
import { createPinia } from 'pinia';
import { expect, it, vi } from 'vitest';
import { router } from './router';
import App from './App.vue';

vi.stubGlobal('scrollTo', vi.fn());

it('shows the library, completes a migration lesson, and switches courses without leaking UI state', async () => {
  localStorage.clear();

  await router.push('/');
  const wrapper = mount(App, { global: { plugins: [createPinia(), router] } });
  await flushPromises();

  expect(wrapper.findAll('.library-course')).toHaveLength(2);

  await router.push('/courses/vue-2-to-3/sections/differences/lessons/what-changes');
  await flushPromises();
  expect(wrapper.get('h1').text()).toContain('What changes');

  const groups = wrapper.findAll('fieldset');
  await groups[0]!.get('input[value="1"]').setValue(true);
  await groups[1]!.get('input[value="0"]').setValue(true);
  await wrapper.get('form').trigger('submit');
  expect(wrapper.text()).toContain('Lesson complete');

  await wrapper.get('select').setValue('enterprise-vue');
  await flushPromises();
  await vi.waitFor(() => expect(wrapper.get('h1').text()).toContain('Think in Vue'));
  expect(wrapper.get('.progress-dial').text()).toBe('0%');

  await wrapper.get('select').setValue('vue-2-to-3');
  await flushPromises();
  await vi.waitFor(() => expect(wrapper.get('.progress-dial').text()).toBe('17%'));
  expect(wrapper.text()).toContain('0 of 3 sections complete');

  await router.push('/');
  await flushPromises();
  expect(wrapper.findAll('.library-course')).toHaveLength(2);
  expect(wrapper.findAll('.library-course')[1]!.text()).toContain('1 / 6 lessons complete');

  wrapper.unmount();
});
