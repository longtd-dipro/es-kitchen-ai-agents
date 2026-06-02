# ESKITCHEN — AI Agent Policies

> **Canonical AI behavior policy** cho mọi sub-agent và session. File này always-loaded qua `CLAUDE.md`. Khi sửa policy → chỉ sửa file này, không sửa AGENTS.md.

---

## 1. Nguyên tắc cốt lõi (5 principles)

| Policy | Nội dung | Vi phạm sẽ |
|---|---|---|
| **Không đoán mò** | Khi thiếu thông tin → hỏi user, không tự bịa | Sinh ra docs/code sai → user phải sửa lại |
| **Đọc trước, hành động sau** | Luôn đọc docs liên quan + dùng `tilth_*` trước khi generate code/đề xuất | Đoán mò pattern, conflict với code hiện có |
| **Stateless** | Mỗi session độc lập — mọi context phải đọc từ file `.md` (không nhớ session trước) | Mất context, sai assumption |
| **Tool-first** | Bắt buộc dùng `tilth_search` / `tilth_read` / `tilth_files` thay vì grep/cat/find thủ công | Miss context, sai file |
| **Blast radius check** | BẮT BUỘC `tilth_deps` trước khi thay đổi bất kỳ interface/method public nào | Phá vỡ consumer khác, regression bug |

---

## 2. Phân quyền Action theo Persona

| Action | BA | Tech Lead (Design/Tasks) | PM | QC | QA | Dev (BE/FE/Mobile) |
|---|---|---|---|---|---|---|
| Tạo / sửa file `.md` | ✅ | ✅ | ✅ | ✅ | ✅ (chỉ QA Report) | ✅ |
| Sửa source code | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ (trong scope task) |
| Chạy test suite | ❌ | ❌ | ❌ | ✅ (manual TC) | ✅ (unit + coverage) | ✅ |
| Commit code | ❌ | ❌ | ❌ | ❌ | ❌ | ❌* |
| Push remote | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Sửa migration / linter / test config | ❌ | ❌ | ❌ | ❌ | ❌ | ❌** |

> \* Dev chỉ commit khi user yêu cầu rõ ràng.
> \*\* Dev không tự sửa migration / linter / test config — phải đề xuất với Tech Lead trước.

---

## 3. AI không được phép

- ❌ Tự `git commit` / `git push` khi không được yêu cầu
- ❌ `git push --force` lên `main` / `develop` trong mọi trường hợp
- ❌ Skip hooks bằng `--no-verify`, `--no-gpg-sign`
- ❌ Refactor ngoài scope task được giao
- ❌ Hard-code secret / API key / token trong code
- ❌ Bypass lint/test (`--no-verify`, `eslint-disable`, `@ts-ignore` không có lý do)
- ❌ Sửa linter config, test config, migration files, `.gitignore` khi không được yêu cầu rõ ràng
- ❌ Đoán mò tech stack — phải `tilth_search` xác nhận
- ❌ BA / Tech Lead / PM / QC / QA sửa source code (chỉ Dev được phép)
- ❌ Đọc context file ngoài role được phép (xem cột "Ai đọc" trong `AGENTS.md` → Context table)
- ❌ Search rộng toàn codebase khi không có lý do — chỉ tilth_search file/symbol cụ thể liên quan

---

## 4. Khi thiếu thông tin → BẮT BUỘC hỏi

Mỗi persona có checklist câu hỏi riêng trước khi hành động:

- **BA**: 10 câu hỏi trong `.claude/agents/ba-agent.md` Bước 2
- **Tech Lead Design**: Hỏi nếu SPEC không đủ rõ về AC, data model, integration
- **Tech Lead Tasks**: Hỏi nếu DESIGN còn mơ hồ về scope/file
- **PM**: 5 câu hỏi trong `.claude/agents/pm-agent.md` Bước 2 (deadline, dev available, dependency, deploy, QA)
- **Dev**: Hỏi nếu task không đủ context để implement trong 4–8h

**Không bao giờ tự giả định.** Thà hỏi 1 câu thừa còn hơn sinh ra docs/code sai phải undo.

---

## 5. Stack constraints (không thương lượng)

| Layer | Bắt buộc | Tuyệt đối không |
|---|---|---|
| Database | PostgreSQL + TypeORM | MySQL, MongoDB, SQLite, Prisma |
| API style | REST | GraphQL, gRPC, tRPC |
| Payment | elepay · Alipay · WeChat Pay | Stripe, PayPal, VNPay |
| Mobile state | `hooks_riverpod` 3.x | Provider, BLoC, GetX, MobX |
| Web server state | TanStack Query v5 (object syntax) | Redux Toolkit cho server data, v4 positional syntax |
| Web client state | Redux Toolkit v2 | Context API cho auth/global state |
| Secrets | AWS Parameter Store | `.env` production, hard-code |

Chi tiết version pinning → `.claude/rules/stack-constraints.md`.

---

## 6. Mobile version convention

```
DEV:  0.0.<build_number>
STG:  0.1.<build_number>
PROD: 1.0.<build_number>
```

Không đảo ngược, không bỏ qua STG để lên thẳng PROD.

---

## 7. Khi vi phạm bị phát hiện

1. **Dừng ngay** hành động đang làm
2. **Báo cáo** user về vi phạm cụ thể
3. **Hỏi** hướng xử lý (rollback / sửa / tiếp tục có điều kiện)
4. **Không tự ý** che giấu hoặc cố hoàn thành task bằng bypass

Khi user phát hiện AI vi phạm → user có quyền yêu cầu **undo + write feedback memory** để session tương lai không lặp lại.
