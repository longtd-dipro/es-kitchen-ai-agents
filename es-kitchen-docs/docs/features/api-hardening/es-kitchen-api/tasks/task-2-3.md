# [BE] [Admin_Web] — NotificationService: Batch Pagination thay unbounded find

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 3h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Category `Admin_Web` vì notification publish là chức năng của Admin (E03). Tuy nhiên ảnh hưởng toàn bộ users (E01 Mobile nhận notification).

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Data Integrity + Testing |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-1, task-2-2 |
| Estimate | ~3h |

## Mục tiêu
Đổi `userRepo.find({ select: ['id'] })` unbounded (line 127) thành cursor pagination theo batch để tránh OOM khi user base lớn. Correctness không đổi, chỉ thay đổi cách load data vào memory.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 4.6, 6.3)
- File liên quan:
  - `src/modules/admin/services/notification.service.ts:110-160` — xem toàn bộ `publishMenuNotification()` để hiểu context của bước 2 (load users)
  - Xác nhận `userRepo` là `Repository<User>` với `select: ['id']` tại line 127

## Yêu cầu implement

### Sửa: `src/modules/admin/services/notification.service.ts`

**Thay thế block từ line 126 đến 141** (bước 2 — load all users + chunk insert):

```typescript
// TRƯỚC (line 126-141):
// const allUsers = await this.userRepo.find({ select: ['id'] });
// this.logger.log(`Assigning notification to ${allUsers.length} users.`);
// if (allUsers.length > 0) {
//   const userNotiData = allUsers.map(...)
//   const CHUNK_SIZE = 1000;
//   for (...) { await this.userNotificationRepo.insert(...) }
// }

// SAU — streaming batch để tránh load toàn bộ users vào memory:
const BATCH_SIZE = parseInt(process.env.NOTIFICATION_BATCH_SIZE ?? '1000', 10);
let skip = 0;
let hasMore = true;
let totalInserted = 0;

while (hasMore) {
  const batch = await this.userRepo.find({
    select: ['id'],
    take: BATCH_SIZE,
    skip,
  });

  if (batch.length === 0) break;
  hasMore = batch.length === BATCH_SIZE;

  const userNotiData = batch.map((user) => ({
    notificationId: notification.id,
    userId: user.id,
  }));

  await this.userNotificationRepo.insert(userNotiData);
  totalInserted += batch.length;

  this.logger.log(
    `Notification batch inserted: skip=${skip}, count=${batch.length}, total=${totalInserted}`,
  );

  skip += BATCH_SIZE;
}

this.logger.log(`Notification assigned to ${totalInserted} users total.`);
```

**Env var cần thêm vào AWS Parameter Store:**
```
NOTIFICATION_BATCH_SIZE=1000   # default
```

**Lưu ý về Step 3 (device tokens):** Bước 3 sau đó (`deviceNotifications` query) không thay đổi — nó join với `UserNotification` đã có `notificationId` nên không unbounded. Giữ nguyên bước 3.

**Performance note:** Batch insert 1000 records mỗi lần sẽ chậm hơn 1 bulk insert khi user ít (~100 users) nhưng an toàn khi user nhiều (~100k). Trade-off chấp nhận được theo DESIGN.

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/admin/services/notification.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { NotificationService } from './notification.service';
import { Notification } from '../../../entities/notification.entity';
import { UserNotification } from '../../../entities/user-notification.entity';
import { User } from '../../../entities/user.entity';
import { UserDevice } from '../../../entities/user-device.entity';
import { FcmService } from '../../../commons/utiliz/fcm-firebase/fcm.service';

describe('NotificationService.publishMenuNotification — batch pagination', () => {
  let service: NotificationService;
  let mockUserRepo: any;
  let mockUserNotiRepo: any;
  let mockNotificationRepo: any;

  beforeEach(async () => {
    mockNotificationRepo = {
      create: jest.fn().mockReturnValue({ id: 'notif-123' }),
      save: jest.fn().mockResolvedValue({ id: 'notif-123' }),
    };
    mockUserNotiRepo = {
      insert: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: getRepositoryToken(Notification), useValue: mockNotificationRepo },
        { provide: getRepositoryToken(UserNotification), useValue: mockUserNotiRepo },
        { provide: getRepositoryToken(User), useValue: {} },  // will override per test
        { provide: getRepositoryToken(UserDevice), useValue: createMock() },
        { provide: FcmService, useValue: createMock<FcmService>() },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    mockUserRepo = module.get(getRepositoryToken(User));
  });

  it('should call userRepo.find with take/skip on first batch', async () => {
    // Arrange: 1500 users → 2 batches
    const batch1 = Array.from({ length: 1000 }, (_, i) => ({ id: `user-${i}` }));
    const batch2 = Array.from({ length: 500 }, (_, i) => ({ id: `user-${1000 + i}` }));
    mockUserRepo.find = jest.fn()
      .mockResolvedValueOnce(batch1)
      .mockResolvedValueOnce(batch2)
      .mockResolvedValueOnce([]);  // empty → stop

    // Mock device tokens query
    (service as any).userDeviceRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }),
    };

    // Act
    await service.publishMenuNotification({
      title: 'Test Menu',
      content: 'Menu published',
      link: 'http://example.com',
      preViewLink: 'http://example.com/preview',
    });

    // Assert: insert called 2 times (batch1 + batch2)
    expect(mockUserNotiRepo.insert).toHaveBeenCalledTimes(2);
    expect(mockUserNotiRepo.insert.mock.calls[0][0]).toHaveLength(1000);
    expect(mockUserNotiRepo.insert.mock.calls[1][0]).toHaveLength(500);
  });

  it('should NOT load all users into memory at once (no unbounded find)', async () => {
    // This test verifies find() is always called with 'take' parameter
    mockUserRepo.find = jest.fn().mockResolvedValue([]);  // empty batch → exit immediately

    await service.publishMenuNotification({
      title: 'Test',
      content: 'Content',
      link: 'link',
      preViewLink: 'previewLink',
    });

    const findCalls = (mockUserRepo.find as jest.Mock).mock.calls;
    findCalls.forEach((call) => {
      expect(call[0]).toHaveProperty('take');
      expect(call[0]).toHaveProperty('skip');
    });
  });

  it('should handle 0 users gracefully', async () => {
    mockUserRepo.find = jest.fn().mockResolvedValue([]);

    await expect(
      service.publishMenuNotification({
        title: 'Empty',
        content: 'No users',
        link: '',
        preViewLink: '',
      }),
    ).resolves.not.toThrow();

    expect(mockUserNotiRepo.insert).not.toHaveBeenCalled();
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `notification.service.ts` | ≥ 80% |

**Verify:** `npm run test -- notification.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Notification publish (Admin E03) | `notification.service.ts:publishMenuNotification` | Publish notification → tất cả users nhận được (verify bằng count trong DB) |
| FCM push notification step | `notification.service.ts:160+` | Step 3 (device tokens) và FCM push vẫn hoạt động sau khi sửa step 2 |
| Mobile user nhận notification (E01) | `es-kitchen-payment-app` | FCM token vẫn được trigger (test manual trên device) |

## Không được làm
- Không thay đổi step 1 (tạo Notification record) hay step 3 (device token query)
- Không thay đổi FCM push logic
- Không giảm batch size xuống dưới 1000 — sẽ tăng số DB round-trips không cần thiết

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — 3 test cases (2 batches, take/skip verified, 0 users)
- [ ] Non-Regression verify đủ
- [ ] Manual test: publish notification với 10 users → tất cả 10 nhận được `UserNotification` record
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
