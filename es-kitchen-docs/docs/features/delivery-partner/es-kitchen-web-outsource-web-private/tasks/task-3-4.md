# [FE] [Delivery_Web] — Màn お知らせ詳細

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — ホーム
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 4h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | none — API đã có |
| Song song với | task-3-1, task-3-3 |
| Estimate | ~4h |

## Mục tiêu
Tạo màn chi tiết thông báo: badge loại, tiêu đề, thời điểm đăng, nội dung nhiều đoạn, nút `一覧に戻る`.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_ANNO_002` · node **`31498:190280`**

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-15
- **BE:** endpoint đã có, không cần chờ task BE nào

### 📂 File liên quan trong codebase
- `src/services/client/announcement.service.ts` — đã có
- `src/pages/dashboard/components/AnnouncementCard.tsx` — xem cách hiển thị loại thông báo hiện tại
- `src/constants/route.ts`, `src/routes/` — pattern `lazy()` + `withSuspense()`

## API Definition (copy từ BE — đã có sẵn)
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/notifications/:id` | — | `{ id, title, content, type, isImportant, isRead, createdAt, links[] }` |

**Base URL:** `import.meta.env.VITE_API_URL`

## Yêu cầu implement

### Step 1 — `src/services/client/announcement.service.ts`
```typescript
export const fetchAnnouncementById = async (id: string): Promise<AnnouncementDetail> => {
  const res: IBaseApiResponse<AnnouncementDetail> = await API.get(`/notifications/${id}`);
  return res.data;
};
```

### Step 2 — `src/hooks/useAnnouncements.ts`
```typescript
export const useAnnouncementDetail = (id: string) =>
  useQuery({ queryKey: ['announcement-detail', id], queryFn: () => fetchAnnouncementById(id), enabled: !!id });
```

### Step 3 — `src/pages/announcement/AnnouncementDetailPage.tsx`
- Breadcrumb `ホーム / ホーム / お知らせ詳細` (dùng `BaseHeadingBreadcrumb`)
- Badge loại + `投稿日時：YYYY年M月D日 HH:mm` góc phải
- Nội dung: giữ xuống dòng (`whitespace-pre-line`); nếu API trả HTML thì **sanitize trước khi render**
- Nút `一覧に戻る` → quay lại `/dashboard`
- Thêm `ANNOUNCEMENT_DETAIL: "/announcements/:id"` vào `constants/route.ts` + đăng ký route lazy

## Unit Tests (BẮT BUỘC)
### `src/pages/announcement/AnnouncementDetailPage.test.tsx`
```typescript
it('renders title, badge and posted datetime from the API', ...);
it('shows a loading state while fetching', ...);
it('shows an error state when the request fails', ...);
it('navigates back to the dashboard on 一覧に戻る', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage Announcement`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Từ dashboard bấm 1 thông báo → mở đúng chi tiết, dữ liệu thật từ API
- [ ] Reload trực tiếp URL `/announcements/:id` vẫn hiển thị đúng
- [ ] ID không tồn tại → hiển thị lỗi, không crash

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Dashboard hiện tại | `pages/dashboard/DashboardPage.tsx` | Danh sách thông báo vẫn hiển thị bình thường |
| Router | `src/routes/` | Các route cũ vẫn vào được |

## Không được làm
- Không `dangerouslySetInnerHTML` khi chưa sanitize
- Không tự đánh dấu đã đọc ở FE — BE tự set khi GET detail
- Không hard-code URL API

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
