import { BadRequestException, ConflictException } from '@nestjs/common';
import { LoanRequestsService } from './loan-requests.service';
import { LoanRequestStatus } from '../common/enums/loan-request-status.enum';
import { Role } from '../common/enums/role.enum';

describe('LoanRequestsService approval authority', () => {
  let service: LoanRequestsService;
  let requests: { findOne: jest.Mock; save: jest.Mock };

  beforeEach(() => {
    requests = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    service = new LoanRequestsService(
      requests as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );
  });

  it.each([Role.BAUM_STAFF, Role.KABAG_UMUM])(
    'allows %s to approve a processed request',
    async (role) => {
      const request = {
        id: 'request-id',
        status: LoanRequestStatus.DIPROSES_BAUM,
        rejectionReason: null,
      };
      requests.findOne.mockResolvedValue(request);
      requests.save.mockResolvedValue(request);

      const result = await service.transition(
        request.id,
        'actor-id',
        role,
        'approve',
      );

      expect(result.status).toBe(LoanRequestStatus.DISETUJUI);
      expect(requests.save).toHaveBeenCalledWith(request);
    },
  );

  it.each([Role.BAUM_STAFF, Role.KABAG_UMUM])(
    'allows %s to reject with a reason',
    async (role) => {
      const request = {
        id: 'request-id',
        status: LoanRequestStatus.DIPROSES_BAUM,
        rejectionReason: null,
      };
      requests.findOne.mockResolvedValue(request);
      requests.save.mockResolvedValue(request);

      const result = await service.transition(
        request.id,
        'actor-id',
        role,
        'reject',
        ' Dokumen belum sesuai. ',
      );

      expect(result.status).toBe(LoanRequestStatus.DITOLAK);
      expect(result.rejectionReason).toBe('Dokumen belum sesuai.');
    },
  );

  it('does not allow a non-approver to approve', async () => {
    const request = {
      id: 'request-id',
      status: LoanRequestStatus.DIPROSES_BAUM,
      rejectionReason: null,
    };
    requests.findOne.mockResolvedValue(request);

    await expect(
      service.transition(request.id, 'actor-id', Role.TU, 'approve'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('requires a reason when BAUM rejects', async () => {
    const request = {
      id: 'request-id',
      status: LoanRequestStatus.DIPROSES_BAUM,
      rejectionReason: null,
    };
    requests.findOne.mockResolvedValue(request);

    await expect(
      service.transition(request.id, 'actor-id', Role.BAUM_STAFF, 'reject'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
