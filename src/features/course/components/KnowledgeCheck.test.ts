import { mount } from '@vue/test-utils';
import { expect, it } from 'vitest';
import { course } from '../content/course';
import KnowledgeCheck from './KnowledgeCheck.vue';

it('requires selections, gives feedback, and supports a corrected retry', async () => {
  const lesson = course.sections[0]!.lessons[0]!;
  const wrapper = mount(KnowledgeCheck, { props: { lesson, saved: {} } });

  expect(wrapper.get('button').attributes('disabled')).toBeDefined();

  await wrapper.get('input[value="0"]').setValue(true);
  await wrapper.get('input[value="a"]').setValue(true);
  await wrapper.get('form').trigger('submit');

  expect(wrapper.emitted('submit')![0]![0]).toEqual({
    'reactive-graph-check': '0',
    'setup-lifetime': 'a',
  });

  await wrapper.setProps({ saved: { 'setup-lifetime': 'a' } });
  expect(wrapper.text()).toContain('Not quite');

  await wrapper.get('input[value="1"]').setValue(true);
  await wrapper.get('form').trigger('submit');
  await wrapper.setProps({ saved: { 'reactive-graph-check': '1', 'setup-lifetime': 'a' } });

  expect(wrapper.text()).toContain('Lesson complete');
  expect(wrapper.find('button').exists()).toBe(false);

  wrapper.unmount();
});
