export const APP_BASE_URL =
  process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export const URLS = {
  loginPage: '/web/index.php/auth/login',
  systemUsersPage: '/web/index.php/admin/viewSystemUsers',
  employeeCollection: '/web/index.php/api/v2/pim/employees',
  allEmployees: '/web/index.php/api/v2/pim/employees?limit=0',
  adminUsers: '/web/index.php/api/v2/admin/users',
  allAdminUsers: '/web/index.php/api/v2/admin/users?limit=0',
  vacancies: '/api/v2/recruitment/vacancies',
  employeeAttachments: '/screen/personal/attachments',
} as const;

export const PAGE_URL_PATTERNS = {
  dashboard: /dashboard/,
} as const;

export const UI_LABELS = {
  dashboard: 'Dashboard',
  login: 'Login',
  username: 'Username',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  systemUsers: 'System Users',
  editUser: 'Edit User',
  vacancies: 'Vacancies',
  attachments: 'Attachments',
  recruitment: 'Recruitment',
  myInfo: 'My Info',
  userRole: 'User Role',
  status: 'Status',
  jobTitle: 'Job Title',
  add: 'Add',
  save: 'Save',
  search: 'Search',
  reset: 'Reset',
  deleteConfirmation: 'Yes, Delete',
  employeeNamePlaceholder: 'Type for hints...',
  attachmentDescriptionPlaceholder: 'Type comment here',
} as const;

export const USER_ROLES = {
  ess: 'ESS',
} as const;

export const USER_STATUSES = {
  enabled: 'Enabled',
  disabled: 'Disabled',
} as const;

export type UserStatus = (typeof USER_STATUSES)[keyof typeof USER_STATUSES];

export const VACANCY_STATUSES = {
  active: 'Active',
  closed: 'Closed',
} as const;

export const DASHBOARD_WIDGET_SCENARIOS = [
  {
    title: 'Employee Distribution by Sub Unit',
    visibleLabel: 'Engineering',
    absentLabel: 'Texas R&D',
  },
  {
    title: 'Employee Distribution by Location',
    visibleLabel: 'Unassigned',
    absentLabel: 'Engineering',
  },
] as const;

export const HTTP_METHODS = {
  get: 'GET',
  post: 'POST',
} as const;

export const ACCESSIBILITY_ROLES = {
  alert: 'alert',
  button: 'button',
  cell: 'cell',
  columnheader: 'columnheader',
  heading: 'heading',
  link: 'link',
  option: 'option',
  row: 'row',
  textbox: 'textbox',
} as const;