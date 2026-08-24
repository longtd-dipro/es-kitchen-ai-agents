export const meta = {
  name: 'bmad-build-phase',
  description: 'BMAD Build+Verify+Test phase — Dev (BE rồi FE/Mobile song song) → QA verify → QC (checklist + automation song song). Chạy sau khi bmad-plan-phase đã được user duyệt. Không bao gồm PM.',
  phases: [
    { title: 'Dev', detail: 'Backend trước (API Contract), Frontend/Mobile song song sau đó' },
    { title: 'QA', detail: 'Verify AC + coverage + non-regression' },
    { title: 'QC', detail: 'Execution checklist + E2E automation — song song' },
  ],
}

if (!args?.feature) {
  throw new Error('Thiếu args.feature — cần tên feature (kebab-case) để chạy pipeline')
}

phase('Dev')
const be = await agent(
  `Đọc .claude/agents/backend-agent.md rồi đóng vai Backend Developer, implement các task Phase 1→2 (DB migration + API) ` +
  `theo task files trong es-kitchen-docs/docs/features/${args.feature}/es-kitchen-api/tasks/. ` +
  `Output PHẢI kèm bảng API Contract đầy đủ (method, path, request, response).`,
  { agentType: 'backend-agent', label: 'backend-agent' }
)
log('Backend xong.')

const [fe, mobile] = await parallel([
  () =>
    agent(
      `Đọc .claude/agents/frontend-agent.md rồi đóng vai Frontend Developer cho feature "${args.feature}". ` +
      `Trước khi code, paste bảng API Contract sau vào section "## API Contract" của task file Phase 3 tương ứng ` +
      `(giữ đúng bước 5b trong AGENTS.md — FE không tự đoán endpoint), rồi mới implement theo Step1→Step2→Step3:\n${JSON.stringify(be)}`,
      { agentType: 'frontend-agent', label: 'frontend-agent', phase: 'Dev' }
    ),
  () =>
    agent(
      `Đọc .claude/agents/mobile-agent.md rồi đóng vai Mobile Developer cho feature "${args.feature}" ` +
      `(bỏ qua và trả về "no E01 scope" nếu feature không chạm es-kitchen-payment-app). ` +
      `Trước khi code, paste bảng API Contract sau vào section "## API Contract" của task file Phase 3 tương ứng, rồi mới implement:\n${JSON.stringify(be)}`,
      { agentType: 'mobile-agent', label: 'mobile-agent', phase: 'Dev' }
    ),
])

phase('QA')
const qa = await agent(
  `Đọc .claude/agents/qa-agent.md rồi đóng vai QA, verify toàn bộ task vừa implement cho feature "${args.feature}" — ` +
  `unit test, coverage, Acceptance Criteria, non-regression`,
  { agentType: 'qa-agent', label: 'qa-agent' }
)
log(qa?.status === 'FAIL' ? 'QA FAIL — cần dev fix và re-run trước khi release' : 'QA xong')

phase('QC')
const [checklist, automation] = await parallel([
  () =>
    agent(
      `Đọc .claude/agents/qc-agent.md rồi đóng vai QC, sinh test execution checklist trước release cho feature "${args.feature}"`,
      { agentType: 'qc-agent', label: 'qc-agent', phase: 'QC' }
    ),
  () =>
    agent(
      `Đọc .claude/agents/qc-automation-agent.md rồi đóng vai QC Automation, test feature "${args.feature}" bằng Playwright E2E (headed mode)`,
      { agentType: 'qc-automation-agent', label: 'qc-automation-agent', phase: 'QC' }
    ),
])

return { feature: args.feature, be, fe, mobile, qa, checklist, automation }
