import { render } from 'safetest/solid';
import { describe, test, expect } from 'safetest/vitest';

import { TodoList } from './todo-list';

describe('a test', () => {
  test('works', async () => {
    const { page } = await render(() => <div>test</div>);
    expect(page).toBeTruthy();
  });

  test('works2', async () => {
    const { page } = await render(() => <TodoList />);
    expect(page).toBeTruthy();
  });
});

describe('<TodoList />', () => {
  test('it will render an text input and a button', async () => {
    const { page } = await render(() => <TodoList />);
    await expect(page.getByPlaceholder('new todo here')).toBeVisible();
    await expect(page.getByText('Add Todo')).toBeVisible();
  });

  test('it will add a new todo', async () => {
    const { page } = await render();
    const input = page.getByPlaceholder('new todo here');
    const button = page.getByText('Add Todo');
    await input.evaluate(
      (el) => ((el as HTMLInputElement).value = 'test new todo')
    );
    await button.click();
    expect(await input.inputValue()).toBe('');
    await expect(page.getByText(/test new todo/)).toBeVisible();
  });

  test('it will mark a todo as completed', async () => {
    // const { page } = await render(() => <TodoList />);
    const { page } = await render(() => <div>test</div>);
    const input = page.getByPlaceholder('new todo here');
    const button = page.getByText('Add Todo');
    await input.evaluate(
      (el) => ((el as HTMLInputElement).value = 'mark new todo as completed')
    );
    await button.click();
    const completed = page.getByRole('checkbox');
    expect(
      await completed?.evaluate((el) => (el as HTMLInputElement).checked)
    ).toBe(false);
    await completed.click();
    expect(
      await completed?.evaluate((el) => (el as HTMLInputElement).checked)
    ).toBe(true);
    const text = page.getByText('mark new todo as completed');
    await expect(text).toHaveCSS('text-decoration', 'line-through');
  });
});
