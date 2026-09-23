const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, imports) {
  const source = fs.readFileSync(file, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(output, { exports, require: (name) => {
    assert.ok(name in imports, `Unexpected import: ${name}`);
    return imports[name];
  }});
  return exports;
}
const category = load('src/lib/exam-category.ts', {});
const subscriptionAccess = load('src/lib/subscription-access.ts', {});

test('active paid access takes precedence over a professional trial for the current exam', () => {
  const subscriptions = [
    { examTypeId: 'exam-a', status: 'ACTIVE', paymentMethod: 'PAYSTACK' },
    { examTypeId: 'exam-b', status: 'ACTIVE', paymentMethod: 'TRIAL' },
  ];

  assert.equal(
    subscriptionAccess.findActivePaidSubscription(subscriptions, 'exam-a'),
    subscriptions[0],
  );
  assert.equal(
    subscriptionAccess.findActivePaidSubscription(subscriptions, 'exam-b'),
    undefined,
  );
  assert.equal(
    subscriptionAccess.findActivePaidSubscription(subscriptions, 'exam-c'),
    undefined,
  );
});

test('banner selects professional mode only after exam preferences resolve', () => {
  let preferences;
  const academic = () => {};
  const professional = () => {};
  const { default: Banner } = load('src/feature/home/components/free-trial-banner.tsx', {
    'react/jsx-runtime': { jsx: (type) => ({ type }) },
    '@/feature/exams/hooks': { useExamPreferences: () => preferences },
    '@/lib/exam-category': category,
    './academic-trial-banner': { default: academic },
    './professional-trial-banner': { default: professional },
  });
  preferences = { isLoading: true };
  assert.equal(Banner(), null);
  preferences = { isError: true };
  assert.equal(Banner(), null);
  for (const examCategory of ['SECONDARY_SCHOOL', 'POST_UTME', 'UNIVERSITY_COURSE']) {
    preferences = { data: { examCategory } };
    assert.equal(Banner().type, academic);
  }
  for (const examCategory of ['PROFESSIONAL', 'PROFESSIONAL_EXAMS']) {
    preferences = { data: { examCategory } };
    assert.equal(Banner().type, professional);
  }
});

test('checkout saves academic subjects and activates a subscription; professional uses only its entitlement API', async () => {
  const source = fs.readFileSync('src/routes/_auth/checkout.tsx', 'utf8');
  const start = source.indexOf('  const handleStartTrial = async () => {');
  const end = source.indexOf('\n  const handleSkip', start);
  const handler = source.slice(start, end);
  for (const isProfessional of [false, true]) {
    const calls = [];
    const context = {
      isProfessional, studentId: 'student', isAuthenticated: true,
      registrationData: { examTypeId: 'exam', subjects: ['subject'] },
      plans: [{ id: 'plan' }], selectedPlanId: null,
      saveExamSelection: { mutateAsync: async () => calls.push('save-subjects') },
      academicTrialMutation: { mutateAsync: async (body) => {
        calls.push(['academic', body.subscriptionId]); return { success: true };
      } },
      activateTrialMutation: { mutateAsync: async (id) => {
        calls.push(['professional', id]); return { status: 'ACTIVE', entitlementId: 'entitlement' };
      } },
      toast: { success() {}, error(message) { throw Error(message); } },
      setTrialStarted(value) { assert.equal(value, true); },
      navigationTimerRef: {}, setTimeout() {}, resetRegistration() {}, navigate() {},
    };
    const compiled = ts.transpileModule(handler + '\n handleStartTrial();', {
      compilerOptions: { target: ts.ScriptTarget.ES2022 },
    }).outputText;
    await vm.runInNewContext(compiled, context);
    assert.deepEqual(calls, isProfessional
      ? [['professional', 'exam']]
      : ['save-subjects', ['academic', 'plan']]);
  }
});

test('academic tests page omits trial dashboard while professional page includes it', () => {
  let preferences;
  let subscriptions = [];
  const TrialDashboard = () => {};
  const jsx = (type, props) => ({ type, props });
  const { Route } = load('src/routes/_user/tests/exams.tsx', {
    'react/jsx-runtime': { jsx, jsxs: jsx },
    react: { useState: () => ['', () => {}] },
    '@tanstack/react-router': { createFileRoute: () => (options) => options, Link: 'Link' },
    'lucide-react': { Layers: 'Layers', ChevronRight: 'ChevronRight' },
    '@/components/global/custom-page-header': { default: 'Header' },
    '@/feature/tests/components/exams/subjects': { default: 'Subjects' },
    '@/feature/tests/components/exams/trial-dashboard': { default: TrialDashboard },
    '@/feature/subscription/hooks/useSubscription': {
      useSubscriptions: () => ({ data: subscriptions, isPending: false }),
    },
    '@/lib/subscription-access': subscriptionAccess,
    '@/lib/exam-category': category,
    '@/feature/exams/hooks': {
      useExamPreferences: () => ({ data: preferences }),
      useProfessionalHierarchy() {}, useAvailableExams() {},
    },
  });
  function containsTrial(node) {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(containsTrial);
    return node.type === TrialDashboard || containsTrial(node.props?.children);
  }
  function containsSimulation(node) {
    if (!node || typeof node !== 'object') return false;
    if (Array.isArray(node)) return node.some(containsSimulation);
    return node.type === 'Link' && node.props?.to === '/mock-exam/setup'
      || containsSimulation(node.props?.children);
  }
  for (const examCategory of ['SECONDARY_SCHOOL', 'PROFESSIONAL', 'POST_UTME']) {
    preferences = { examCategory, examTypeId: 'exam' };
    const page = Route.component();
    assert.equal(containsTrial(page), examCategory === 'PROFESSIONAL');
    assert.equal(containsSimulation(page), examCategory !== 'PROFESSIONAL');
  }

  preferences = { examCategory: 'PROFESSIONAL_EXAMS', examTypeId: 'exam' };
  subscriptions = [
    { examTypeId: 'exam', status: 'ACTIVE', paymentMethod: 'PAYSTACK' },
  ];
  const paidProfessionalPage = Route.component();
  assert.equal(containsTrial(paidProfessionalPage), false);
  assert.equal(containsSimulation(paidProfessionalPage), true);
});

test('home always places rank before trial and subscription messaging', () => {
  const source = fs.readFileSync('src/routes/_user/index.tsx', 'utf8');
  assert.ok(source.indexOf('<Stat />') < source.indexOf('<FreeTrialBanner />'));
  assert.doesNotMatch(source, /activeTrial/);
});

test('professional test cards describe curriculum instead of zero subjects', () => {
  const source = fs.readFileSync('src/routes/_user/tests/index.tsx', 'utf8');
  assert.match(source, /Full professional curriculum/);
  assert.match(source, /isProfessionalExam\(data\?\.examCategory\)/);
});

test('professional subscription cards use plan names and full curriculum copy', () => {
  const source = fs.readFileSync('src/feature/subscription/subscription-section.tsx', 'utf8');
  assert.match(source, /sub\.subscription\.name/);
  assert.match(source, /Full professional curriculum/);
  assert.match(source, /ProfessionalTrialSubscriptionCard/);
  assert.match(source, /!professionalSubscription/);
});

test('payment verification refreshes all professional access queries', () => {
  const source = fs.readFileSync('src/feature/payment/hooks/usePayment.ts', 'utf8');
  const start = source.indexOf('export const useVerifyPayment');
  const end = source.indexOf('// Redeem license code', start);
  const verifyHook = source.slice(start, end);

  for (const key of [
    'profile',
    'subscriptions',
    'examPreferences',
    'trialAvailability',
    'availableExams',
  ]) {
    assert.match(verifyHook, new RegExp(`queryKey: \\\[\\\"${key}\\\"\\\]`));
  }
  assert.match(verifyHook, /professional-hierarchy/);
});

test('shared runner routes pause and resume professional trials through the entitlement API', () => {
  const endpoints = fs.readFileSync('src/api/endpoints.ts', 'utf8');
  const hooks = fs.readFileSync('src/feature/exams/hooks/useExams.ts', 'utf8');
  const runner = fs.readFileSync('src/routes/_user/exam.$attemptId.tsx', 'utf8');

  assert.match(endpoints, /PAUSE: \(entitlementId: string, attemptId: string\)/);
  assert.match(endpoints, /RESUME: \(entitlementId: string, attemptId: string\)/);
  assert.match(hooks, /TRIAL_ENDPOINTS\.PAUSE\(entitlementId, attemptId\)/);
  assert.match(hooks, /TRIAL_ENDPOINTS\.RESUME\(entitlementId, attemptId\)/);
  assert.match(runner, /usePauseExam\(isTrial, entitlementId\)/);
  assert.match(runner, /useResumeExam\(isTrial, entitlementId\)/);
});

test('academic practice errors do not instruct users to use free trial practice', () => {
  const source = fs.readFileSync('src/feature/exams/hooks/useExams.ts', 'utf8');
  assert.doesNotMatch(source, /Free trial practice is only available/);
  assert.match(source, /Practice is only available for \$\{year\} questions/);
});

test("payment plans use UUIDs for professional exams and names for academic exams", () => {
  const hook = fs.readFileSync("src/feature/payment/hooks/usePayment.ts", "utf8");
  assert.match(hook, /if \(isProfessionalExam\(schoolType\)\) \{\s+return \{ examTypeId \};/);
  assert.match(hook, /return \{\s+schoolType,\s+examType,\s+subscriptionType,/);
  assert.match(hook, /\.\.\.\(departmentId \? \{ departmentId \} : \{\}\)/);

  for (const file of [
    "src/routes/_auth/checkout.tsx",
    "src/routes/_user/subscription.add.tsx",
    "src/routes/_user/subscription.upgrade.tsx",
  ]) {
    const caller = fs.readFileSync(file, "utf8");
    assert.match(caller, /usePaymentPlans\(\{/);
    assert.match(caller, /examTypeId/);
  }
});
