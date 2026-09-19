/**
 * Ánh xạ đường dẫn sang mục tương ứng trên sidebar.
 *
 * Các trang form (Add task, Add space, Edit task) không thuộc một mục cố định
 * nào - mục cần tô sáng phụ thuộc vào `returnTo` mà trang gọi truyền vào state.
 */

export const SIDEBAR_SECTION = {
    TASKS: 'tasks',
    PLANNED: 'planned',
    IMPORTANT: 'important',
    SPACES: 'spaces',
};

const PATH_PREFIXES = [
    { prefix: '/tasks', section: SIDEBAR_SECTION.TASKS },
    { prefix: '/planned', section: SIDEBAR_SECTION.PLANNED },
    { prefix: '/important', section: SIDEBAR_SECTION.IMPORTANT },
    { prefix: '/spaces', section: SIDEBAR_SECTION.SPACES },
    { prefix: '/space', section: SIDEBAR_SECTION.SPACES },
];

export function sectionFromPath(path) {
    if (!path) {
        return '';
    }

    const matchedPrefix = PATH_PREFIXES.find(({ prefix }) => path.startsWith(prefix));
    return matchedPrefix ? matchedPrefix.section : '';
}
